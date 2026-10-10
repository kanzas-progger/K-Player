import styles from './PlaylistsPage.module.css'
import { useTranslation } from 'react-i18next'
import { useState, useCallback, useMemo } from 'react'
import { importPlaylist, deletePlaylist, createPlaylist, getTracksCount, exportPlaylist } from '../../api/api'
import { SYSTEM_PLAYLISTS_TRANSLATIONS_KEYS, SYSTEM_PLAYLIST_IDS, LIKED_PLAYLIST_ID, DISLIKED_PLAYLIST_ID } from '../../constants/systemPlaylists'
import { useTracks } from '../../components/contexts/TracksContext'
import ProcessingModal from '../../components/ProcessingModal/ProcessingModal'
import PlaylistFormModal from '../../components/PlaylistFormModal/PlaylistFormModal'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'

const PlaylistsPage = ({ onSelectPlaylist, playlists, setPlaylists, isDeleteDislikedTracksFromSystemEnabled }) => {

    const { deleteTracks, setLoadedTracks } = useTracks()
    const { t } = useTranslation()

    const [isCreating, setIsCreating] = useState(false)

    const [isExporting, setIsExporting] = useState(false)
    const [isImporting, setIsImporting] = useState(false)

    const [playlistToDelete, setPlaylistToDelete] = useState(null)

    const getPlaylistName = useCallback((name) => {
        const key = SYSTEM_PLAYLISTS_TRANSLATIONS_KEYS[name]
        return key ? t(key) : name
    }, [t])

    const confirmModalTexts = useMemo(() => {
        if (!playlistToDelete) return { title: '', description: '' }

        if (SYSTEM_PLAYLIST_IDS.includes(playlistToDelete.id)) {
            return {
                title: t('confirm_modal.clean_playlist_title'),
                description: t('confirm_modal.clean_playlist_description')
            }
        }
        else {
            return {
                title: t('confirm_modal.delete_playlist_title'),
                description: t('confirm_modal.delete_playlist_description')
            }
        }
    }, [playlistToDelete, t])

    const handleDeletePlaylist = useCallback(async () => {
        if (!playlistToDelete) return

        const playlist = playlistToDelete
        setPlaylistToDelete(null)

        try {
            deleteTracks(playlist.id, isDeleteDislikedTracksFromSystemEnabled)
            await deletePlaylist(playlist)

            const updatedPlaylists = await Promise.all(
                playlists.map(async (p) => ({
                    ...p,
                    tracks_count: await getTracksCount(p.id)
                }))
            )

            setPlaylists(updatedPlaylists)

            if (!SYSTEM_PLAYLIST_IDS.includes(playlist.id)) {
                setPlaylists(prev => prev.filter(p => p.id !== playlist.id))
            }
        }
        catch (error) {
            console.error('[Renderer process]: handleDeletePlaylist')
        }
    }, [playlistToDelete, deleteTracks, isDeleteDislikedTracksFromSystemEnabled, playlists, setPlaylists])

    const handleImportPlaylist = async () => {
        const importedData = await importPlaylist()
        const { playlist, tracks = [], isLikedCount = 0, isDislikedCount = 0 } = importedData

        setPlaylists(prev => {

            let isPlaylistAlreadyExists = false

            const updatedPlaylists = prev.map(p => {
                if (p.id === LIKED_PLAYLIST_ID) {
                    return { ...p, tracks_count: p.tracks_count + isLikedCount }
                }
                if (p.id === DISLIKED_PLAYLIST_ID) {
                    return { ...p, tracks_count: p.tracks_count + isDislikedCount }
                }
                if (p.id === playlist.id) {
                    isPlaylistAlreadyExists = true
                    return { ...p, tracks_count: p.tracks_count + tracks.length }
                }
                return p
            })

            return isPlaylistAlreadyExists
                ? updatedPlaylists
                : [...updatedPlaylists, playlist]
        })
        setIsImporting(false)
    }

    const handleOpenCreateModel = () => {
        setIsCreating(true)
    }

    const handleCloseCreateModal = () => {
        setIsCreating(false)
    }

    const handleOpenConfirmModal = (playlist) => {
        setPlaylistToDelete(playlist)
    }

    const handleCloseConfrimModal = () => {
        setPlaylistToDelete(null)
    }

    const handleCreatePlaylist = async ({ name, imageAbsolutePath }) => {
        const newPlaylist = await createPlaylist(name, imageAbsolutePath)
        setPlaylists(prev => [
            ...prev,
            {
                ...newPlaylist,
                tracks_count: newPlaylist.tracks_count ?? 0
            }
        ])
    }

    const handleExportPlaylist = async (playlistId) => {

        try {
            const result = await exportPlaylist(playlistId)

            if (!result || result.canceled) {
                return
            }
        } catch (error) {
            console.error('[Renderer process] handleExportPlaylist:', error)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <>
            <div className={`${styles['container']}`}>
                <div className={styles['header-container']}>
                    <p className={styles['header-text']}>{t('playlists_page.playlists')}</p>
                </div>
                <div className={styles['card-container']}>

                    <div className={styles['card-wrapper']}>
                        <div
                            onClick={() => handleOpenCreateModel()}
                            className={styles['card-playlist-add']}>
                            <div className={styles['card-inner']}>
                                <div className={`${styles['card-image-container']} ${styles['card-image-container-empty']}`}>
                                    <span className={`material-symbols-outlined ${styles['card-image-empty-playlist-add-icon']}`}>
                                        playlist_add
                                    </span>
                                </div>

                                <div className={styles['card-text-container']}>
                                    <p className={styles['card-title']}>{t('playlists_page.create_playlist')}</p>
                                    <p className={styles['card-count']}>{t('playlists_page.add_new_tracks')}</p>
                                </div>
                            </div>
                        </div>
                        {playlists.map((playlist) => (
                            <div className={styles['card']} key={playlist.id}>
                                <div className={styles['card-inner']}>
                                    <div className={`${styles['card-image-container']} ${playlist.image === null ? styles['card-image-container-empty'] : ''}`}>
                                        {playlist.image === null ?
                                            <span className={`material-symbols-outlined ${styles['card-image-empty-icon']}`} style={{ color: `${playlist.id === 2 ? 'var(--color-primary)' : playlist.id === 3 ? 'var(--color-dislike-icon)' : 'var(--color-text-secondary)'}` }}>
                                                {playlist.id === 2 ? 'favorite' : playlist.id === 3 ? 'thumb_down' : 'music_note_2'}
                                            </span> :
                                            <img
                                                //src={`k-image://playlist/${playlist.image}`}
                                                src={`k-image://playlist/${playlist.image}${playlist.updatedAt ? `?t=${playlist.updatedAt}` : ''}`}
                                                className={styles['card-image']}
                                                alt='empty-image' />}

                                        <div className={styles['card-image-overlay']}>
                                            <span
                                                //onClick={() => handleDeletePlaylist(playlist)}
                                                onClick={() => handleOpenConfirmModal(playlist)}
                                                className={`material-symbols-outlined ${styles['card-image-secondary-icon']}`}>
                                                delete_forever
                                            </span>
                                            <span
                                                onClick={() => onSelectPlaylist(playlist)}
                                                className={`material-symbols-outlined ${styles['card-image-play_arrow-icon']}`}>
                                                play_arrow
                                            </span>
                                            <span
                                                onClick={() => handleExportPlaylist(playlist.id)}
                                                className={`material-symbols-outlined ${styles['card-image-secondary-icon']}`}>
                                                ios_share
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles['card-text-container']}>
                                        <p className={styles['card-title']}>{getPlaylistName(playlist.name)}</p>
                                        <p className={styles['card-count']}>{t('playlists_page.tracks_count', { count: playlist.tracks_count })}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ProcessingModal
                isVisible={isExporting}
                setIsVisible={setIsExporting}
                type='export'
            />

            <ProcessingModal
                isVisible={isImporting}
                setIsVisible={setIsImporting}
                type='import'
            />

            <PlaylistFormModal
                isOpen={isCreating}
                onClose={handleCloseCreateModal}
                onSubmit={handleCreatePlaylist}
                onImport={handleImportPlaylist} />

            <ConfirmModal
                isOpen={Boolean(playlistToDelete)}
                title={confirmModalTexts.title}
                description={confirmModalTexts.description}
                onCancel={handleCloseConfrimModal}
                onConfirm={handleDeletePlaylist}
            />

        </>
    )
}

export default PlaylistsPage