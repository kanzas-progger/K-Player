const { protocol, net } = require('electron/main')
const fs = require('node:fs')
const { getCoversDir, getPlaylistImagesDir } = require('../constants/constants')
const path = require('node:path')

const registerKimageProtocol = () => {
    fs.mkdirSync(getCoversDir(), { recursive: true })
    fs.mkdirSync(getPlaylistImagesDir(), { recursive: true })

    protocol.handle('k-image', (request) => {
        const filePath = request.url.replace('k-image://', '')
        const decodedPath = decodeURIComponent(filePath)

        const parts = decodedPath.split('/')

        let baseDir = getCoversDir()
        let fileName = decodedPath

        if (parts.length > 1) {
            const [type, ...rest] = parts
            fileName = rest.join('/')

            if (type === 'playlist') {
                baseDir = getPlaylistImagesDir()
            } else if (type === 'track') {
                baseDir = getCoversDir()
            }
        }

        const absolutePath = path.join(baseDir, fileName)

        return net.fetch(`file://${absolutePath}`)
    })
}

module.exports = {
    registerKimageProtocol
}