import { useState, useEffect, useCallback, useMemo } from 'react'
import './App.css'
import logo from './assets/png/logo.png'

import HomePage from './pages/HomePage/HomePage'
import SettingsPage from './pages/SettingsPage/SettingsPage'
import PlaylistsPage from './pages/PlaylistsPage/PlaylistsPage'
import AboutPage from './pages/AboutPage/AboutPage'

import KPlayer from './components/KPlayer/KPlayer'
import HeaderLogo from './components/HeaderLogo/HeaderLogo'
import LeftMenu from './components/LeftMenu/LeftMenu'

import { KPlayerProvider } from './components/contexts/KPlayerContext'
import { TracksProvider } from './components/contexts/TracksContext'

import { getUserSettings, updateUserSettings, getPlaylistById, getLastTrack, getTrackById, getAllPlaylists } from './api/api'

import { useTranslation } from 'react-i18next'

import { MAIN_PLAYLIST_ID, DISLIKED_PLAYLIST_ID } from './constants/systemPlaylists'

function App() {
    const { t, i18n } = useTranslation()

    const [currentPath, setCurrentPath] = useState('/home')
    const [userSettings, setUserSettings] = useState(null)
    const [selectedPlaylist, setSelectedPlaylist] = useState(null)
    const [playlists, setPlaylists] = useState([])
    const [lastPlayedTrack, setLastPlayedTrack] = useState(null)

    const [isInitialScrollDone, setIsInitialScrollDone] = useState(false)

    useEffect(() => {
        const initUserSettings = async () => {
            try {
                const userSettings = await getUserSettings()
                setUserSettings(userSettings)

                const language = userSettings?.find(s => s.key === 'language')?.value || 'en'
                const theme = userSettings?.find(s => s.key === 'theme')?.value || 'dark'

                i18n.changeLanguage(language)
                document.documentElement.dataset.theme = theme

            } catch (error) {
                console.error('[Renderer proccess] Failed to load user_settings', error)
                const savedLanguage = localStorage.getItem('app_language') || 'en';
                i18n.changeLanguage(savedLanguage)
                setUserSettings([
                    { key: 'language', value: savedLanguage },
                    { key: 'theme', value: 'dark' },
                    { key: 'showDislikedSongsPlaylist', value: 'true' },
                    { key: 'isDeleteDislikedTracksFromSystemEnabled', value: 'false' },
                    { key: 'playlistCountInDropDown', value: '10' }
                ])
            }
        }
        initUserSettings();
    }, [i18n])

    useEffect(() => {
        const initMainPlaylist = async () => {
            const playlistData = await getPlaylistById(MAIN_PLAYLIST_ID)
            setSelectedPlaylist(playlistData)
        }

        initMainPlaylist()
    }, [])

    useEffect(() => {
        const initLastTrack = async () => {
            const lastPlayedTrackData = await getLastTrack()
            if (lastPlayedTrackData) {
                const lastTrack = await getTrackById(lastPlayedTrackData.playlist_id, lastPlayedTrackData.track_id)
                setLastPlayedTrack(lastTrack)
            }
        }

        initLastTrack()
    }, [])

    useEffect(() => {
        const initAllPlaylists = async () => {
            const allPlaylists = await getAllPlaylists()
            setPlaylists(allPlaylists)
        }
        initAllPlaylists()
    }, [])

    const visiblePlaylists = useMemo(() => {
        const showDisliked = userSettings?.find(s => s.key === 'showDislikedSongsPlaylist')?.value !== 'false'

        if (showDisliked) {
            return playlists
        }

        return playlists.filter(playlist => playlist.id !== DISLIKED_PLAYLIST_ID)
    }, [playlists, userSettings])

    const isDeleteDislikedTracksFromSystemEnabled = useMemo(() => {
        const isEnabled = userSettings?.find(s => s.key === 'isDeleteDislikedTracksFromSystemEnabled')?.value || 'false'

        return JSON.parse(isEnabled)
    }, [userSettings])

    const playlistCountInDropDown = useMemo(() => {
        const countString = userSettings?.find(s => s.key === 'playlistCountInDropDown')?.value || '10'

        return parseInt(countString, 10)
    }, [userSettings])

    const handleUpdateTracksCountForPlaylist = useCallback((playlistId, action) => {
        setPlaylists(prev =>
            prev.map(playlist => {
                if (playlist.id === playlistId) {
                    const currentCount = playlist.tracks_count || 0
                    const updatedCount = action === 'add'
                        ? currentCount + 1
                        : Math.max(0, currentCount - 1)

                    return { ...playlist, tracks_count: updatedCount }
                }
                return playlist
            })
        )
    }, [])

    const handleUpdateUserSettings = useCallback(async (updatedSetting) => {
        try {
            await updateUserSettings(updatedSetting)

            setUserSettings(prevSettings => {
                if (!prevSettings) return [updatedSetting]

                const newSettings = prevSettings.map(setting =>
                    setting.key === updatedSetting.key ? updatedSetting : setting
                )

                return newSettings
            })

        } catch (error) {
            console.error('[Renderer process] Failed to update user_settings', error)
        }
    }, [i18n])

    const handleChangePlaylist = useCallback((playlist) => {
        setSelectedPlaylist(playlist)
        setCurrentPath('/home')
    }, [])

    if (userSettings === null || selectedPlaylist === null) {
        return <div className="loading-container">

            <div className="loading-inner">
                <img src={logo} alt='logo' />
                <p>{t('app.loading_text')}</p>
            </div>
        </div>
    }
    return (
        <>
            <KPlayerProvider>
                <TracksProvider>
                
                    <HeaderLogo />

                    <div className="app-layout">
                        <LeftMenu
                            currentPath={currentPath}
                            onNavigate={setCurrentPath}
                        />

                        <main className="page-content">

                            <div style={{ display: currentPath === '/home' ? 'contents' : 'none' }}>
                                <HomePage
                                    playlist={selectedPlaylist}
                                    setSelectedPlaylist={setSelectedPlaylist}
                                    playlists={playlists}
                                    setPlaylists={setPlaylists}
                                    onUpdateTracksCount={handleUpdateTracksCountForPlaylist}
                                    lastPlayedTrack={lastPlayedTrack}
                                    isInitialScrollDone={isInitialScrollDone}
                                    setIsInitialScrollDone={setIsInitialScrollDone}
                                    playlistCountInDropDown={playlistCountInDropDown} />
                            </div>

                            {currentPath === '/playlists' && <PlaylistsPage
                                onSelectPlaylist={handleChangePlaylist}
                                playlists={visiblePlaylists}
                                setPlaylists={setPlaylists}
                                isDeleteDislikedTracksFromSystemEnabled={isDeleteDislikedTracksFromSystemEnabled} />}

                            {currentPath === '/settings' && (
                                <SettingsPage
                                    userSettings={userSettings}
                                    onUpdateUserSettings={handleUpdateUserSettings}
                                />
                            )}

                            {currentPath === '/about' && (
                                <AboutPage />
                            )}
                        </main>
                    </div>

                    <KPlayer initialTrack={lastPlayedTrack} />
                </TracksProvider>
            </KPlayerProvider>
        </>
    );
}

export default App
