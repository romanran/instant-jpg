const path = require('path')

const addIpcHandlers = require('./handlers/ipc')
const FilesHandler = require('./handlers/FilesHandler')

const defaultConfig = {
    watchDir: path.resolve(__dirname),
    removePng: true,
    quality: 90,
}

function start(win, storage) {
    let config = storage.get('config')
    if (!config) {
        storage.set('config', defaultConfig)
    }

    const filesHandler = new FilesHandler(win, storage)
    addIpcHandlers(win, storage, filesHandler)
    filesHandler.watchDir()

    win.on('close', async function (e) {
        e.preventDefault()
        await filesHandler.stopConvert()
        win.destroy()
    })
}

module.exports = start
