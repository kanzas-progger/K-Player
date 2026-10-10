import styles from './PlaylistsModal.module.css'
import { Modal, ConfigProvider } from 'antd'
import { useTranslation } from 'react-i18next'
import KCheckbox from '../KCheckbox/KCheckbox'
import { useState, useEffect } from 'react'


const THEME = {
    components: {
        Modal: {
            contentBg: 'var(--color-surface)',
            titleColor: 'var(--color-text-default)',
            contentOutline: 'none',
            colorIcon: 'var(--color-text-secondary)',
            colorIconHover: 'var(--color-text-default)'
        }
    }
}

const PlaylistsModal = ({ playlists, track, isOpen, onClose, onAddToPlaylist, onDeleteFromPlaylist }) => {

    const { t } = useTranslation()

    const initialPlaylistIds = track?.playlist_ids || []

    const [selectedPlaylistIds, setSelectedPlaylistIds] = useState([])

    useEffect(() => {
        if (isOpen) {
            setSelectedPlaylistIds(initialPlaylistIds)
        }
    }, [isOpen, track])


    const handleTogglePlaylist = (playlistId) => {
        setSelectedPlaylistIds((prev) =>
            prev.includes(playlistId)
                ? prev.filter((id) => id !== playlistId)
                : [...prev, playlistId]
        )
    }

    const handleSubmit = async () => {
        try {

            const addedPlaylistIds = selectedPlaylistIds.filter(
                (id) => !initialPlaylistIds.includes(id)
            )

            const removedPlaylistIds = initialPlaylistIds.filter(
                (id) => !selectedPlaylistIds.includes(id)
            )

            if (removedPlaylistIds.length > 0) {
                await Promise.all((
                    removedPlaylistIds.map((playlistId) => (
                        Promise.resolve(onDeleteFromPlaylist(track, playlistId))
                    ))
                ))
            }

            if (addedPlaylistIds.length > 0) {
                await Promise.all(
                    addedPlaylistIds.map((playlistId) =>
                        Promise.resolve(onAddToPlaylist(playlistId, track.id))
                    )
                )
            }

            onClose()
        } catch (error) {
            console.error('[Renderer process]: handleSubmit', error)
        }
    }

    const handleClose = () => {
        onClose()
    }

    const renderFooter = (
        <div className={styles['footer']}>
            <div
                onClick={handleClose}
                className={`${styles['btn']} ${styles['btn-cancel']}`}>
                <p>{t('playlists_modal.cancel')}</p>
            </div>
            <div
                onClick={handleSubmit}
                className={`${styles['btn']} ${styles['btn-submit']}`}>
                <p>OK</p>
            </div>
        </div>
    )

    return (
        <ConfigProvider
            theme={THEME}>
            <Modal
                title={t('playlists_modal.title')}
                open={isOpen}
                footer={renderFooter}
                closable={true}
                onCancel={handleClose}
                centered
                destroyOnHidden
                styles={{
                    title: {
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        fontSize: '20px',
                        userSelect: 'none'
                    },
                    body: {
                        maxHeight: '50vh',
                        overflowY: 'auto'
                    }
                }}>

                <div className={styles['container']}>
                    {playlists.map((playlist) => {
                        const isChecked = selectedPlaylistIds.includes(playlist.id)
                        return (
                            <div
                                key={playlist.id}
                                onClick={() => handleTogglePlaylist(playlist.id)}
                                className={styles['playlist-card-container']}>
                                <div className={styles['playlist-card-inner']}>
                                    <div className={styles['playlist-icon-container']}>
                                        <span className={`material-symbols-outlined ${styles['playlist-icon']}`}>
                                            queue_music
                                        </span>
                                    </div>

                                    <div className={styles['playlist-card-text-container']}>
                                        <p className={styles['playlist-name-text']}>{playlist.name}</p>
                                        <p className={styles['tracks-count-text']}>{t('playlists_modal.tracks_count', { count: playlist.tracks_count })}</p>
                                    </div>
                                </div>

                                <KCheckbox
                                    checked={isChecked}
                                    containerHoverClassName={styles['kcheckbox-override']} />
                            </div>
                        )
                    })}
                </div>

            </Modal>

        </ConfigProvider>
    )
}

export default PlaylistsModal