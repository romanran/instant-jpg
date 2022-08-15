const jimp = require('jimp')
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')

const Store = require('electron-store')
const storage = new Store()

let config = storage.get('config')

function watch() {
    if (!config) {
        config = {
            watchDir: path.resolve('./testFolder'),
            removePng: true,
            quality: 90,
        }
        storage.set('config', config)
    }
    console.log(config.watchDir)
    chokidar.watch(config.watchDir).on('add', async (filePath) => {
        const extension = path.extname(filePath)
        if (extension === '.jpg') {
            return
        }
        handleFile(filePath)
    })
    function handleFile(filePath) {
        jimp.read(filePath, (err, image) => {
            if (err) {
                console.log(err)
                return
            }
            const newFilePath = filePath.replace('png', 'jpg')
            image.quality(config.quality).write(newFilePath)
            config.removePng && removeFile(filePath)
        })
    }
    function removeFile(filePath) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(err)
                return
            }
        })
    }
}

module.exports = watch
