'use strict'

const { app, protocol, BrowserWindow, Tray, Menu } = require('electron')
const isDevelopment = process.env.NODE_ENV !== 'production'
const path = require('path')
const start = require('./service/main')

const indexHtmlPatch = path.resolve(path.join(__dirname, '../appDist/index.html'))
const trayIcon = path.resolve(path.join(__dirname, '../appDist/favicon.ico'))

const Store = require('electron-store')
const storage = new Store()
const config = storage.get('config')

module.exports = () => {
    protocol.registerSchemesAsPrivileged([{ scheme: 'serve://', privileges: { secure: true, standard: true } }])

    async function createWindow() {
        const win = new BrowserWindow({
            // width: 420,
            // height: 420,
            frame: true,
            autoHideMenuBar: true,
            maximizable: true,
            fullscreenable: false,
            show: isDevelopment || !config,
            webPreferences: {
                devTools: isDevelopment,
                nodeIntegration: false,
                nodeIntegrationInWorker: true,
                contextIsolation: true,
                preload: path.join(__dirname, '../appDist/preload.js'),
                sandbox: false,
            },
        })
        start(win, storage)

        await win.loadURL(indexHtmlPatch)
        isDevelopment && win.webContents.openDevTools({ mode: 'undocked' })

        win.on('minimize', function (event) {
            event.preventDefault()
            win.hide()
        })
        return win
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
        protocol.registerFileProtocol('serve', (request, cb) => {
            const url = request.url.replace('serve://', '')
            const decodedUrl = path.resolve(path.join(__dirname, '../appDist/', decodeURI(url)))
            try {
                return cb(decodedUrl)
            } catch (error) {
                console.error('ERROR: registerLocalResourceProtocol: Could not get file path:', error)
            }
        })
        const mainWindow = await createWindow()

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Open configurator',
                type: 'normal',
                click: function () {
                    mainWindow.show()
                },
            },
            {
                label: 'Quit',
                role: 'quit',
                type: 'normal',
                click: function () {
                    app.isQuiting = true
                    app.quit()
                },
            },
        ])
        const tray = new Tray(trayIcon)

        tray.setContextMenu(contextMenu)
        tray.setToolTip('Screenshot png -> jpg')

        // tray.on('right-click', () => {
        //     tray.popUpContextMenu(contextMenu)
        // })
        tray.on('double-click', () => {
            if (mainWindow.visible) {
                mainWindow.hide()
            } else {
                mainWindow.show()
                mainWindow.focus()
            }
        })
    })
    app.on('open-url', (event, url) => {
        dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
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
