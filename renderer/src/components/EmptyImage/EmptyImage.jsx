import styles from './EmptyImage.module.css'

const EmptyImage = ({ style, isNowPlaying }) => {
    return (
        <>
            <div className={styles['container']} style={{ ...style }}>
                <span
                    style={{ fontSize: '52px !important' }}
                    className={`material-symbols-outlined ${styles['music_note_2-icon']} ${isNowPlaying ? styles['music_note_2-icon-now-playing'] : ''}`}>
                    music_note_2
                </span>
            </div>
        </>
    )
}

export default EmptyImage