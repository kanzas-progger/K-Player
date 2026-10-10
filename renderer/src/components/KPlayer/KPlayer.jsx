import styles from './KPlayer.module.css';
import { useState } from 'react';
import KSlider from '../KSlider/KSlider';
import { useKPlayer } from '../contexts/KPlayerContext';
import EmptyImage from '../EmptyImage/EmptyImage';
import TimeLine from '../TimeLine/TimeLine';
import { useTracks } from '../contexts/TracksContext';

const KPlayer = ({ initialTrack }) => {

    const { player, track, isPlaying, isRepeat, play, playNext, playPrevious, pause, resume, setVolume, toggleMute, toggleRepeat } = useKPlayer()

    const { tracks, shuffleTracks } = useTracks()

    const [isFullscreen, setIsFullscreen] = useState(false)

    const hasStarted = track.id !== null

    const displayTrack = hasStarted ? track : (initialTrack ?? track)

    const handleTogglePlay = () => {
        if (!hasStarted && initialTrack) {
            play(initialTrack)
            return
        }

        isPlaying ? pause() : resume()
    }

    const handlePlayNext = () => {
        if (!tracks.length) return

        const currentIndex = tracks.findIndex(t => t.id === track?.id)
        if (currentIndex === -1) {
            playNext()
            return
        }

        const nextIndex = (currentIndex + 1) % tracks.length
        const previousTrackId = tracks[currentIndex]?.id ?? null
        const nextTrackId = tracks[(nextIndex + 1) % tracks.length]?.id ?? null

        playNext(previousTrackId, nextTrackId)
    }

    const handlePlayPrevious = () => {
        if (!tracks.length) return

        const currentIndex = tracks.findIndex(t => t.id === track?.id)
        if (currentIndex === -1) {
            playPrevious()
            return
        }

        const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length
        const previousTrackId = tracks[(prevIndex - 1 + tracks.length) % tracks.length]?.id ?? null
        const nextTrackId = tracks[currentIndex]?.id ?? null

        playPrevious(previousTrackId, nextTrackId)
    }

    const renderVolumeIcon = () => {
        if (player?.volume === 0) return 'no_sound';
        return player?.volume <= 0.45 ? 'volume_down' : 'volume_up';
    }

    const toggleFullscreen = () => {
        const flag = !isFullscreen;

        setIsFullscreen(flag);

        window.electronAPI.setFullscreen(flag);
    }

    return (
        <>
            <div className={styles['container']}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', flex: '1 1 0', minWidth: 0, height: '100%', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '10px 10px 10px 20px', flexShrink: 0 }}>
                            {displayTrack.cover !== null ?
                                <img src={`k-image://track/${displayTrack?.cover}`} style={{ width: '56px', height: '56px', borderRadius: '5px', display: 'block' }} />
                                : <EmptyImage style={{ width: '56px', height: '56px' }} />}

                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                            <p className={styles['text-name']}>{displayTrack?.name}</p>
                            <p className={styles['text-author']}>{displayTrack?.author}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0', minWidth: 0, height: '100%', padding: '10px' }}>
                        <div className={styles['wrapper']}>
                            <span
                                onClick={shuffleTracks}
                                className={`material-symbols-outlined ${styles['secondary-icon']}`}>
                                shuffle
                            </span>
                            <span
                                onClick={handlePlayPrevious}
                                className={`material-symbols-outlined ${styles['secondary-icon']} ${styles['skip-icon']}`}>
                                skip_previous
                            </span>

                            <span
                                onClick={handleTogglePlay}
                                className={`material-symbols-outlined ${styles['play_circle-icon']}`}>
                                {isPlaying ? 'pause_circle' : 'play_circle'}
                            </span>

                            <span
                                onClick={handlePlayNext}
                                className={`material-symbols-outlined ${styles['secondary-icon']} ${styles['skip-icon']}`}>
                                skip_next
                            </span>

                            <span
                                onClick={toggleRepeat}
                                className={`material-symbols-outlined ${styles['secondary-icon']} ${isRepeat ? styles.active : ''}`}>
                                repeat
                            </span>

                        </div>

                        <div style={{ width: '100%' }}>
                            <TimeLine />
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        flex: '1 1 0',
                        minWidth: 0,
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        padding: '10px',
                        gap: '20px'
                    }}>
                        <span onClick={() => toggleMute()} className={`material-symbols-outlined ${styles['secondary-icon']} ${styles['volume_up-icon']}`}>
                            {renderVolumeIcon()}
                        </span>
                        <KSlider
                            style={{ margin: '0', width: '20%' }}
                            min={0}
                            max={1}
                            step={0.01}
                            value={player?.volume ?? 1}
                            onChange={setVolume} />
                        <span
                            onClick={toggleFullscreen}
                            style={{ padding: '0 10px 0 0' }}
                            className={`material-symbols-outlined ${styles['secondary-icon']} ${styles['fullscreen-icon']}`}>
                            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                        </span>
                    </div>
                </div>
            </div>
        </>

    )
}

export default KPlayer