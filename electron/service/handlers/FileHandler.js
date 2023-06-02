const chokidar = require('chokidar')
const convertImage = require('./convertImage')
const readdirp = require('readdirp')
const FilesStream = require('./FilesStream')
const path = require('path')

module.exports = class FileHandler {
    constructor(win, storage) {
        this.storage = storage
        this.win = win
        this.watcher
        this.config = this.storage.get('config')
    }

    watchDir() {
        this.config = this.storage.get('config')
        this.stopWatch()
        this.watcher = chokidar.watch(this.config.watchDir, {
            ignored: '!*.png',
            ignoreInitial: true,
            awaitWriteFinish: {
                stabilityThreshold: 500,
                pollInterval: 500,
            },
        })
        this.watcher.on('add', async (filePath) => {
            const extension = path.extname(filePath)
            if (extension === '.png') {
                convertImage(filePath, this.config.quality, this.config.removePng)
            }
        })
    }
    stopWatch() {
        this.watcher?.close()
    }
    convertDir() {
        const config = this.storage.get('config')
        const files = []
        readdirp(config.watchDir, { fileFilter: '*.png' })
            .on('data', (entry) => {
                files.push(entry.fullPath)
            })
            .on('warn', (error) => {
                console.error('non-fatal error', error)
            })
            .on('error', (error) => {
                console.error('fatal error', error)
            })
            .on('end', () => {
                const stream = new FilesStream(files, { ...config })
                stream._read()
                stream.on('end', (result) => {
                    this.win.webContents.send('convert-stream', { path: null, end: true, result })
                })
                stream.on('status', (status) => {
                    this.win.webContents.send('convert-stream', { ...status, end: false })
                })
            })
    }
}
