const path = require('path')

const addIpcHandlers = require('./handlers/ipc')
const FileHandler = require('./handlers/FileHandler')

const defaultConfig = {
    watchDir: path.resolve(__dirname),
    removePng: true,
    quality: 90,
}

function start(win, storage) {
    const fileHandler = new FileHandler(win, storage)
    addIpcHandlers(win, storage, fileHandler)
    fileHandler.watchDir()
    let config = storage.get('config')

    if (!config) {
        storage.set('config', defaultConfig)
    }
}

module.exports = start
