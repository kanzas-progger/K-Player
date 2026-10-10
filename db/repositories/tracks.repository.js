const { getDatabase } = require('../database')
const { likedPlaylistId, dislikedPlaylistId } = require('../../constants/constants')

function create({ absolutePath, duration, name, author, cover }) {
    const db = getDatabase()

    const query = db.prepare(`
        INSERT INTO tracks (
            absolute_path,
            duration,
            name,
            author,
            cover
        )
        VALUES (?, ?, ?, ?, ?)
    `)

    const result = query.run(absolutePath, duration, name, author, cover)

    return {
        id: result.lastInsertRowid,
        absolutePath,
        duration,
        name,
        author,
        cover
    }
}

function getByIdForPlaylist(playlistId, trackId) {
    const db = getDatabase()

    const query = db.prepare(`
        SELECT 
            t.id,
            t.absolute_path,
            t.duration,
            t.name,
            t.author,
            t.cover,
            t.is_liked,
            t.is_disliked,
            t.is_marked,
            pt.playlist_id,
            pt.track_position,
            (
                SELECT json_group_array(pt_all.playlist_id)
                FROM playlists_tracks pt_all
                WHERE pt_all.track_id = t.id
            ) AS playlist_ids
        FROM tracks t
        JOIN playlists_tracks pt ON t.id = pt.track_id
        WHERE pt.playlist_id = ? AND pt.track_id = ?
    `)

    const track = query.get(playlistId, trackId)
    if (!track) return null

    return {
        ...track,
        playlist_ids: JSON.parse(track.playlist_ids || '[]')
    }
}

function getAllForPlaylist(playlistId) {
    const db = getDatabase()

    const query = db.prepare(`
        SELECT 
            t.id,
            t.absolute_path,
            t.duration,
            t.name,
            t.author,
            t.cover,
            t.is_liked,
            t.is_disliked,
            t.is_marked,
            pt.playlist_id,
            pt.track_position,
            (
                SELECT json_group_array(pt_all.playlist_id)
                FROM playlists_tracks pt_all
                WHERE pt_all.track_id = t.id
            ) AS playlist_ids
        FROM tracks t
        JOIN playlists_tracks pt ON t.id = pt.track_id
        WHERE pt.playlist_id = ?
        ORDER BY pt.track_position DESC
    `)

    const tracks = query.all(playlistId)

    return tracks.map(track => ({
        ...track,
        playlist_ids: JSON.parse(track.playlist_ids || '[]')
    }))
}

function updateCover(trackId, cover) {
    const db = getDatabase()

    const query = db.prepare(`
        UPDATE tracks
        SET cover = ?
        WHERE id = ?
    `)

    query.run(cover, trackId)
}

function updateStatusParameters(trackId, field, value) {
    const db = getDatabase()

    const allowedFields = ['is_liked', 'is_disliked', 'is_marked']
    if (!allowedFields.includes(field)) {
        console.error(`[Main process]: updateStatusParameters ${field} is not allowed`)
        return
    }

    const query = db.prepare(`UPDATE tracks SET ${field} = ? WHERE id = ?`)
    return query.run(value, trackId)
}

function deleteTrack(trackId) {
    const db = getDatabase()

    const query = db.prepare('DELETE FROM tracks WHERE id = ?')

    query.run(trackId)
}

function deleteDislikedTracks() {
    const db = getDatabase()

    const executeTransaction = db.transaction(() => {

        const deletedRows = db.prepare('SELECT cover, absolute_path FROM tracks WHERE is_disliked = 1').all()

        db.prepare('DELETE FROM tracks WHERE is_disliked = 1').run()

        db.prepare(`
            WITH Reordered AS (
                SELECT 
                    playlist_id, 
                    track_id, 
                    ROW_NUMBER() OVER (PARTITION BY playlist_id ORDER BY track_position ASC) as new_position
                FROM playlists_tracks
            )
            UPDATE playlists_tracks
            SET track_position = Reordered.new_position
            FROM Reordered
            WHERE playlists_tracks.playlist_id = Reordered.playlist_id 
              AND playlists_tracks.track_id = Reordered.track_id
        `).run()

        // return deletedRows.map(row => row.cover).filter(Boolean)
        return deletedRows
            .map(row => ({
                cover: row.cover || null,
                absolute_path: row.absolute_path || null,
            }))
            .filter(row => row.cover || row.absolute_path)
    })

    return executeTransaction()
}

function resetIsLikedStatus() {
    const db = getDatabase()

    const query = db.prepare('UPDATE tracks SET is_liked = 0 WHERE is_liked = 1')

    query.run()
}

function resetIsDislikedStatus() {
    const db = getDatabase()

    const query = db.prepare('UPDATE tracks SET is_disliked = 0 WHERE is_disliked = 1')

    query.run()
}

function deleteOrphanTracks() {
    const db = getDatabase()

    const query = db.prepare(`
        DELETE FROM tracks
        WHERE id NOT IN (
            SELECT DISTINCT track_id
            FROM playlists_tracks
            WHERE playlist_id NOT IN (?, ?)
        )
        RETURNING cover
    `)

    const deletedRows = query.all(likedPlaylistId, dislikedPlaylistId)
    return deletedRows.map(row => row.cover).filter(Boolean)
}

function updateLastTrack(trackId, playlistId) {
    const db = getDatabase()

    const executeTransaction = db.transaction(() => {
        db.prepare('DELETE FROM last_track').run()
        db.prepare('INSERT INTO last_track (track_id, playlist_id) VALUES (?, ?)').run(trackId, playlistId)
    })

    return executeTransaction()
}

function getLastTrack() {
    const db = getDatabase()

    const query = db.prepare('SELECT * FROM last_track')

    return query.get()
}

module.exports = {
    create,
    getAllForPlaylist,
    getByIdForPlaylist,
    updateCover,
    updateStatusParameters,
    deleteTrack,
    deleteDislikedTracks,
    deleteOrphanTracks,
    resetIsLikedStatus,
    resetIsDislikedStatus,
    updateLastTrack,
    getLastTrack
};