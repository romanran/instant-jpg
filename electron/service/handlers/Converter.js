const workerpool = require('workerpool')
const _ = require('lodash')
const path = require('path')

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
        this.stopping = false
        this.win?.webContents.send('convert-stream', { filesNumber: files.length, end: false })
        this.pool = workerpool.pool(path.join(__dirname, '/workers/workerPool.js'), {
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
            console.error(err)
            // was terminated
        }
        !this.stopping && this.win?.webContents.send('convert-stream', { end: true })
    }
    async stop() {
        this.stopping = true
        await this.pool.terminate()
        try {
            this.win?.webContents.send('convert-stream', { end: true })
        } catch (err) {
            return err
            // app quit
        }
        return true
    }
    processFile(file, quality = this.options.quality) {
        return new Promise((resolve, reject) => {
            const id = hashCode(file)
            this.pool
                .exec('convertImage', [file, quality, this.options.removePng, id], {
                    on: (payload) => {
                        try {
                            this.win?.webContents.send('convert-stream', { ...payload, end: false })
                        } catch (err) {
                            //  app quit
                        }
                    },
                })
                .then((result) => {
                    this.win?.webContents.send('convert-stream', { ...result, end: false })
                    resolve(result)
                })
                .catch((error) => {
                    reject(`File conversion error: ${error.message}`)
                })
        })
    }
}
