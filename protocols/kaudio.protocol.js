const { getMimeType } = require('../helpers/protocol.helpers')
const { protocol } = require('electron/main')
const fs = require('node:fs')

const registerKaudioPrivileges = () => {
    protocol.registerSchemesAsPrivileged([
        {
            scheme: 'kaudio',
            privileges: {
                standard: true,
                stream: true,
                supportFetchAPI: true,
                corsEnabled: true
            }
        }
    ])
}

const registerKaudioProtocol = () => {
    protocol.handle('kaudio', (request) => {
        const url = new URL(request.url);
        const encodedPath = url.searchParams.get('path');

        if (!encodedPath) {
            console.error('[Main process: kaudio] No path parameter in URL:', request.url);
            return new Response('Missing path parameter', { status: 400 });
        }

        const absolutePath = decodeURIComponent(encodedPath);

        if (!fs.existsSync(absolutePath)) {
            console.error('[Main process: kaudio] File not found:', absolutePath);

            return new Response('File not found', {
                status: 404
            });
        }

        const rangeHeader = request.headers.get('range')
        const stat = fs.statSync(absolutePath);
        const fileSize = stat.size;
        const mimeType = getMimeType(absolutePath)

        if (!rangeHeader) {
            const nodeStream = fs.createReadStream(absolutePath);

            return new Response(nodeStream, {
                status: 200,
                headers: {
                    'Content-Length': fileSize.toString(),
                    'Accept-Ranges': 'bytes',
                    'Content-Type': mimeType,
                }
            });
        }

        const parts = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (isNaN(start) || start >= fileSize || end >= fileSize || start > end) {
            return new Response('Range Not Satisfiable', {
                status: 416,
                headers: { 'Content-Range': `bytes */${fileSize}` }
            });
        }

        const chunkSize = (end - start) + 1
        const nodeStream = fs.createReadStream(absolutePath, { start, end })

        return new Response(nodeStream, {
            status: 206,
            statusText: 'Partial Content',
            headers: {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize.toString(),
                'Content-Type': mimeType,
            }
        })
    })
}

module.exports = {
    registerKaudioPrivileges,
    registerKaudioProtocol
}