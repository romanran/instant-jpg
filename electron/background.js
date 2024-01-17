'use strict'

const { app, protocol, BrowserWindow, Tray, Menu } = require('electron')
const path = require('path')
const start = require('./service/main')

const indexHtmlPatch = path.resolve(path.join(__dirname, '../distRender/index.html'))
const trayIcon = path.resolve(path.join(__dirname, '../', 'build', 'favicon.ico'))

const Store = require('electron-store')
const storage = new Store()

module.exports = () => {
    protocol.registerSchemesAsPrivileged([{ scheme: 'serve://', privileges: { secure: true, standard: true } }])
    async function createWindow() {
        const win = new BrowserWindow({
            frame: true,
            autoHideMenuBar: true,
            maximizable: true,
            fullscreenable: false,
            show: true,
            webPreferences: {
                devTools: !app.isPackaged,
                nodeIntegration: false,
                nodeIntegrationInWorker: false,
                contextIsolation: true,
                preload: path.join(__dirname, '../distRender/preload.js'),
                sandbox: false,
            },
        })
        start(win, storage)

        await win.loadURL(indexHtmlPatch)
        !app.isPackaged && win.webContents.openDevTools({ mode: 'undocked' })
        win.on('minimize', function (event) {
            event.preventDefault()
            win.hide()
        })
        return win
    }

    const gotTheLock = app.requestSingleInstanceLock()

    if (!gotTheLock) {
        app.quit()
    } else {
        app.on('ready', async () => {
            protocol.registerFileProtocol('serve', (request, cb) => {
                const url = request.url.replace('serve://', '')
                const decodedUrl = path.resolve(path.join(__dirname, '../distRender/', decodeURI(url)))
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

            app.on('second-instance', (event, commandLine, workingDirectory) => {
                if (mainWindow) {
                    if (mainWindow.isMinimized()) mainWindow.restore()
                    mainWindow.focus()
                }
            })

            const tray = new Tray(trayIcon)
            tray.setContextMenu(contextMenu)
            tray.setToolTip('Screenshot png -> jpg')
            tray.on('right-click', () => {
                tray.popUpContextMenu(contextMenu)
            })
            tray.on('double-click', () => {
                if (mainWindow.visible) {
                    mainWindow.hide()
                } else {
                    mainWindow.show()
                    mainWindow.focus()
                }
            })
            app.on('before-quit', function (evt) {
                tray.destroy();
            });

        })
    }

    app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true,
        args: ["--hidden"]
    })

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
}
