const { ipcMain } = require('electron');
const playlistsRepository = require('../db/repositories/playlists.repository')
const playlistsService = require('../services/playlists.service')

function registerPlaylistsIpc() {
    ipcMain.handle('playlists:createPlaylist', async (event, name, absolutePath) => {
        return playlistsService.createPlaylist(name, absolutePath)
    })
    ipcMain.handle('playlists:updatePlaylist', async(event, playlistId, name, absolutePath) => {
        return playlistsService.updatePlaylist(playlistId, name, absolutePath)
    })
    ipcMain.handle('playlists:getAll', async (event) => {
        return playlistsRepository.getAll();
    })
    ipcMain.handle('playlists:getById', async (event, playlistId) => {
        return playlistsRepository.getById(playlistId)
    })
    ipcMain.handle('playlists:getTracksCount', async (event, playlistId) => {
        return playlistsRepository.getTracksCount(playlistId)
    })
    ipcMain.handle('playlists:addToPlaylist', async(event, playlistId, trackId) => {
        return playlistsService.addToPlaylist(playlistId, trackId)
    })
    ipcMain.handle('playlists:addToLiked', async (event, trackId) => {
        return playlistsService.addToLiked(trackId)
    })
    ipcMain.handle('playlists:addToDisliked', async (event, trackId) => {
        return playlistsService.addToDisliked(trackId)
    })
    ipcMain.handle('playlists:deleteFromLiked', async (event, trackId) => {
        return playlistsService.deleteFromLiked(trackId)
    })
    ipcMain.handle('playlists:deleteFromDisliked', async (event, trackId) => {
        return playlistsService.deleteFromDisliked(trackId)
    })
    ipcMain.handle('playlists:deleteFromPlaylist', async (event, track, playlistId) => {
        return await playlistsService.deleteFromPlaylist(track, playlistId)
    })
    ipcMain.handle('playlists:exportPlaylist', async (event, playlistId) => {
        return playlistsService.exportPlaylist(event, playlistId)
    })
    ipcMain.handle('playlists:importPlaylist', async (event) => {
        return playlistsService.importPlaylist(event)
    })
    ipcMain.handle('playlists:deletePlaylist', async (event, playlist) => {
        return playlistsService.deletePlaylist(playlist)
    })
}

module.exports = {
    registerPlaylistsIpc,
};