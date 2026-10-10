const { dialog } = require('electron')
const fs = require('fs/promises')
const path = require('path')
const mm = require('music-metadata')
const tracksRepository = require('../db/repositories/tracks.repository')
const playlistsRepository = require('../db/repositories/playlists.repository')
const { saveCoverAndReturnFileAsync } = require('../helpers/service.helpers')

function getPreviousAndNextTrackIds(playlistId, trackPosition) {
    try {
        let previous = 0
        let next = 0

        const data = { previous: previous, next: next }

        const maxPositionInPlaylist = playlistsRepository.getMaxPositionInPlaylist(playlistId)
        if (maxPositionInPlaylist === 1) {
            previous = 1
            next = 1
        }
        else if (trackPosition === maxPositionInPlaylist) {
            next = trackPosition - 1
            previous = 1
        }
        else if (trackPosition === 1) {
            next = maxPositionInPlaylist
            previous = trackPosition + 1
        }
        else {
            next = trackPosition - 1
            previous = trackPosition + 1
        }

        data.previous = playlistsRepository.getTrackIdByPosition(playlistId, previous)
        data.next = playlistsRepository.getTrackIdByPosition(playlistId, next)

        return data

    } catch (error) {
        console.error('[Main process]: getPreviousAndNextTrackIds', error)
    }
}

async function loadTracks(event, playlistId, uploadType) {
    try {
        const audioFiles = await openDialog(uploadType)

        if (!audioFiles || audioFiles.length === 0) {
            return []
        }

        const total = audioFiles.length
        let processedCount = 0

        if (event?.sender) {
            event.sender.send('system:loadProgress', { loaded: 0, total })
        }

        const maxPositionInPlaylist = playlistsRepository.getMaxPositionInPlaylist(playlistId)

        let trackPosition = maxPositionInPlaylist + 1
        const tracks = []

        for (const audioFile of audioFiles) {

            try {
                const trackObj = {
                    absolutePath: audioFile.absolutePath,
                    duration: audioFile.duration,
                    name: audioFile.name,
                    author: audioFile.author
                }
                const track = tracksRepository.create(trackObj)

                let cover = null
                if (audioFile.coverBuffer !== null) {
                    cover = await saveCoverAndReturnFileAsync(track.id, audioFile.coverBuffer)
                    tracksRepository.updateCover(track.id, cover)
                }

                playlistsRepository.addTrackToPlaylist(playlistId, track.id, trackPosition)

                tracks.push({
                    id: track.id,
                    absolute_path: track.absolutePath,
                    duration: track.duration,
                    name: track.name,
                    author: track.author,
                    cover: cover,
                    playlist_id: playlistId,
                    track_position: trackPosition,
                    playlist_ids: [playlistId]
                })

                trackPosition++
            } catch (error) {
                console.error('[Main process]: loadTracks track error:', error)
            }
            finally {
                processedCount++
                if (event?.sender) {
                    event.sender.send('system:loadProgress', { loaded: processedCount, total })
                }
            }
        }

        tracks.sort((a, b) => b.track_position - a.track_position)

        return tracks
    } catch (error) {
        console.error('[Renderer process]: loadTracks: ', error)
        return []
    }

}

async function readAudioFile(absolutePath) {
    try {
        const nodeBuffer = await fs.readFile(absolutePath)
        return nodeBuffer.buffer
    } catch (error) {
        console.error(`[Main Process] Error of reading file ${absolutePath}:`, error)
    }
}


async function openDialog(uploadType) {
    const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'm4a', 'wma', 'ogg']

    const result = await dialog.showOpenDialog({
        properties: uploadType === 'audioFiles' ? ['openFile', 'multiSelections'] : ['openDirectory'],
        filters: [
            { name: 'Audio Files', extensions: audioExtensions }
        ]
    })

    const { canceled, filePaths } = result

    if (canceled || filePaths.length <= 0) {
        return []
    }

    const audioFilePaths = []

    for (const filePath of filePaths) {
        const stat = await fs.stat(filePath)

        if (stat.isDirectory()) {
            const files = await fs.readdir(filePath)
            for (const file of files) {
                const ext = path.extname(file).toLowerCase().substring(1)
                if (audioExtensions.includes(ext)) {
                    const fullPath = path.join(filePath, file)
                    audioFilePaths.push(fullPath)
                }
            }
        } else {

            const ext = path.extname(filePath).toLowerCase().substring(1)
            if (audioExtensions.includes(ext)) {
                audioFilePaths.push(filePath)
            }
        }
    }

    const audioFiles = await Promise.all(
        audioFilePaths.map(async (audioFilePath) => {
            try {
                const metadata = await mm.parseFile(audioFilePath)
                const { common, format } = metadata
                const fileName = path.basename(audioFilePath)

                return {
                    absolutePath: audioFilePath,
                    duration: format.duration ?? 0,
                    name: common.title ?? fileName,
                    author: (common.artist || common.albumartist) ?? 'Unknown',
                    coverBuffer: common.picture?.length > 0 ? common.picture[0].data : null
                }
            } catch (error) {
                console.error(`[Main process]: Reading audio ${audioFilePath}:`, error.message)
                return null;
            }
        })
    )
    return audioFiles.filter(audioFile => audioFile !== null).reverse()
}

module.exports = {
    loadTracks,
    readAudioFile,
    getPreviousAndNextTrackIds
}