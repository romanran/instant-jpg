const Store = require('electron-store')
const { ipcMain } = require('electron')
const storage = new Store()

let dirWatcher
const handlers = {
    async readStore(event, payload) {
        return storage.get(payload.name)
    },
}

module.exports = {
    handlers,
    addIpcHandlers(win) {
        Object.keys(handlers).forEach((key) => {
            ipcMain.handle(key, handlers[key])
        })
    },
}
