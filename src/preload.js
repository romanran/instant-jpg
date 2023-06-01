'use strict'

const { contextBridge, ipcRenderer } = require('electron')

/****************************************************************
 * Auto-creates window.api[handleName] handlers
 *
 *
 * *************/
const handlers = ['readStore', 'setStore', 'openExplorer', 'convertDir']

const apiFunctions = handlers.reduce((reducer, key) => {
    reducer[key] = async (...args) => {
        const response = await ipcRenderer.invoke(key, ...args)
        return response
    }
    return reducer
}, {})

contextBridge.exposeInMainWorld('api', {
    ...apiFunctions,
    closeWindow() {},
    receive: (channel, listener) => {
        let validChannels = ['stream-data']
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`.
            ipcRenderer.on(channel, (event, ...args) => {
                console.log('aaa', channel)
                listener(...args)
            })
        }
    },
})
