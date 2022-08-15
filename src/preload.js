'use strict'

const { contextBridge, ipcRenderer } = require('electron')

const { handlers } = require('../electron/service/ipc')

/****************************************************************
 * Auto-creates window.api[handleName] handlers
 *
 *
 * *************/
const apiFunctions = Object.keys(handlers).reduce((reducer, key) => {
    reducer[key] = (payload) => ipcRenderer.invoke(key, payload)
    return reducer
}, {})

contextBridge.exposeInMainWorld('api', {
    ...apiFunctions,
    closeWindow() {},
})
