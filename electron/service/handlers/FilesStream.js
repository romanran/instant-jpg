const { Readable } = require('stream')
const workerpool = require('workerpool')

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

module.exports = class FilesStream extends Readable {
    constructor(files, options) {
        super({ objectMode: true })
        this.completedTasks = 0
        this.files = files
        this.tasksNumber = files.length
        this.options = options
        this.pool = workerpool.pool('./electron/service/handlers/workerPool.js', {
            workerTerminateTimeout: 5000,
            // maxWorkers: workerpool.cpus - 2,
        })
    }

    _read() {
        if (this.files.length === 0) {
            this.push(null)
            return
        }

        const file = this.files.shift()
        this.processFile(file)
    }

    async processFile(file) {
        const id = hashCode(file)
        this.pool
            .exec('convertImage', [file, this.options.quality, this.options.removePng, id], {
                on: (payload) => {
                    this.emit('status', payload)
                },
            })
            .then((result) => {
                this.completedTasks++
                this.emit('status', result)
                if (this.completedTasks === this.tasksNumber) {
                    this.pool.terminate()
                    this.emit('end', this.completedTasks)
                }
                this._read()
            })
            .catch((error) => {
                console.log('error', error)
                this.push(`File conversion error: ${error}`)
                this._read()
            })
            .then(function () {
                this.pool.terminate()
            })
    }
}
