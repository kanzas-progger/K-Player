import styles from './LibraryEmpty.module.css'
import { useTranslation } from 'react-i18next'
import { loadTracks } from '../../api/api'
import { useTracks } from '../contexts/TracksContext'
import { MAIN_PLAYLIST_ID } from '../../constants/systemPlaylists'
import { useState } from 'react'
import ProcessingModal from '../ProcessingModal/ProcessingModal'

const LibraryEmpty = ({setPlaylists}) => {

    const { t } = useTranslation()

    const [isLoading, setIsLoading] = useState(false)

    const { setLoadedTracks } = useTracks()

    const handleUpload = async (uploadType) => {
        const audioFiles = await loadTracks(MAIN_PLAYLIST_ID, uploadType)

        setLoadedTracks(audioFiles)

        setPlaylists(prev => prev.map(p => p.id === MAIN_PLAYLIST_ID ? {...p, tracks_count: p.tracks_count + audioFiles.length} : p))

        setIsLoading(false)
    }

    return (
        <>
            <div className={styles['container']}>
                <div className={styles['wrapper']}>
                    <span className={`material-symbols-outlined ${styles['library_music-icon']}`}>
                        library_music
                    </span>
                    <div className={styles['content-container']}>
                        <p className={styles['content-header-text']}>{t('library_empty.add_audio_files')}</p>
                        <p className={styles['content-desc-text']}>{t('library_empty.description')}</p>
                        <div className={styles['upload-buttons-container']}>
                            <div className={styles['upload-btn']}
                                onClick={() => handleUpload('audioFiles')}>
                                <span className={`material-symbols-outlined ${styles['upload-icon']}`}>
                                    audio_file
                                </span>
                                <p className={styles['upload-btn-text']}>{t('library_empty.upload_audio_file')}</p>
                            </div>
                            <div className={styles['upload-btn']}
                                onClick={() => handleUpload('playlist')}>
                                <span className={`material-symbols-outlined ${styles['upload-icon']}`}>
                                    library_music
                                </span>
                                <p className={styles['upload-btn-text']}>{t('library_empty.upload_playlist')}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <ProcessingModal
                isVisible={isLoading}
                setIsVisible={setIsLoading}
                type='load' />
        </>


    )
}

export default LibraryEmpty