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

module.exports = function convertImage(filePath, quality, removePng) {
    return new Promise((resolve, reject) => {
        async function onImageRead(err, image) {
            if (err) {
                console.log('image read error', err)
                reject(err)
                return
            }
            const newFilePath = filePath.replace(new RegExp(`png(?!.*png)`), 'jpg')
            image.quality(parseInt(quality)).write(newFilePath, (err) => {
                if (err) {
                    console.log('image write error:', err)
                    reject(err)
                }
                removePng && removeFile(filePath)
                resolve({ file: newFilePath })
            })
        }
        jimp.read(filePath, onImageRead)
    })
}
