const { ipcMain, shell } = require('electron')

function registerSystemIpc() {
    ipcMain.handle('system:openExternalLink', async (event, url) => {
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            await shell.openExternal(url)
        }
    })
}

module.exports = {
    registerSystemIpc
}