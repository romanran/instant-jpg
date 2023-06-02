const chokidar = require('chokidar')
const readdirp = require('readdirp')
const Converter = require('./Converter')
const path = require('path')

module.exports = class FileHandler {
    constructor(win, storage) {
        this.storage = storage
        this.win = win
        this.watcher
        this.converter
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
                const converter = new Converter([filePath], this.config, this.win)
                converter.start()
            }
        })
    }
    stopWatch() {
        this.watcher?.close()
    }
    convertDir(targetDir) {
        const config = this.storage.get('config')
        const files = []
        readdirp(targetDir, { fileFilter: '*.png' })
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
                this.converter = new Converter(files, config, this.win)
                this.converter.start()
            })
    }
    async stopConvert() {
        return await this.converter?.stop()
    }
}
