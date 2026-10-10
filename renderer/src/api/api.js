export const getAbsolutePath = (file) => {
    return window.electronAPI.main.getAbsolutePath(file)
}

export const openExternalLink = (url) => {
    return window.electronAPI.main.openExternalLink(url)
}

export const getAllTracksForPlaylist = async (playlistId) => {
    return await window.electronAPI.tracks.getAllForPlaylist(playlistId)
}

export const getTrackById = async (playlistId, trackId) => {
    return await window.electronAPI.tracks.getByIdForPlaylist(playlistId, trackId)
}

export const createTrack = async (data) => {
    return await window.electronAPI.tracks.create(data)
}

export const updateLastTrack = async (trackId, playlistId) => {
    return await window.electronAPI.tracks.updateLastTrack(trackId, playlistId)
}

export const getLastTrack = async () => {
    return await window.electronAPI.tracks.getLastTrack()
}

export const readAudioFile = async (absolutePath) => {
    return await window.electronAPI.kplayer.readAudioFile(absolutePath)
}

export const getUserSettings = async () => {
    return await window.electronAPI.userSettings.getUserSettings()
}

export const updateUserSettings = async (data) => {
    return await window.electronAPI.userSettings.updateUserSettings(data)
}

export const loadTracks = async (playlistId, uploadType) => {
    return await window.electronAPI.kplayer.loadTracks(playlistId, uploadType)
}

export const getPreviousAndNextTrackIds = async (playlistId, trackPosition) => {
    return await window.electronAPI.kplayer.getPreviousAndNextTrackIds(playlistId, trackPosition)
}

export const getTracksCount = async (playlistId) => {
    return await window.electronAPI.playlists.getTracksCount(playlistId)
}

export const addTrackToLiked = async (trackId) => {
    return await window.electronAPI.playlists.addToLiked(trackId)
}

export const addTrackToDisliked = async (trackId) => {
    return await window.electronAPI.playlists.addToDisliked(trackId)
}

export const deleteTrackFromLiked = async (trackId) => {
    return await window.electronAPI.playlists.deleteFromLiked(trackId)
}

export const deleteTrackFromDisliked = async (trackId) => {
    return await window.electronAPI.playlists.deleteFromDisliked(trackId)
}

export const getAllPlaylists = async () => {
    return await window.electronAPI.playlists.getAll()
}

export const getPlaylistById = async (playlistId) => {
    return await window.electronAPI.playlists.getById(playlistId)
}

export const deleteFromPlaylist = async (track, playlistId) => {
    return await window.electronAPI.playlists.deleteFromPlaylist(track, playlistId)
}

export const exportPlaylist = async (playlistId) => {
    return await window.electronAPI.playlists.exportPlaylist(playlistId)
}

export const importPlaylist = async () => {
    return await window.electronAPI.playlists.importPlaylist()
}

export const createPlaylist = async (name, absolutePath) => {
    return await window.electronAPI.playlists.createPlaylist(name, absolutePath)
}

export const updatePlaylist = async (playlistId, name, absolutePath) => {
    return await window.electronAPI.playlists.updatePlaylist(playlistId, name, absolutePath)
}

export const deletePlaylist = async (playlist) => {
    return await window.electronAPI.playlists.deletePlaylist(playlist)
}

export const addToPlaylist = async (playlistId, trackId) => {
    return await window.electronAPI.playlists.addToPlaylist(playlistId, trackId)
}