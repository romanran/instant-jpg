const jimp = require('jimp')
const watch = require('node-watch')
const fs = require('fs')
const path = require('path')

const watchDir = path.resolve('./testFolder')
const removePng = true
const quality = 90

watch(watchDir, { recursive: true }, async (event, filePath) => {
    const extension = path.extname(filePath)
    if (event !== 'update' || extension === '.jpg') {
        return
    }
    handleFile(filePath)
});

function handleFile(filePath) {
    jimp.read(filePath, (err, image) => {
        if (err) {
            console.log(err);
            return;
        }
        const newFilePath = filePath.replace('png', 'jpg')
        image.quality(quality).write(newFilePath)
        removePng && removeFile(filePath)
    });
}

function removeFile(filePath) {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err)
            return
        }
    })
}

nw.Window.open('../dist/index.html', {}, function (win) {
    console.log(win);
});