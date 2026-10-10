import NowPlaying from '../../components/NowPlaying/NowPlaying'
import TrackList from '../../components/TrackList/TrackList'
import LibraryEmpty from '../../components/LibraryEmpty/LibraryEmpty'
import { useEffect, useRef, useMemo } from 'react'
import { useTracks } from '../../components/contexts/TracksContext'
import { DISLIKED_PLAYLIST_ID, MAIN_PLAYLIST_ID, LIKED_PLAYLIST_ID } from '../../constants/systemPlaylists'

const HomePage = ({
    playlist,
    setSelectedPlaylist,
    playlists,
    setPlaylists,
    onUpdateTracksCount,
    lastPlayedTrack,
    isInitialScrollDone,
    setIsInitialScrollDone,
    playlistCountInDropDown }) => {

    const { tracks, getTracks } = useTracks()
    const scrollParentRef = useRef(null)

    useEffect(() => {
        getTracks(playlist.id)
    }, [getTracks, playlist.id])

    const filteredPlaylists = useMemo(() => {
        return playlists.filter(playlist => ![DISLIKED_PLAYLIST_ID, MAIN_PLAYLIST_ID, LIKED_PLAYLIST_ID].includes(playlist.id))
    }, [playlists])


    return (
        <>
            <div
                ref={scrollParentRef}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    minHeight: 0,
                    padding: '0 20px 10px 20px',
                    overflowY: 'auto',
                }}>

                {tracks.length === 0 && playlist.id === MAIN_PLAYLIST_ID ? (<>
                    <LibraryEmpty setPlaylists={setPlaylists} />
                </>) : <>
                    <NowPlaying />
                    <TrackList
                        tracks={tracks}
                        scrollParentRef={scrollParentRef}
                        playlist={playlist}
                        setSelectedPlaylist={setSelectedPlaylist}
                        playlists={filteredPlaylists}
                        setPlaylists={setPlaylists}
                        onUpdateTracksCount={onUpdateTracksCount}
                        lastPlayedTrack={lastPlayedTrack}
                        isInitialScrollDone={isInitialScrollDone}
                        setIsInitialScrollDone={setIsInitialScrollDone}
                        playlistCountInDropDown={playlistCountInDropDown} />
                </>}

            </div>
        </>
    )
}

export default HomePage