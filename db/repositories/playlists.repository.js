const { getDatabase } = require('../database')
const { likedPlaylistId, dislikedPlaylistId } = require('../../constants/constants')

function create(name){
    const db = getDatabase()

    const query = db.prepare('INSERT INTO playlists (name) VALUES (?)')

    const result = query.run(name)

    return getById(result.lastInsertRowid)
}

function updateName(playlistId, name){
    const db = getDatabase()
    const query = db.prepare('UPDATE playlists SET name = ? WHERE id = ?')

    query.run(name, playlistId)
}

function updateImage(playlistId, image){
    const db = getDatabase()

    const query = db.prepare('UPDATE playlists SET image = ? WHERE id = ?')

    query.run(image, playlistId)
}

function getAll() {
    const db = getDatabase()

    const query = db.prepare(`
        SELECT 
            p.*,
            COUNT(pt.track_id) AS tracks_count
        FROM playlists p
        LEFT JOIN playlists_tracks pt ON p.id = pt.playlist_id
        GROUP BY p.id
    `)

    return query.all()
}

function getById(playlistId) {
    const db = getDatabase()

    const query = db.prepare('SELECT * FROM playlists WHERE id = ?')

    return query.get(playlistId)
}

function getTracksCount(playlistId) {
    const db = getDatabase()

    const query = db.prepare('SELECT COUNT(*) as tracks_count FROM playlists_tracks WHERE playlist_id = ?')
    const result = query.get(playlistId)

    return result ? result.tracks_count : 0
}

function addTrackToPlaylist(playlistId, trackId, trackPosition) {
    const db = getDatabase()

    const query = db.prepare('INSERT OR REPLACE INTO playlists_tracks (playlist_id, track_id, track_position) VALUES (?, ?, ?)')

    query.run(playlistId, trackId, trackPosition)
}

function getMaxPositionInPlaylist(playlistId) {
    const db = getDatabase()

    const query = db.prepare(`
        SELECT COALESCE(MAX(track_position), 0) as maxPosition
        FROM playlists_tracks
        WHERE playlist_id = ?
    `)

    return query.get(playlistId).maxPosition
}

function getTrackIdByPosition(playlistId, trackPosition) {
    const db = getDatabase()

    const query = db.prepare(`
        SELECT track_id FROM playlists_tracks
        WHERE playlist_id = ? AND track_position = ?
    `)

    return query.get(playlistId, trackPosition).track_id
}


function deleteTrackFromPlaylist(playlistId, trackId) {
    const db = getDatabase()

    const deleteAndShiftPositions = db.transaction(() => {

        const trackInPlaylist = db.prepare(`
            SELECT track_position 
            FROM playlists_tracks 
            WHERE playlist_id = ? AND track_id = ?
        `).get(playlistId, trackId)

        if (!trackInPlaylist) return

        const currentPosition = trackInPlaylist.track_position

        db.prepare(`
            DELETE FROM playlists_tracks 
            WHERE playlist_id = ? AND track_id = ?
        `).run(playlistId, trackId)

        db.prepare(`
            UPDATE playlists_tracks 
            SET track_position = track_position - 1 
            WHERE playlist_id = ? AND track_position > ?
        `).run(playlistId, currentPosition)
    })

    deleteAndShiftPositions()
}

function isTrackInAnyPlaylist(trackId){
    const db = getDatabase()

    //const query = db.prepare('SELECT 1 FROM playlists_tracks WHERE track_id = ? LIMIT 1')
    const query = db.prepare(`
        SELECT 1 
        FROM playlists_tracks 
        WHERE track_id = ? 
          AND playlist_id NOT IN (?, ?) 
        LIMIT 1
    `)

    return query.get(trackId, likedPlaylistId, dislikedPlaylistId) !== undefined
}

function isTrackInPlaylist(trackId, playlistId){
    const db = getDatabase()

    const query = db.prepare('SELECT 1 FROM playlists_tracks WHERE playlist_id = ? AND track_id = ? LIMIT 1')

    return query.get(playlistId, trackId) !== undefined  
}

function isPlaylistExists(playlistId) {
    const db = getDatabase()

    const query = db.prepare('SELECT 1 FROM playlists WHERE id = ? LIMIT 1')

    return query.get(playlistId) !== undefined
}

function deletePlaylist(playlisId){
    const db = getDatabase()

    const query = db.prepare('DELETE FROM playlists WHERE id = ?')

    query.run(playlisId)
}

function deleteFromPlaylistsTracks(playlistId){
    const db = getDatabase()

    const query = db.prepare('DELETE FROM playlists_tracks WHERE playlist_id = ?')

    query.run(playlistId)
}

module.exports = {
    create,
    updateName,
    getAll,
    getById,
    getTracksCount,
    getMaxPositionInPlaylist,
    addTrackToPlaylist,
    getTrackIdByPosition,
    deleteTrackFromPlaylist,
    isTrackInAnyPlaylist,
    isTrackInPlaylist,
    isPlaylistExists,
    updateImage,
    deletePlaylist,
    deleteFromPlaylistsTracks
}