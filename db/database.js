const fs = require('node:fs/promises')
const path = require('node:path')
const Database = require('better-sqlite3')
const { mainPlaylistId, likedPlaylistId, dislikedPlaylistId, baseDataDir } = require('../constants/constants')

let db = null

function getDatabaseFile() {
    return path.join(baseDataDir, 'database.sqlite')
}

async function initDatabase() {
    if (db) {
        return db
    }

    const databaseFile = getDatabaseFile()

    await fs.mkdir(path.dirname(databaseFile), { recursive: true })

    db = new Database(databaseFile)

    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')

    initTables(db)
    initSystemPlaylists(db)
    initUserSettings(db)

    console.log('[SQLite] Database file:', databaseFile)

    return db
}

function initTables(db) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS playlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            image TEXT        
        );

        CREATE TABLE IF NOT EXISTS tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            absolute_path TEXT NOT NULL,
            duration TEXT NOT NULL DEFAULT '0',
            name TEXT NOT NULL,
            author TEXT NOT NULL DEFAULT 'Unknown',
            cover TEXT DEFAULT NULL,
            is_liked INTEGER NOT NULL DEFAULT 0,
            is_disliked INTEGER NOT NULL DEFAULT 0,
            is_marked INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS playlists_tracks (
            playlist_id INTEGER,
            track_id INTEGER,
            track_position INTEGER NOT NULL,

            PRIMARY KEY (playlist_id, track_id),
            UNIQUE(playlist_id, track_position),

            FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE,
            FOREIGN KEY (track_id) REFERENCES tracks (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS last_track (
            track_id INTEGER,
            playlist_id INTEGER,
            
            PRIMARY KEY (playlist_id, track_id),

            FOREIGN KEY (track_id) REFERENCES tracks (id) ON DELETE CASCADE,
            FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS user_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );`)
}

function initSystemPlaylists(db) {
    const playlists = [
        [mainPlaylistId, 'My Tracks'],
        [likedPlaylistId, 'Liked Songs'],
        [dislikedPlaylistId, 'Disliked Songs'],
    ]

    const sql = db.prepare(`
        INSERT OR IGNORE INTO playlists
            (id, name, image)
        VALUES (?, ?, NULL)
    `)

    const transaction = db.transaction(() => {
        for (const [id, name] of playlists) {
            sql.run(id, name)
        }
    })

    transaction()
}

function initUserSettings(db) {
    const userSettings = [
        ['language', 'en'],
        ['theme', 'dark'],
        ['showDislikedSongsPlaylist', 'true'],
        ['isDeleteDislikedTracksFromSystemEnabled', 'false'],
        ['playlistCountInDropDown', '10']
    ]

    const sql = db.prepare(`
        INSERT OR IGNORE INTO user_settings
            (key, value)
        VALUES (?, ?)
    `)

    const transaction = db.transaction(() => {
        for (const [key, value] of userSettings) {
            sql.run(key, value)
        }
    })

    transaction()
}

function getDatabase() {
    if (!db) {
        throw new Error('Database is not initialized')
    }

    return db
}

function closeDatabase() {
    if (db) {
        db.close()
        db = null
    }
}

module.exports = {
    getDatabaseFile,
    getDatabase,
    initDatabase,
    closeDatabase,
}