import React, { useState, useEffect } from 'react'
import KSlider from '../KSlider/KSlider'
import { useKPlayer } from '../contexts/KPlayerContext'
import { formatDuration } from '../../common/helpers'
import styles from './TimeLine.module.css'

const TimeLine = () => {
    const { subscribeToTimeUpdate, player, track, seek, setIsAudioSeeking } = useKPlayer()

    const [isCurrentAudioTimeDragging, setIsCurrentAudioTimeDragging] = useState(false)
    const [currentAudioTimeDragValue, setCurrentAudioTimeDragValue] = useState(0)
    const [timeLineValue, setTimeLineValue] = useState(0)

    const [displaySeconds, setDisplaySeconds] = useState(0)

    // useEffect(() => {
    //     setTimeLineValue(0)
    //     setDisplaySeconds(0)
    // }, [track?.absolute_path])

    useEffect(() => {
        if (player?.status === 'idle' || !track?.absolute_path) {
            setTimeLineValue(0)
            setDisplaySeconds(0)
            setCurrentAudioTimeDragValue(0)
            setIsCurrentAudioTimeDragging(false)
        }
    }, [player?.status, track?.absolute_path])


    useEffect(() => {
        const unsubscribe = subscribeToTimeUpdate((time) => {
            if (isCurrentAudioTimeDragging) return;

            const nextSec = Math.floor(time)

            setDisplaySeconds((prev) => (prev !== nextSec ? nextSec : prev))

            setTimeLineValue(time);
        });
        return unsubscribe
    }, [subscribeToTimeUpdate, isCurrentAudioTimeDragging])


    const handleChangeCurrentAudioTime = (value) => {
        setIsAudioSeeking(true)
        setIsCurrentAudioTimeDragging(true)
        setCurrentAudioTimeDragValue(value)
    }

    const handleOnCompleteCurrentAudioTime = () => {
        seek(currentAudioTimeDragValue)
        setTimeLineValue(currentAudioTimeDragValue),
            setDisplaySeconds(Math.floor(currentAudioTimeDragValue))
        setIsAudioSeeking(false)
        setIsCurrentAudioTimeDragging(false)
    }

    const currentDisplayTime = isCurrentAudioTimeDragging ? formatDuration(parseInt(currentAudioTimeDragValue)) : formatDuration(parseInt(displaySeconds))
    const currentTimeLineValue = isCurrentAudioTimeDragging ? currentAudioTimeDragValue : timeLineValue

    return (
        <>
            <div className={styles['container']}>
                <p className={`${styles['text-time']} ${styles['text-time-start']}`}>{currentDisplayTime}</p>
                <KSlider
                    style={{ flex: 1 }}
                    min={0}
                    max={player?.duration || 1}
                    value={currentTimeLineValue}
                    onChange={handleChangeCurrentAudioTime}
                    onChangeComplete={handleOnCompleteCurrentAudioTime}
                />
                <p className={`${styles['text-time']} ${styles['text-time-end']}`}>{formatDuration(parseInt(track?.duration))}</p>
            </div>
        </>
    )

}

export default React.memo(TimeLine)