const { ipcMain } = require('electron')
const electron = require('electron')

module.exports = function (win, storage, fileHandler) {
    const handlers = {
        async readStore(event, name) {
            return storage.get(name)
        },
        async setStore(event, name, data) {
            return storage.set(name, data)
        },
        async openExplorer() {
            const response = await electron.dialog.showOpenDialog({
                properties: ['openDirectory'],
            })
            return response.canceled ? false : response.filePaths[0]
        },
        async convertDir() {
            return fileHandler.convertDir()
        },
    }

    Object.keys(handlers).forEach((key) => {
        ipcMain?.handle(key, handlers[key])
    })
    return handlers
}
