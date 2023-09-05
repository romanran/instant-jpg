const chokidar = require('chokidar')
const Converter = require('./Converter')
const path = require('path')
const fs = require('fs-extra')


module.exports = class FilesHandler {
    constructor(win, storage) {
        this.storage = storage
        this.win = win
        this.watcher
        this.converter
        this.config = this.storage.get('config')
    }
    startConverter(files) {
        const config = this.storage.get('config')

        files = files.map(file => {
            if (path.extname(file) == ".png") {
                return `${targetDir}/${file}`
            }
        }).filter(file => file)

        this.converter = new Converter(files, config, this.win)
        this.converter.start()
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
        return 'watching'
    }
    stopWatch() {
        this.watcher?.close()
    }
    convertDir(targetDir) {
        fs.readdir(targetDir, (error, files) => {
            if (error) {
                console.error(error)
            }
            this.startConverter(files)
        })
    }
    async stopConvert() {
        return await this.converter?.stop()
    }
}
