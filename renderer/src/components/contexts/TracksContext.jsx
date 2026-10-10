import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import {
    getAllTracksForPlaylist,
    addTrackToLiked,
    addTrackToDisliked,
    deleteTrackFromLiked,
    deleteTrackFromDisliked,
    deleteFromPlaylist,
    addToPlaylist
} from '../../api/api'
import { LIKED_PLAYLIST_ID, DISLIKED_PLAYLIST_ID } from '../../constants/systemPlaylists'

const TracksContext = createContext()

export const TracksProvider = ({ children }) => {

    const [tracks, setTracks] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const getTracks = useCallback(async (playlistId) => {
        try {
            if (tracks?.length > 0) {
                return
            }

            setIsLoading(true)
            const data = await getAllTracksForPlaylist(playlistId)
            setTracks(data)

        } catch (e) {
            console.error('[Renderer process] TracksContext.getTracks: ', e)
        }
        finally {
            setIsLoading(false)
        }
    }, [])

    const shuffleTracks = useCallback(() => {
        setTracks(prev => {
            const result = [...prev]
            for (let i = result.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [result[i], result[j]] = [result[j], result[i]]
            }
            return result
        })
    }, [])

    const setLoadedTracks = useCallback((tracks) => {
        setTracks(tracks)
    }, [])

    const addTracks = useCallback((tracks) => {
        setTracks(prev => [...tracks, ...prev])
    }, [])

    const deleteTrack = useCallback(async (track, playlistId) => {
        setTracks(prev => {
            const isCurrentPlaylist = track.playlist_id === playlistId

            if (isCurrentPlaylist) {
                return prev
                    .filter(t => t.id !== track.id)
                    .map(t => {
                        if (t.track_position > track.track_position) {
                            return { ...t, track_position: t.track_position - 1 }
                        }
                        return t
                    })
            }

            return prev.map(t => {
                if (t.id === track.id) {
                    return {
                        ...t,
                        playlist_ids: (t.playlist_ids || []).filter(id => id !== playlistId)
                    }
                }
                return t
            })
        })
        await deleteFromPlaylist(track, playlistId)
    }, [])

    const deleteTracks = useCallback((playlistId, isDeleteDislikedTracksFromSystemEnabled) => {
        if (playlistId == DISLIKED_PLAYLIST_ID) {
            if (isDeleteDislikedTracksFromSystemEnabled) {
                setTracks(prev => {
                    const filteredTracks = prev.filter(t => t.is_disliked !== 1)
                    return filteredTracks.map((track, index) => ({
                        ...track,
                        track_position: index + 1
                    }))
                })
            } else {
                setTracks(prev => prev.map(t => ({
                    ...t,
                    is_disliked: 0
                })))
            }

        }
        else if (playlistId === LIKED_PLAYLIST_ID) {
            setTracks(prev => prev.map(t => ({
                ...t,
                is_liked: 0
            })))
            return
        } else {
            setTracks(prev => {
                return prev.filter(t => t.playlist_id !== playlistId)
            })
        }
    }, [])

    const addTrackToPlaylist = useCallback(async (playlistId, trackId) => {

        setTracks(prevTracks => prevTracks.map(track => {
            if (track.id === trackId) {
                const currentIds = track.playlist_ids || []
                const updatedIds = currentIds.includes(playlistId)
                    ? currentIds
                    : [...currentIds, playlistId]

                return { ...track, playlist_ids: updatedIds }
            }
            return track
        }))

        await addToPlaylist(playlistId, trackId)
    }, [])

    const toggleLike = useCallback(async (track) => {

        const isLiked = track.is_liked === 1
        const newIsLiked = isLiked ? 0 : 1

        setTracks(prev => prev.map(t => t.id === track.id ? {
            ...t,
            is_liked: newIsLiked,
            is_disliked: newIsLiked ? 0 : t.is_disliked
        } : t))

        if (isLiked) {
            await deleteTrackFromLiked(track.id)
        }
        else {
            await addTrackToLiked(track.id)
        }
    }, [])

    const toggleDislike = useCallback(async (track) => {

        const isDisliked = track.is_disliked === 1
        const newIsDisliked = isDisliked ? 0 : 1

        setTracks(prev => prev.map(t => t.id === track.id ? {
            ...t,
            is_disliked: newIsDisliked,
            is_liked: newIsDisliked ? 0 : t.is_liked
        } : t))

        if (isDisliked) {
            await deleteTrackFromDisliked(track.id)
        }
        else {
            await addTrackToDisliked(track.id)
        }
    }, [])

    const value = useMemo(() => ({
        tracks,
        isLoading,
        getTracks,
        setLoadedTracks,
        addTracks,
        toggleLike,
        toggleDislike,
        deleteTrack,
        deleteTracks,
        addTrackToPlaylist,
        shuffleTracks
    }), [tracks,
        isLoading,
        getTracks,
        setLoadedTracks,
        addTracks,
        toggleLike,
        toggleDislike,
        deleteTrack,
        deleteTracks,
        addTrackToPlaylist,
        shuffleTracks])

    return (
        <TracksContext.Provider value={value}>
            {children}
        </TracksContext.Provider>
    )
}

export function useTracks() {
    const ctx = useContext(TracksContext)
    if (!ctx) throw new Error('[Renderer process] useTracks must be used in TracksContext.Provider')
    return ctx
}