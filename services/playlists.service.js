const tracksRepository = require('../db/repositories/tracks.repository')
const playlistsRepository = require('../db/repositories/playlists.repository')
const userSettingsRepository = require('../db/repositories/userSettings.repository')
const { likedPlaylistId, dislikedPlaylistId, mainPlaylistId, getPlaylistImagesDir } = require('../constants/constants')
const { getDatabase } = require('../db/database')
const { deleteImageByFileNameAsync, deleteImagesByFileNameAsync, savePlaylistImageAndReturnFileAsync, copyImageAsync, deleteTracksByAbsolutePathAsync } = require('../helpers/service.helpers')
const { dialog } = require('electron')
const fs = require('fs/promises')
const path = require('path')
const mm = require('music-metadata')
const { saveCoverAndReturnFileAsync } = require('../helpers/service.helpers')

const JSON_DATA_FILE = 'playlist.json'

async function createPlaylist(name, absolutePath) {

    const newPlaylist = playlistsRepository.create(name)

    const image = await savePlaylistImageAndReturnFileAsync(newPlaylist.id, absolutePath)

    playlistsRepository.updateImage(newPlaylist.id, image)

    return { id: newPlaylist.id, name: newPlaylist.name, image: image, tracksCount: 0 }
}

async function updatePlaylist(playlistId, name, absolutePath) {

    playlistsRepository.updateName(playlistId, name)

    let updatedImage = null

    if (absolutePath) {
        const currentPlaylist = playlistsRepository.getById(playlistId)
        await deleteImageByFileNameAsync(currentPlaylist.image, 'playlist')

        updatedImage = await savePlaylistImageAndReturnFileAsync(playlistId, absolutePath)
        playlistsRepository.updateImage(playlistId, updatedImage)
    }

    return { updatedName: name, updatedImage }
}

function addToPlaylist(playlistId, trackId) {
    const db = getDatabase()

    const executeTransaction = db.transaction(() => {
        const maxPositionInPlaylist = playlistsRepository.getMaxPositionInPlaylist(playlistId)
        const trackPosition = maxPositionInPlaylist + 1

        playlistsRepository.addTrackToPlaylist(playlistId, trackId, trackPosition)
    })

    executeTransaction()
}

function addToLiked(trackId) {
    const db = getDatabase()

    const executeTransaction = db.transaction(() => {
        deleteFromDisliked(trackId)

        const maxPositionInPlaylist = playlistsRepository.getMaxPositionInPlaylist(likedPlaylistId)
        const trackPosition = maxPositionInPlaylist + 1

        playlistsRepository.addTrackToPlaylist(likedPlaylistId, trackId, trackPosition)
        tracksRepository.updateStatusParameters(trackId, 'is_liked', 1)
    })
    executeTransaction()
}

function addToDisliked(trackId) {
    const db = getDatabase()

    const executeTransaction = db.transaction(() => {
        deleteFromLiked(trackId)

        const maxPositionInPlaylist = playlistsRepository.getMaxPositionInPlaylist(dislikedPlaylistId)
        const trackPosition = maxPositionInPlaylist + 1

        playlistsRepository.addTrackToPlaylist(dislikedPlaylistId, trackId, trackPosition)
        tracksRepository.updateStatusParameters(trackId, 'is_disliked', 1)
    })

    executeTransaction()
}

function deleteFromLiked(trackId) {
    const db = getDatabase()

    const executeTransaction = db.transaction(() => {
        playlistsRepository.deleteTrackFromPlaylist(likedPlaylistId, trackId)
        tracksRepository.updateStatusParameters(trackId, 'is_liked', 0)
    })

    executeTransaction()
}

function deleteFromDisliked(trackId) {
    const db = getDatabase()

    const executeTransaction = db.transaction(() => {
        playlistsRepository.deleteTrackFromPlaylist(dislikedPlaylistId, trackId)
        tracksRepository.updateStatusParameters(trackId, 'is_disliked', 0)
    })

    executeTransaction()
}

async function deleteFromPlaylist(track, playlistId) {
    try {
        const db = getDatabase()

        const executeTransaction = db.transaction(() => {
            const trackId = track.id
            // const playlistId = track.playlist_id

            playlistsRepository.deleteTrackFromPlaylist(playlistId, trackId)

            if (playlistId === likedPlaylistId) {
                tracksRepository.updateStatusParameters(trackId, 'is_liked', 0)
            }
            if (playlistId === dislikedPlaylistId) {
                tracksRepository.updateStatusParameters(trackId, 'is_disliked', 0)
            }

            if (!playlistsRepository.isTrackInAnyPlaylist(trackId)) {
                tracksRepository.deleteTrack(trackId)
                return true
            }

            return false
        })

        const isTrackFullyDeleted = executeTransaction()

        if (isTrackFullyDeleted && track.cover) {
            await deleteImageByFileNameAsync(track.cover, 'track')
        }
    } catch (error) {
        console.error('[Main process]: playlistst.serivce.js deleteFromPlaylist:', error)
    }

}

async function exportPlaylist(event, playlistId) {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
        title: 'Choose Folder'
    })

    const { canceled, filePaths } = result

    if (canceled || filePaths.length <= 0) {
        return []
    }

    const targetFolder = filePaths[0]

    const tracks = tracksRepository.getAllForPlaylist(playlistId)
    const playlist = playlistsRepository.getById(playlistId)

    if (!tracks || tracks.length === 0) {
        return { success: true, count: 0 }
    }

    const total = tracks.length
    let copiedCount = 0

    const tracksExportData = []

    if (event?.sender) {
        event.sender.send('system:loadProgress', { loaded: 0, total })
    }

    for (const track of tracks) {
        const sourcePath = track.absolute_path
        if (!sourcePath) continue

        try {
            await fs.access(sourcePath)

            let originalFileName = path.basename(sourcePath)
            let destinationPath = path.join(targetFolder, originalFileName)

            let counter = 1
            const ext = path.extname(originalFileName)
            const nameWithoutExt = path.basename(originalFileName, ext)

            while (true) {
                try {
                    await fs.access(destinationPath)
                    const newFileName = `${nameWithoutExt} (${counter})${ext}`
                    destinationPath = path.join(targetFolder, newFileName)
                    counter++
                } catch {
                    break
                }
            }
            await fs.copyFile(sourcePath, destinationPath)
            copiedCount++

            tracksExportData.push({
                name: path.basename(destinationPath),
                track_position: track.track_position,
                is_liked: track.is_liked,
                is_disliked: track.is_disliked,
                is_marked: track.is_marked
            })

        } catch (error) {
            console.error(`[Main process]: exportPlaylist ${sourcePath}:`, error)
        }

        if (playlist?.image) {
            const sourcePlaylistImagePath = path.join(getPlaylistImagesDir(), playlist.image)
            const destinationPlaylistImagePath = path.join(targetFolder, playlist.image)
            await copyImageAsync(sourcePlaylistImagePath, destinationPlaylistImagePath)
        }

        const exportData = {
            playlist: playlist,
            tracks: tracksExportData
        }

        await fs.writeFile(
            path.join(targetFolder, JSON_DATA_FILE),
            JSON.stringify(exportData, null, 2),
            'utf-8'
        )

        if (event?.sender) {
            event.sender.send('system:loadProgress', { loaded: copiedCount, total })
        }
    }

    return { success: true, count: copiedCount }
}

async function importPlaylist(event) {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Import playlist'
    })

    const { canceled, filePaths } = result

    if (canceled || filePaths.length <= 0) {
        return []
    }

    const importFolder = filePaths[0]
    const jsonPath = path.join(importFolder, JSON_DATA_FILE)

    const playlistData = JSON.parse(await fs.readFile(jsonPath, 'utf-8'))

    const { playlist, tracks } = playlistData

    let playlistId = playlist.id

    if (!playlistsRepository.isPlaylistExists(playlistId)) {
        const createdPlaylist = playlistsRepository.create(playlist.name, playlist.image)
        playlistId = createdPlaylist.id

        if (playlist?.image) {

            const sourcePlaylistImagePath = path.join(importFolder, playlist.image)
            const destinationPlaylistImagePath = path.join(getPlaylistImagesDir(), playlist.image)

            playlistsRepository.updateImage(playlistId, playlist.image)
            await copyImageAsync(sourcePlaylistImagePath, destinationPlaylistImagePath)
        }
    }

    const total = tracks?.length || 0
    let processedCount = 0

    if (event?.sender) {
        event.sender.send('system:loadProgress', { loaded: 0, total })
    }

    const importedTracks = []
    let isLikedCount = 0
    let isDislikedCount = 0

    for (const track of tracks) {
        const absolutePath = path.join(importFolder, track.name)

        try {
            await fs.access(absolutePath)
        } catch {
            console.warn(`[Main process]: importPlaylist: file not found: ${absolutePath}`)
            continue
        }

        const isLiked = track.is_liked === 1
        const isDisliked = track.is_disliked === 1

        try {
            const metadata = await mm.parseFile(absolutePath)
            const { common, format } = metadata

            const trackObj = {
                absolutePath: absolutePath,
                duration: format.duration ?? 0,
                name: common.title ?? track.name,
                author: (common.artist || common.albumartist) ?? 'Unknown'
            }

            const newTrack = tracksRepository.create(trackObj)

            const coverBuffer = common.picture?.length > 0 ? common.picture[0].data : null

            let cover = null
            if (coverBuffer !== null) {
                cover = await saveCoverAndReturnFileAsync(newTrack.id, coverBuffer)
                tracksRepository.updateCover(newTrack.id, cover)
            }

            playlistsRepository.addTrackToPlaylist(playlistId, newTrack.id, track.track_position)

            if (isLiked) {
                addToLiked(newTrack.id)
                isLikedCount++
            }

            if (isDisliked) {
                addToDisliked(newTrack.id)
                isDislikedCount++
            }

            importedTracks.push({
                id: newTrack.id,
                absolute_path: newTrack.absolutePath,
                duration: newTrack.duration,
                name: newTrack.name,
                author: newTrack.author,
                cover: cover,
                playlist_id: playlistId,
                track_position: track.track_position,
                is_liked: track.is_liked,
                is_disliked: track.is_disliked,
                is_marked: track.is_marked,
                playlist_ids: [playlistId]
            })
        } catch (error) {
            console.error(`[Main process]: Metadata parse error for ${absolutePath}:`, error.message)
        }
        finally {
            processedCount++
            if (event?.sender) {
                event.sender.send('system:loadProgress', { loaded: processedCount, total })
            }
        }
    }

    importedTracks.sort((a, b) => b.track_position - a.track_position)

    return { tracks: importedTracks, playlist: { id: playlistId, name: playlist.name, image: playlist?.image, tracks_count: importedTracks.length }, isLikedCount: isLikedCount, isDislikedCount: isDislikedCount }
}

async function deletePlaylist(playlist) {
    const db = getDatabase()

    const playlistId = playlist.id
    const isDeleteDislikedTracksFromSystemEnabled = userSettingsRepository.getIsDeleteDislikedTracksFromSystemEnabledValue()

    let trackCoversToDelete = []
    let trackAbsolutePathsToDelete = []

    const executeTransaction = db.transaction(() => {
        if (playlistId === dislikedPlaylistId) {
            if (isDeleteDislikedTracksFromSystemEnabled) {
                const deletedTracks = tracksRepository.deleteDislikedTracks()
                trackCoversToDelete = deletedTracks.map(t => t.cover).filter(Boolean)
                trackAbsolutePathsToDelete = deletedTracks.map(t => t.absolute_path).filter(Boolean)
            } else {
                playlistsRepository.deleteFromPlaylistsTracks(playlistId)
                tracksRepository.resetIsDislikedStatus()
            }
        }
        else if (playlistId === likedPlaylistId) {
            playlistsRepository.deleteFromPlaylistsTracks(playlistId)
            tracksRepository.resetIsLikedStatus()
        }
        else if (playlistId === mainPlaylistId) {
            playlistsRepository.deleteFromPlaylistsTracks(playlistId)
            trackCoversToDelete = tracksRepository.deleteOrphanTracks()
        }
        else {
            playlistsRepository.deleteFromPlaylistsTracks(playlistId)
            playlistsRepository.deletePlaylist(playlistId)
            trackCoversToDelete = tracksRepository.deleteOrphanTracks(playlistId)
        }
    })

    executeTransaction()

    if (playlist.image) {
        await deleteImageByFileNameAsync(playlist.image, 'playlist')
    }

    if (trackCoversToDelete.length > 0) {
        await deleteImagesByFileNameAsync(trackCoversToDelete, 'track')
    }

    if (trackAbsolutePathsToDelete.length > 0) {
        await deleteTracksByAbsolutePathAsync(trackAbsolutePathsToDelete)
    }
}

module.exports = {
    createPlaylist,
    updatePlaylist,
    addToLiked,
    addToDisliked,
    deleteFromLiked,
    deleteFromDisliked,
    deleteFromPlaylist,
    exportPlaylist,
    importPlaylist,
    deletePlaylist,
    addToPlaylist
}
