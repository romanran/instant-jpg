'use strict'

const { contextBridge, ipcRenderer } = require('electron')

const handlers = require('../electron/service/handlers/ipc')

/****************************************************************
 * Auto-creates window.api[handleName] handlers
 *
 *
 * *************/
const apiFunctions = Object.keys(handlers()).reduce((reducer, key) => {
    reducer[key] = async (...args) => {
        const response = await ipcRenderer.invoke(key, ...args)
        return response
    }
    return reducer
}, {})

contextBridge.exposeInMainWorld('api', {
    ...apiFunctions,
    closeWindow() {},
})
