const { ipcMain } = require('electron')
const electron = require('electron')

module.exports = function (win, storage, fileHandler) {
    const handlers = {
        readStore(event, name) {
            return storage.get(name)
        },
        setStore(event, name, data) {
            storage.set(name, data)
            fileHandler.watchDir()
        },
        async openExplorer() {
            const response = await electron.dialog.showOpenDialog({
                properties: ['openDirectory'],
            })
            return response.canceled ? false : response.filePaths[0]
        },
        convertDir(event, targetDir) {
            return fileHandler.convertDir.call(fileHandler, targetDir)
        },
        stopConvert() {
            return fileHandler.stopConvert.call(fileHandler)
        },
    }

    Object.keys(handlers).forEach((key) => {
        ipcMain?.handle(key, handlers[key])
    })
    return handlers
}
