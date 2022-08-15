'use strict'

const { app, protocol, BrowserWindow, ipcRenderer } = require('electron')
const { VUEJS3_DEVTOOLS } = require('electron-devtools-installer')
const installExtension = require('electron-devtools-installer').default
const isDevelopment = process.env.NODE_ENV !== 'production'
const path = require('path')
const watch = require('./service/main')

const indexHtmlPatch = path.resolve(path.join(__dirname, '../render/index.html'))

module.exports = () => {
    const { addIpcHandlers } = require('./service/ipc')
    protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

    watch()

    async function createWindow() {
        const win = new BrowserWindow({
            width: 1600,
            height: 1000,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
                frame: false,
                autoHideMenuBar: true,
            },
        })

        addIpcHandlers(win)

        if (process.env.WEBPACK_DEV_SERVER_URL) {
            await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
            win.webContents.openDevTools()
        } else {
            await win.loadURL(indexHtmlPatch)
        }
    }

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    app.on('ready', async () => {
        if (isDevelopment) {
            try {
                await installExtension(VUEJS3_DEVTOOLS)
            } catch (e) {
                console.error('Vue Devtools failed to install:', e.toString())
            }
        }
        createWindow()
    })

    if (isDevelopment) {
        if (process.platform === 'win32') {
            process.on('message', (data) => {
                if (data === 'graceful-exit') {
                    app.quit()
                }
            })
        } else {
            process.on('SIGTERM', () => {
                app.quit()
            })
        }
    }
}
