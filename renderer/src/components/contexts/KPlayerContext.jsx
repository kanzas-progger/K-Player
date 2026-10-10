import { createContext, useContext, useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { getPreviousAndNextTrackIds, getTrackById, updateLastTrack } from '../../api/api'

const KPlayerContext = createContext();

const initialPlayerState = {
    status: 'idle', // idle | playing | paused
    isRepeat: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    next: 0,
    previous: 0
};

const initialTrack = {
    id: null,
    absolute_path: null,
    duration: null,
    name: null,
    author: null,
    cover: null,
    is_liked: null,
    is_disliked: null,
    is_marked: null,
    playlist_id: null
};

const initialState = {
    player: initialPlayerState,
    track: initialTrack
};

export const KPlayerProvider = ({ children }) => {
    const [state, setState] = useState(initialState)

    const playlistIdRef = useRef(1)
    const nextTrackIdRef = useRef(0)
    const previousTrackIdRef = useRef(0)

    const audioRef = useRef(null)
    const isAudioSeekingRef = useRef(false)
    const previousVolumeRef = useRef(1)

    const playNextRef = useRef(null)

    const analyserRef = useRef(null)
    const audioContextRef = useRef(null)

    const isRepeatRef = useRef(false);

    const cleanupAudioResources = useCallback(() => {
        if (audioRef.current) {
            const audio = audioRef.current
            audio.pause()
            audio.removeAttribute('src')
            audio.load();
        }
    }, [])

    const getAudio = useCallback(() => {
        if (!audioRef.current) {
            const audio = new Audio()
            audio.crossOrigin = 'anonymous'
            audio.preload = 'auto'
            audio.volume = state.player.volume

            const AudioCtx = window.AudioContext || window.webkitAudioContext
            const audioCtx = new AudioCtx()
            const analyser = audioCtx.createAnalyser()
            analyser.fftSize = 256

            const source = audioCtx.createMediaElementSource(audio)
            source.connect(analyser)
            analyser.connect(audioCtx.destination)

            audioContextRef.current = audioCtx
            analyserRef.current = analyser

            audio.addEventListener('loadedmetadata', () => {
                setState(prev => ({ ...prev, player: { ...prev.player, duration: audio.duration } }))
            })

            audio.addEventListener('ended', () => {
                // if (playNextRef.current) {
                //     playNextRef.current()
                // }
                if (isRepeatRef.current) {
                    audio.currentTime = 0;
                    audio.play()
                } else if (playNextRef.current) {
                    playNextRef.current()
                }
            })

            audio.addEventListener('play', () => {
                if (audioContextRef.current?.state === 'suspended') {
                    audioContextRef.current.resume()
                }
                setState(prev => ({ ...prev, player: { ...prev.player, status: 'playing' } }))
            })

            audio.addEventListener('pause', () => {
                setState(prev => ({ ...prev, player: { ...prev.player, status: 'paused' } }))
            })

            audioRef.current = audio
        }
        return audioRef.current
    }, [])

    const play = useCallback(async (track, previousTrackId = null, nextTrackId = null) => {
        if (!track?.absolute_path) {
            console.error('No file path:', track?.absolute_path)
            return
        }

        const audio = getAudio()

        const src = `kaudio://audio?path=${encodeURIComponent(track.absolute_path)}`

        if (audio.src !== src) {
            cleanupAudioResources()
            audio.src = src
        }

        setState(prev => ({
            ...prev,
            track: { ...prev.track, ...track },
            player: { ...prev.player }
        }))

        playlistIdRef.current = track.playlist_id

        if (nextTrackId && previousTrackId) {
            previousTrackIdRef.current = previousTrackId
            nextTrackIdRef.current = nextTrackId
        }
        else {
            const trackIdsData = await getPreviousAndNextTrackIds(track.playlist_id, track.track_position)
            await updateLastTrack(track.id, track.playlist_id)

            previousTrackIdRef.current = trackIdsData.previous
            nextTrackIdRef.current = trackIdsData.next
        }

        try {
            await audio.play()
        } catch (err) {
            console.error('[Render process]: Error playing audio: ', track.absolute_path, err)
        }
    }, [])

    const pause = useCallback(() => {
        audioRef.current?.pause()
    }, [])

    const resume = useCallback(() => {
        audioRef.current?.play()
    }, [])

    const setToIdle = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0
        }
        cleanupAudioResources()
        setState((prev) => ({
            ...initialState,
            player: {
                ...initialPlayerState,
                volume: prev.player.volume,
                currentTime: 0
            }
        }))
    }, [cleanupAudioResources])

    const playNext = useCallback(async (previousTrackId, nextTrackId) => {

        if (!nextTrackIdRef.current) {
            setState(prev => ({ ...prev, player: { ...prev.player, status: 'idle', currentTime: 0 } }))
            return
        }
        const track = await getTrackById(playlistIdRef.current, nextTrackIdRef.current)
        if (track) {
            play(track, previousTrackId, nextTrackId)
        } else {
            setState(prev => ({ ...prev, player: { ...prev.player, status: 'idle', currentTime: 0 } }))
        }
    }, [])

    useEffect(() => {
        playNextRef.current = playNext
    }, [playNext])

    const playPrevious = useCallback(async (previousTrackId, nextTrackId) => {
        const track = await getTrackById(playlistIdRef.current, previousTrackIdRef.current)
        play(track, previousTrackId, nextTrackId)
    }, [])

    const seek = useCallback((time) => {
        try {
            const audio = audioRef.current
            const value = Number(time)

            if (audio) {
                audio.currentTime = value;
            }
            setState(prev => ({ ...prev, player: { ...prev.player, currentTime: value } }))
        } catch (error) {
            console.error('[Renderer process] seek: ', error)
        }
    }, [])

    const setTrackData = (trackData) => {
        setState(prev => ({
            ...prev,
            track: { ...prev.track, ...trackData }
        }));
    };

    const setIsAudioSeeking = useCallback((flag) => {
        isAudioSeekingRef.current = flag
    }, [])

    const setVolume = useCallback((value) => {
        const audio = getAudio()

        const audioVolume = value
        audio.volume = audioVolume

        if (audioVolume === 0) {
            previousVolumeRef.current = 0
        }
        else {
            previousVolumeRef.current = audioVolume
        }

        setState(prev => ({
            ...prev,
            player: {
                ...prev.player,
                volume: audioVolume,
            }
        }))

    }, [getAudio])

    const toggleMute = useCallback(() => {

        if (state.player.volume > 0) {
            previousVolumeRef.current = state.player.volume

            const audio = getAudio()
            audio.volume = 0

            setState(prev => ({
                ...prev,
                player: {
                    ...prev.player,
                    volume: 0,
                }
            }))
        } else {

            const restoredVolume = previousVolumeRef.current === 0 ? 1 : previousVolumeRef.current
            setVolume(restoredVolume)
        }
    }, [state.player.volume, setVolume])

    const toggleRepeat = useCallback(() => {
        setState(prev => {
            const nextValue = !prev.player.isRepeat;
            isRepeatRef.current = nextValue
            return {
                ...prev,
                player: { ...prev.player, isRepeat: nextValue }
            }
        })
    }, [])

    const subscribeToTimeUpdate = useCallback((callback) => {
        const audio = getAudio();
        const handler = () => {
            if (!isAudioSeekingRef.current) {
                callback(audio.currentTime)
            }
        };
        audio.addEventListener('timeupdate', handler);
        return () => audio.removeEventListener('timeupdate', handler);
    }, [getAudio]);

    const isPlaying = state.player.status === 'playing';
    const isPaused = state.player.status === 'paused';
    const isIdle = state.player.status === 'idle';

    const value = useMemo(() => ({
        ...state,
        isPlaying,
        isPaused,
        isIdle,
        isRepeat: state.player.isRepeat,
        duration: state.player.duration,
        audioAnalyzer: analyserRef.current,
        play,
        playNext,
        playPrevious,
        pause,
        resume,
        setToIdle,
        seek,
        setTrackData,
        setIsAudioSeeking,
        setVolume,
        toggleMute,
        toggleRepeat,
        subscribeToTimeUpdate
    }), [state,
        isPlaying,
        isPaused,
        isIdle,
        play,
        playNext,
        playPrevious,
        pause,
        resume,
        setToIdle,
        seek,
        setIsAudioSeeking,
        setVolume,
        toggleMute,
        toggleRepeat,
        subscribeToTimeUpdate
    ])

    return (
        <KPlayerContext.Provider value={value}>
            {children}
        </KPlayerContext.Provider>
    );
};

export function useKPlayer() {
    const ctx = useContext(KPlayerContext)
    if (!ctx) throw new Error('[Renderer process] useKPlayer must be used in KPlayerContext.Provider')
    return ctx
}