import TrackCard from '../TrackCard/TrackCard'
import { useTranslation } from 'react-i18next'
import styles from './TrackList.module.css'
import { loadTracks, exportPlaylist, updatePlaylist } from '../../api/api'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useKPlayer } from '../contexts/KPlayerContext'
import React from 'react'
import { useCallback, useMemo, useState, useEffect } from 'react'
import { useTracks } from '../contexts/TracksContext'
import { SYSTEM_PLAYLISTS_TRANSLATIONS_KEYS, LIKED_PLAYLIST_ID, DISLIKED_PLAYLIST_ID, SYSTEM_PLAYLIST_IDS } from '../../constants/systemPlaylists'
import ProcessingModal from '../ProcessingModal/ProcessingModal'
import PlaylistFormModal from '../PlaylistFormModal/PlaylistFormModal'

const TRACK_CARD_HEIGHT = 77

const TrackList = ({
    tracks,
    scrollParentRef,
    playlist,
    setSelectedPlaylist,
    playlists,
    setPlaylists,
    onUpdateTracksCount,
    lastPlayedTrack,
    isInitialScrollDone,
    setIsInitialScrollDone,
    playlistCountInDropDown }) => {
    const { t } = useTranslation()

    const { play, playNext, pause, resume, setToIdle, track: stateTrack, isPlaying, isPaused, isIdle } = useKPlayer()
    const { addTracks, deleteTrack, toggleLike, toggleDislike, addTrackToPlaylist } = useTracks()

    const [isExporting, setIsExporting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [isEdit, setIsEdit] = useState(false)

    const rowVirtualizer = useVirtualizer({
        count: tracks.length,
        getScrollElement: () => scrollParentRef.current,
        estimateSize: () => TRACK_CARD_HEIGHT,
        getItemKey: useCallback((index) => tracks[index]?.id ?? index, [tracks]),
        overscan: 5,
    })

    useEffect(() => {
        if (isInitialScrollDone) return
        if (!tracks.length) return
        if (!lastPlayedTrack) return
        if (lastPlayedTrack.playlist_id !== playlist.id) return

        const index = tracks.findIndex((track) => track.id === lastPlayedTrack.id)
        if (index === -1) return

        rowVirtualizer.scrollToIndex(index, {
            align: 'start',
            behavior: 'auto',
        })

        setIsInitialScrollDone(true)
    }, [tracks, lastPlayedTrack, playlist.id, isInitialScrollDone])

    const displayPlaylistName = useMemo(() => {
        const translationKey = SYSTEM_PLAYLISTS_TRANSLATIONS_KEYS[playlist.name]
        return translationKey ? t(translationKey) : playlist.name
    }, [playlist.name, t])

    const handlePlay = useCallback((targetTrack) => {
        if (!tracks.length) return

        const currentIndex = tracks.findIndex(t => t.id === targetTrack.id)

        if (currentIndex === -1) {
            play(targetTrack, null, null)
            return
        }

        const previousTrackId = tracks[(currentIndex - 1 + tracks.length) % tracks.length]?.id ?? null
        const nextTrackId = tracks[(currentIndex + 1) % tracks.length]?.id ?? null

        play(targetTrack, previousTrackId, nextTrackId)
    }, [tracks, play])

    const handleUpload = async (uploadType) => {
        const audioFiles = await loadTracks(playlist.id, uploadType)
        addTracks(audioFiles)
        setIsLoading(false)
    }

    const handleDeleteFromPlaylist = useCallback(async (track, playlistId) => {
        if (!isIdle && stateTrack.id === track.id) {
            setToIdle()
        }

        onUpdateTracksCount(playlistId, "delete")

        const remainingPlaylists = (track.playlist_ids || []).filter(id =>
            id !== playlistId &&
            id !== LIKED_PLAYLIST_ID &&
            id !== DISLIKED_PLAYLIST_ID
        )
        const isFullyDeleted = remainingPlaylists.length === 0

        if (isFullyDeleted) {
            if (track.is_liked && playlistId !== LIKED_PLAYLIST_ID) {
                onUpdateTracksCount(LIKED_PLAYLIST_ID, "delete")
            }

            if (track.is_disliked && playlistId !== DISLIKED_PLAYLIST_ID) {
                onUpdateTracksCount(DISLIKED_PLAYLIST_ID, "delete")
            }
        }

        await deleteTrack(track, playlistId)

    }, [deleteTrack, isIdle, stateTrack?.id, playNext, onUpdateTracksCount])




    const handleAddTrackToPlaylist = useCallback(async (playlistId, trackId) => {
        await addTrackToPlaylist(playlistId, trackId)

        onUpdateTracksCount?.(playlistId, "add")
    }, [addTrackToPlaylist, onUpdateTracksCount])

    const handleToggleLike = useCallback(async (track) => {
        const isLiked = track.is_liked === 1
        const isDisliked = track.is_disliked === 1
        if (isLiked) {

            onUpdateTracksCount(LIKED_PLAYLIST_ID, 'delete')
        } else {

            onUpdateTracksCount(LIKED_PLAYLIST_ID, 'add')

            if (isDisliked) {
                onUpdateTracksCount(DISLIKED_PLAYLIST_ID, 'delete')
            }
        }
        await toggleLike(track)
    }, [toggleLike, onUpdateTracksCount])

    const handleToggleDislike = useCallback(async (track) => {
        const isDisliked = track.is_disliked === 1
        const isLiked = track.is_liked === 1

        if (isDisliked) {
            onUpdateTracksCount(DISLIKED_PLAYLIST_ID, 'delete')
        } else {
            onUpdateTracksCount(DISLIKED_PLAYLIST_ID, 'add')

            if (isLiked) {
                onUpdateTracksCount(LIKED_PLAYLIST_ID, 'delete')
            }
        }

        await toggleDislike(track)

        if (!isDisliked && !isIdle && stateTrack.id === track.id) {
            await playNext()
        }
    }, [toggleDislike, tracks, playNext, isIdle, stateTrack])

    const handleExportPlaylist = async () => {

        try {
            const result = await exportPlaylist(playlist.id)

            if (!result || result.canceled) {
                return
            }
        } catch (error) {
            console.error('[Renderer process] handleExportPlaylist:', error)
        } finally {
            setIsExporting(false)
        }
    }

    const handleOpenEditModal = () => {
        setIsEdit(true)
    }

    const handleCloseEditModal = () => {
        setIsEdit(false)
    }

    const handleEditPlaylist = async ({ name, imageAbsolutePath }) => {
        const { updatedName, updatedImage } = await updatePlaylist(playlist.id, name, imageAbsolutePath)

        const updatedTimestamp = Date.now()

        setSelectedPlaylist((prev) => ({
            ...prev,
            name: updatedName,
            image: updatedImage ? updatedImage : playlist.image,
            updatedAt: updatedTimestamp
        }))

        setPlaylists((prev) =>
            prev.map((item) => {
                if (item.id === playlist.id) {
                    return {
                        ...item,
                        name: updatedName,
                        image: updatedImage ? updatedImage : playlist.image,
                        updatedAt: updatedTimestamp
                    }
                }
                return item
            })
        )
    }

    return (
        <>
            <div className={styles['container']}>
                <div className={styles['container-header']}>
                    <p style={{
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        color: 'var(--color-text-default)',
                        fontSize: '32px',
                        fontWeight: 700
                    }}>{displayPlaylistName}</p>
                    <div className={styles['container-header-button']}>
                        <span
                            onClick={() => handleUpload('audioFiles')}
                            className={`material-symbols-outlined ${styles['container-header-button-icon']}`}>
                            add_2
                        </span>
                        {!SYSTEM_PLAYLIST_IDS.includes(playlist.id) && (
                            <span
                                onClick={() => handleOpenEditModal()}
                                className={`material-symbols-outlined ${styles['container-header-button-icon']}`}>
                                edit
                            </span>
                        )}

                        <span
                            onClick={handleExportPlaylist}
                            className={`material-symbols-outlined ${styles['container-header-button-icon']}`}>
                            ios_share
                        </span>
                    </div>

                </div>

                <div
                    className={styles['wrapper']}
                    style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const track = tracks[virtualRow.index]

                        return (
                            <div
                                key={virtualRow.key}
                                data-index={virtualRow.index}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${TRACK_CARD_HEIGHT}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                    paddingBottom: '5px',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <TrackCard
                                    track={track}
                                    isCurrentTrackIsPlaying={isPlaying && stateTrack.id === track.id}
                                    isCurrentTrackIsPaused={isPaused && stateTrack.id === track.id}
                                    onPlay={handlePlay}
                                    onPause={pause}
                                    onResume={resume}
                                    onDeleteFromPlaylist={handleDeleteFromPlaylist}
                                    onAddToPlaylist={handleAddTrackToPlaylist}
                                    onLike={handleToggleLike}
                                    onDislike={handleToggleDislike}
                                    playlists={playlists}
                                    playlistCountInDropDown={playlistCountInDropDown}
                                />
                            </div>
                        )
                    })}
                </div>

            </div>

            <ProcessingModal
                isVisible={isExporting}
                setIsVisible={setIsExporting}
                type='export'
            />

            <ProcessingModal
                isVisible={isLoading}
                setIsVisible={setIsLoading}
                type='load' />

            <PlaylistFormModal
                isOpen={isEdit}
                onClose={handleCloseEditModal}
                onSubmit={handleEditPlaylist}
                playlist={playlist}
                type='edit'
            />
        </>
    )
}

export default React.memo(TrackList)