const fs = require('fs/promises')
const path = require('path')
const { getCoversDir, getPlaylistImagesDir } = require('../constants/constants')

async function saveCoverAndReturnFileAsync(trackId, coverBuffer) {
    if (!coverBuffer) return null

    try {
        const fileName = `${trackId}.jpg`
        const filePath = path.join(getCoversDir(), fileName)

        await fs.writeFile(filePath, coverBuffer)

        return fileName
    } catch (error) {
        console.error(`[Main process]: saveCoverAndReturnFileAsync ${trackId}:`, error)
        return null
    }
}

async function savePlaylistImageAndReturnFileAsync(playlistId, absolutePath) {
    if (!absolutePath) return null

    try {
        const extension = path.extname(absolutePath)
        const fileName = `${playlistId}${extension}`
        const filePath = path.join(getPlaylistImagesDir(), fileName)

        await fs.copyFile(absolutePath, filePath)

        return fileName
    } catch (error) {
        console.error(`[Main process]: savePlaylistImageAndReturnFileAsync ${playlistId}:`, error)
        return null
    }
}

async function copyImageAsync(sourcePath, destinationPath) {
    try {
        await fs.access(sourcePath)
        await fs.copyFile(sourcePath, destinationPath)
    } catch (error) {
        console.error('[Main process]: copyPlaylistImageAsync: ', error)
        return null
    }
}

async function deleteImageByFileNameAsync(fileName, type = 'track') {
    if (!fileName) return

    try {
        const targetDir = type === 'playlist' ? getPlaylistImagesDir() : getCoversDir()
        const filePath = path.join(targetDir, path.basename(fileName))

        await fs.unlink(filePath)
    } catch (error) {
        console.error(`[Main process]: deleteImageByFileNameAsync ${fileName}:`, error)
    }
}

async function deleteImagesByFileNameAsync(fileNames, type = 'track') {
    if (!Array.isArray(fileNames) || fileNames.length === 0) return

    const deletePromises = fileNames
        .filter(Boolean)
        .map(fileName => deleteImageByFileNameAsync(fileName, type))

    await Promise.all(deletePromises)
}

async function deleteTrackByAbsolutePathAsync(absolutePath) {
    if (!absolutePath) return

    try {
        await fs.unlink(absolutePath)
    } catch (error) {
        console.error(`[Main process]: deleteTracksByAbsolutePathAsync ${absolutePath}:`, error)
    }
}

async function deleteTracksByAbsolutePathAsync(absolutePaths) {
    if (!Array.isArray(absolutePaths) || absolutePaths.length === 0) return

    const deletePromises = absolutePaths
        .filter(Boolean)
        .map(absolutePath => deleteTrackByAbsolutePathAsync(absolutePath))

    await Promise.all(deletePromises)
}



module.exports = {
    saveCoverAndReturnFileAsync,
    deleteImageByFileNameAsync,
    savePlaylistImageAndReturnFileAsync,
    deleteImagesByFileNameAsync,
    deleteTracksByAbsolutePathAsync,
    copyImageAsync
}