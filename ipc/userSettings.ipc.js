const { ipcMain } = require('electron');
const userSettingsRepository = require('../db/repositories/userSettings.repository')

function registerUserSettingsIpc() {
    ipcMain.handle('userSettings:getUserSettings', async (event) => {
        return userSettingsRepository.getUserSettings()
    })

    ipcMain.handle('userSettings:updateUserSettings', async (event, data) => {
        return userSettingsRepository.updateUserSettings(data)
    })
}

module.exports = {
    registerUserSettingsIpc
}
