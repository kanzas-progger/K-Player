const { getDatabase } = require('../database');

function getUserSettings() {
    const db = getDatabase()

    const query = db.prepare('SELECT * FROM user_settings')

    return query.all()
}

function getIsDeleteDislikedTracksFromSystemEnabledValue(){
    const db = getDatabase()

    const query = db.prepare("SELECT value FROM user_settings WHERE key = 'isDeleteDislikedTracksFromSystemEnabled'")

    const row = query.get()
    return row ? JSON.parse(row.value) : null
}

function updateUserSettings({ key, value }) {
    const db = getDatabase()

    const query = db.prepare('UPDATE user_settings SET value = ? WHERE key = ?')

    query.run(value, key)
}

module.exports = {
    getUserSettings,
    getIsDeleteDislikedTracksFromSystemEnabledValue,
    updateUserSettings
}