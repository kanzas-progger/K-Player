const { contextBridge, ipcRenderer, webUtils, shell } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  main: {
    getAbsolutePath: (file) => {
      return webUtils.getPathForFile(file)
    },
    openExternalLink: (url) => {
      return ipcRenderer.invoke('system:openExternalLink', url)
    },
    onLoadProgress: (callback) => {
      const subscription = (_event, value) => callback(value)
      ipcRenderer.on('system:loadProgress', subscription)
      return () => ipcRenderer.removeListener('system:loadProgress', subscription)
    }
  },
  tracks: {
    create: (data) => {
      return ipcRenderer.invoke('tracks:create', data)
    },
    getAllForPlaylist: (playlistId) => {
      return ipcRenderer.invoke('tracks:getAllForPlaylist', playlistId)
    },
    getByIdForPlaylist: (playlistId, trackId) => {
      return ipcRenderer.invoke('tracks:getByIdForPlaylist', playlistId, trackId)
    },
    updateLastTrack: (trackId, playlistId) => {
      return ipcRenderer.invoke('tracks:updateLastTrack', trackId, playlistId)
    },
    getLastTrack: () => {
      return ipcRenderer.invoke('tracks:getLastTrack')
    }
  },
  playlists: {
    createPlaylist: (name, absolutePath) => {
      return ipcRenderer.invoke('playlists:createPlaylist', name, absolutePath)
    },
    updatePlaylist: (playlistId, name, absolutePath) => {
      return ipcRenderer.invoke('playlists:updatePlaylist', playlistId, name, absolutePath)
    },
    getAll: () => {
      return ipcRenderer.invoke('playlists:getAll')
    },
    getById: (playlistId) => {
      return ipcRenderer.invoke('playlists:getById', playlistId)
    },
    getTracksCount: (pyalistId) => {
      return ipcRenderer.invoke('playlists:getTracksCount', pyalistId)
    },
    addToPlaylist: (playlistId, trackId) => {
      return ipcRenderer.invoke('playlists:addToPlaylist', playlistId, trackId)
    },
    addToLiked: (trackId) => {
      return ipcRenderer.invoke('playlists:addToLiked', trackId)
    },
    addToDisliked: (trackId) => {
      return ipcRenderer.invoke('playlists:addToDisliked', trackId)
    },
    deleteFromLiked: (trackId) => {
      return ipcRenderer.invoke('playlists:deleteFromLiked', trackId)
    },
    deleteFromDisliked: (trackId) => {
      return ipcRenderer.invoke('playlists:deleteFromDisliked', trackId)
    },
    deleteFromPlaylist: (track, playlistId) => {
      return ipcRenderer.invoke('playlists:deleteFromPlaylist', track, playlistId)
    },
    deletePlaylist: (playlist) => {
      return ipcRenderer.invoke('playlists:deletePlaylist', playlist)
    },
    exportPlaylist: (playlistId) => {
      return ipcRenderer.invoke('playlists:exportPlaylist', playlistId)
    },
    importPlaylist: () => {
      return ipcRenderer.invoke('playlists:importPlaylist')
    }
  },
  userSettings: {
    getUserSettings: () => {
      return ipcRenderer.invoke('userSettings:getUserSettings')
    },
    updateUserSettings: (data) => {
      return ipcRenderer.invoke('userSettings:updateUserSettings', data)
    }
  },
  setFullscreen: (flag) => {
    ipcRenderer.send('setFullscreen', flag)
  },
  kplayer: {
    loadTracks: (playlistId, uploadType) => {
      return ipcRenderer.invoke('kplayer:loadTracks', playlistId, uploadType)
    },
    readAudioFile: (absolutePath) => {
      return ipcRenderer.invoke('kplayer:readAudioFile', absolutePath)
    },
    getPreviousAndNextTrackIds: (playlistId, trackPosition) => {
      return ipcRenderer.invoke('kplayer:getPreviousAndNextTrackIds', playlistId, trackPosition)
    }
  }
})