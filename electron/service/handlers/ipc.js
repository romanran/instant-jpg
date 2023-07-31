const { ipcMain } = require('electron')
const electron = require('electron')

module.exports = function (win, storage, filesHandler) {
    const handlers = {
        readStore(event, name) {
            return storage.get(name)
        },
        setStore(event, name, data) {
            storage.set(name, data)
            filesHandler.watchDir()
        },
        async openExplorer() {
            const response = await electron.dialog.showOpenDialog({
                properties: ['openDirectory'],
            })
            return response.canceled ? false : response.filePaths[0]
        },
        convertDir(event, targetDir) {
            return filesHandler.convertDir.call(filesHandler, targetDir)
        },
        stopConvert() {
            return filesHandler.stopConvert.call(filesHandler)
        },
    }

    Object.keys(handlers).forEach((key) => {
        ipcMain?.handle(key, handlers[key])
    })
    return handlers
}
