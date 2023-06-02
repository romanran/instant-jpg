const workerpool = require('workerpool')
const _ = require('lodash')

function hashCode(string) {
    let hash = 0,
        i,
        chr
    if (string.length === 0) return hash
    for (i = 0; i < string.length; i++) {
        chr = string.charCodeAt(i)
        hash = (hash << 5) - hash + chr
        hash |= 0 // Convert to 32bit integer
    }
    return hash
}

module.exports = class Converter {
    constructor(files, options, win) {
        this.files = files
        this.options = options
        this.win = win
        this.win.webContents.send('convert-stream', { filesNumber: files.length, end: false })
        this.pool = workerpool.pool('./electron/service/handlers/workerPool.js', {
            workerTerminateTimeout: 5000,
            maxWorkers: workerpool.cpus - 2,
        })
    }
    async start() {
        const tasks = []
        _.forEach(this.files, (file) => {
            tasks.push(this.processFile(file))
        })
        try {
            await Promise.all(tasks)
        } catch (err) {
            // was terminated
        }
        // this.win.webContents.send('convert-stream', { end: true })
    }
    async stop() {
        await this.pool.terminate()
        try {
            this.win.webContents.send('convert-stream', { end: true })
        } catch (err) {
            return err
            // app quit
        }
        return true
    }
    processFile(file) {
        return new Promise((resolve, reject) => {
            const id = hashCode(file)
            this.pool
                .exec('convertImage', [file, this.options.quality, this.options.removePng, id], {
                    on: (payload) => {
                        try {
                            this.win.webContents.send('convert-stream', { ...payload, end: false })
                        } catch (err) {
                            //  app quit
                        }
                    },
                })
                .then((result) => {
                    this.win.webContents.send('convert-stream', { ...result, end: false })
                    resolve(result)
                })
                .catch((error) => {
                    reject(`File conversion error: ${error.message}`)
                })
        })
    }
}
