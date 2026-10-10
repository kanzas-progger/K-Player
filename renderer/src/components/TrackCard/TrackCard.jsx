import styles from './TrackCard.module.css'
import { formatDuration } from '../../common/helpers'
import { useMemo, useState } from 'react'
import { Dropdown, ConfigProvider } from 'antd'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { LIKED_PLAYLIST_ID, DISLIKED_PLAYLIST_ID } from '../../constants/systemPlaylists'
import PlaylistsModal from '../PlaylistsModal/PlaylistsModal'

const dropDownTheme = {
    components: {
        Dropdown: {
            colorBgElevated: 'var(--color-surface-hover)',
            borderRadiusLG: 10,
            paddingXXS: 10,

            colorText: 'var(--color-text-default)',
            fontSize: 14,
            fontFamily: 'Hanken Grotesk, sans-serif',

            controlItemBgHover: 'var(--color-dropdown-item-hover)'
        },
    },
}

const TrackCard = ({
    track,
    playlists,
    isCurrentTrackIsPlaying,
    isCurrentTrackIsPaused,
    onPlay,
    onPause,
    onResume,
    onDeleteFromPlaylist,
    onAddToPlaylist,
    onLike,
    onDislike,
    playlistCountInDropDown }) => {

    const { t } = useTranslation()

    const [dropDownOpen, setDropDownOpen] = useState(false)
    const [isPlaylistsModalOpen, setIsPlaylistsModalOpen] = useState(false)

    const handleDropDownOpenChange = (nextOpen, info) => {

        if (info.source === 'menu') {
            return;
        }
        setDropDownOpen(nextOpen)
    }

    const isActive = isCurrentTrackIsPlaying || isCurrentTrackIsPaused

    const coverUrl = track?.cover ? `k-image://track/${track?.cover}` : null

    const filteredPlaylists = useMemo(() => {
        return (playlists || []).filter((p) => p.id !== track?.playlist_id)
    }, [playlists, track?.playlist_id])

    const menuItems = useMemo(() => {
        const trackPlaylistIds = track?.playlist_ids || []

        let playlistChildren = []

        if (playlists.length > 0) {

            const visiblePlaylists = filteredPlaylists.slice(0, playlistCountInDropDown)

            playlistChildren = visiblePlaylists.map((playlist) => {
                const isAlreadyInPlaylist = trackPlaylistIds.includes(playlist.id)

                return {
                    key: playlist.id,
                    label: playlist.name,
                    //title: playlist.name, TO DO: customize title
                    extra: isAlreadyInPlaylist ? <span style={{ color: 'var(--color-text-default)' }}>✓</span> : null,
                    disabled: false,
                    onClick: isAlreadyInPlaylist
                        ? () => onDeleteFromPlaylist(track, playlist.id)
                        : () => {
                            onAddToPlaylist(playlist.id, track.id)
                        }
                }
            })

            if (filteredPlaylists.length > playlistCountInDropDown) {
                playlistChildren.push({
                    key: 'show-all-playlists',
                    label: t('trackCard.display_all_playlists'),
                    onClick: () => handleOpenPlaylistsModal()
                })
            }
        } else {
            playlistChildren = [
                {
                    key: 'no-playlists',
                    label: t('trackCard.no_playlists'),
                    disabled: false
                }
            ]
        }

        return [
            {
                key: '1',
                label: t('trackCard.add_to_playlist'),
                icon: <span className={`${styles['dropdown-menu-icon']} ${styles['dropdown-menu-playlist_add-icon']}`}>playlist_add</span>,
                popupClassName: styles['playlists-submenu'],
                children: playlistChildren
            },
            {
                key: '2',
                label: t('trackCard.delete'),
                icon: <span className={`${styles['dropdown-menu-icon']} ${styles['dropdown-menu-delete-icon']}`}>delete</span>,
                onClick: () => onDeleteFromPlaylist(track, track.playlist_id)
            }
        ]
    }, [t, onDeleteFromPlaylist, onAddToPlaylist, track, playlists])

    const handleOpenPlaylistsModal = () => {
        setIsPlaylistsModalOpen(true)
        setDropDownOpen(false)
    }

    const handleClosePlaylistsModal = () => {
        setIsPlaylistsModalOpen(false)
    }

    return (
        <>
            <div className={`${styles['item-container']} ${isCurrentTrackIsPlaying || isCurrentTrackIsPaused ? styles['item-container-active'] : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%', justifyContent: 'space-between' }}>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>

                        <div className={styles['item-cover-wrapper']}>

                            {coverUrl !== null ? <>
                                <img
                                    src={coverUrl}
                                    loading='lazy'
                                    className={`${styles['item-cover']} ${isActive ? styles['item-cover-active'] : ''}`}
                                />
                            </> : <>
                                <div className={`${styles['item-cover']} ${styles['item-cover-empty']} ${isActive ? styles['item-cover-active'] : ''}`}>
                                    <span className={`material-symbols-outlined ${styles['item-music_note_2-icon']}`}>music_note_2</span>
                                </div>
                            </>}

                            {isActive ? <>
                                <div className={`${styles['playing-bars']} ${isCurrentTrackIsPlaying ? styles['is-playing'] : ''}`}>
                                    <div className={styles['bar']}></div>
                                    <div className={styles['bar']}></div>
                                    <div className={styles['bar']}></div>
                                    <div className={styles['bar']}></div>
                                    <div className={styles['bar']}></div>
                                </div>
                                <span
                                    onClick={isCurrentTrackIsPlaying ? onPause : onResume}
                                    className={`material-symbols-outlined ${styles['item-play_arrow-icon']}`}
                                >
                                    {isCurrentTrackIsPlaying ? 'pause' : 'play_arrow'}
                                </span>
                            </> : <>
                                <span
                                    onClick={() => onPlay(track)}
                                    className={`material-symbols-outlined ${styles['item-play_arrow-icon']}`}
                                >
                                    play_arrow
                                </span>
                            </>}

                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <p className={`${styles['item-text-name']} ${isActive ? styles['item-text-name-active'] : ''}`}>{track.name}</p>
                            <p className={`${styles['item-text-author']} ${isActive ? styles['item-text-author-active'] : ''}`}>{track.author}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginRight: '20px', alignItems: 'center' }}>
                        {track.playlist_id !== LIKED_PLAYLIST_ID && track.playlist_id !== DISLIKED_PLAYLIST_ID && (
                            <>
                                <span
                                    onClick={() => onLike(track)}
                                    className={`material-symbols-outlined ${track.is_liked === 1
                                        ? styles['item-favorite-icon-filled']
                                        : `${styles['item-favorite-icon']} ${isActive ? styles['item-favorite-icon-active'] : ''}`
                                        }`}
                                >
                                    favorite
                                </span>
                                <span
                                    onClick={() => onDislike(track)}
                                    className={`material-symbols-outlined ${track.is_disliked === 1
                                        ? styles['item-thumb_down-icon-filled']
                                        : `${styles['item-thumb_down-icon']} ${isActive ? styles['item-thumb_down-icon-active'] : ''}`
                                        }`}
                                >
                                    thumb_down
                                </span>
                            </>
                        )}


                        <p className={styles['item-duration']}>{formatDuration(parseInt(track?.duration))}</p>
                        <ConfigProvider
                            theme={dropDownTheme}
                        >
                            <Dropdown
                                menu={{
                                    items: menuItems,
                                    selectable: false,
                                    multiple: true,
                                    subMenuCloseDelay: 0.3
                                }}
                                open={dropDownOpen}
                                onOpenChange={handleDropDownOpenChange}
                                placement="bottomRight"
                                trigger={['click']}
                            >
                                <span
                                    onClick={(e) => e.stopPropagation()}
                                    className={`material-symbols-outlined ${styles['item-more_vert-icon']}`}>
                                    more_vert
                                </span>
                            </Dropdown>
                        </ConfigProvider>

                    </div>
                </div>
            </div>

            <PlaylistsModal
                playlists={filteredPlaylists}
                track={track}
                isOpen={isPlaylistsModalOpen}
                onClose={handleClosePlaylistsModal}
                onAddToPlaylist={onAddToPlaylist}
                onDeleteFromPlaylist={onDeleteFromPlaylist}
            />
        </>

    )
}

export default React.memo(TrackCard)