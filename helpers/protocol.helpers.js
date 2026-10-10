const path = require('node:path')

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase()
    const map = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.flac': 'audio/flac',
        '.aac': 'audio/aac',
        '.m4a': 'audio/m4a',
        '.wma': 'audio/wma',
        '.ogg': 'audio/ogg'
    }
    return map[ext]
}

module.exports = {
    getMimeType
}