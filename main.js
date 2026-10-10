const { app, BrowserWindow, Menu, ipcMain } = require('electron/main')
const path = require('node:path')
const { initDatabase, closeDatabase } = require('./db/database')
const { registerTracksIpc } = require('./ipc/tracks.ipc')
const { registerPlaylistsIpc } = require('./ipc/playlists.ipc')
const { registerKPlayerIpc } = require('./ipc/kplayer.ipc')
const { registerUserSettingsIpc } = require('./ipc/userSettings.ipc')
const { registerSystemIpc } = require('./ipc/system.ipc')
const { registerKaudioPrivileges, registerKaudioProtocol } = require('./protocols/kaudio.protocol')
const { registerKimageProtocol } = require('./protocols/kimage.protocol')

const isDev = !app.isPackaged


// register protocols prrivileges
registerKaudioPrivileges()

const iconPath = process.platform === 'win32'
  ? path.join(__dirname, 'assets', 'logo.ico')
  : path.join(__dirname, 'assets', 'logo.png');

const createWindow = () => {
  const win = new BrowserWindow({
    minWidth: 1200,
    minHeight: 800,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.maximize()

  if (isDev) {
    win.loadURL('http://localhost:5173')
  }
  else {
    win.loadFile(path.join(__dirname, 'renderer', 'dist', 'index.html'))
  }

  win.webContents.on('before-input-event', (event, input) => {
    if (isDev && input.key === 'F12') {
      win.webContents.toggleDevTools()
    }
  })

  ipcMain.on('setFullscreen', (event, flag) => {
    win.setFullScreen(flag)
  })
}

app.whenReady().then(async () => {

  await initDatabase();

  // register protocols

  registerKaudioProtocol()
  registerKimageProtocol()

  // register Ipc
  registerSystemIpc()
  registerTracksIpc()
  registerPlaylistsIpc()
  registerKPlayerIpc()
  registerUserSettingsIpc()

  Menu.setApplicationMenu(null)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  closeDatabase();
});