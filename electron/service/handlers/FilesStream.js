const { Readable } = require('stream')
const workerpool = require('workerpool')

module.exports = class FilesStream extends Readable {
    constructor(files, options) {
        super({ objectMode: true })
        this.files = files
        this.tasksNumber = files.length
        this.options = options
        this.pool = workerpool.pool('./electron/service/handlers/workerPool.js', { workerTerminateTimeout: 5000 })
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
        let completedTasks = 0
        this.pool
            .exec('convertImage', [file, this.options.quality, this.options.removePng])
            .then((result) => {
                completedTasks++
                this.push(result)
                if (completedTasks === this.tasksNumber) {
                    this.pool.terminate()
                    this.emit('end', result)
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
