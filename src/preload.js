'use strict'

const { contextBridge, ipcRenderer } = require('electron')

/****************************************************************
 * Auto-creates window.api[handleName] handlers
 *
 * *************/
const handlers = ['readStore', 'setStore', 'openExplorer', 'convertDir', 'stopConvert']

const apiFunctions = handlers.reduce((reducer, key) => {
    reducer[key] = async (...args) => {
        const response = await ipcRenderer.invoke(key, ...args)
        return response
    }
    return reducer
}, {})

contextBridge.exposeInMainWorld('api', {
    ...apiFunctions,
    receive: (channel, listener) => {
        let validChannels = ['convert-stream']
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => {
                listener(...args)
            })
        }
    },
})
