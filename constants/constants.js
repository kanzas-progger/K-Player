const path = require('path')
const { app } = require('electron')

const isDev = !app.isPackaged
const baseDataDir = isDev 
  ? path.join(app.getAppPath(), 'dev-data') 
  : app.getPath('userData')

const mainPlaylistId = 1
const likedPlaylistId = 2
const dislikedPlaylistId = 3

const getCoversDir = () => {
    return path.join(baseDataDir, 'covers')
}

const getPlaylistImagesDir = () => {
    return path.join(baseDataDir, 'playlists')
}

module.exports = {
    mainPlaylistId,
    likedPlaylistId,
    dislikedPlaylistId,
    getCoversDir,
    getPlaylistImagesDir,
    baseDataDir
}