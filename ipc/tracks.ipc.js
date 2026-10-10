const { ipcMain } = require('electron');
const tracksRepository = require('../db/repositories/tracks.repository');

function registerTracksIpc() {
    ipcMain.handle('tracks:create', async (event, data) => {
        return tracksRepository.create(data);
    })
    ipcMain.handle('tracks:getAllForPlaylist', async (event, playlistId) => {
        return tracksRepository.getAllForPlaylist(playlistId)
    })
    ipcMain.handle('tracks:getByIdForPlaylist', async (event, playlistId, trackId) => {
        return tracksRepository.getByIdForPlaylist(playlistId, trackId)
    })
    ipcMain.handle('tracks:updateLastTrack', async(event, trackId, playlistId) => {
        return tracksRepository.updateLastTrack(trackId, playlistId)
    })
    ipcMain.handle('tracks:getLastTrack', async(event) => {
        return tracksRepository.getLastTrack()
    })
}

module.exports = {
    registerTracksIpc,
};