const jimp = require('jimp')
const fs = require('fs-extra')
function removeFile(filePath) {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err)
            return
        }
    })
}

module.exports = function convertImage(filePath, quality, removePng, id) {
    return new Promise((resolve, reject) => {
        const onImageRead = async (err, image) => {
            if (err) {
                console.log('image read error', err)
                return reject(err)
            }
            const newFilePath = filePath.replace(new RegExp(`png(?!.*png)`), 'jpg')
            this.workerEmit({ path: filePath, id, end: false, status: 'converting' })
            image.quality(parseInt(quality)).write(newFilePath, (err) => {
                if (err) {
                    console.log('image write error:', err)
                    return reject(err)
                }

                if (removePng) {
                    console.log('removing original', filePath)
                    this.workerEmit({ path: filePath, id, end: false, status: 'removeOriginal' })
                    removeFile(filePath)
                }
                resolve({ path: newFilePath, id, status: 'done' })
            })
        }
        this.workerEmit({ path: filePath, id, end: false, status: 'reading' })
        jimp.read(filePath, onImageRead)
    })
}
