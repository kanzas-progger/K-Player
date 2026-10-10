const { ipcMain } = require('electron');
const kplayerService = require('../services/kplayer.service')

function registerKPlayerIpc() {
    ipcMain.handle('kplayer:loadTracks', async (event, playlistId, uploadType) => {
        return await kplayerService.loadTracks(event, playlistId, uploadType);
    })
    ipcMain.handle('kplayer:readAudioFile', async (event, absolutePath) => {
        return await kplayerService.readAudioFile(absolutePath)
    })
    ipcMain.handle('kplayer:getPreviousAndNextTrackIds', async (event, playlistId, trackPosition) => {
        return kplayerService.getPreviousAndNextTrackIds(playlistId, trackPosition)
    })
}

module.exports = {
    registerKPlayerIpc,
};
