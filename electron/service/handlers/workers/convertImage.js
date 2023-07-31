const jimp = require('jimp')
const fs = require('fs-extra')
const { exec } = require('child_process')


function removeFile(filePath) {
    const command = `powershell.exe -Command "Add-Type -AssemblyName Microsoft.VisualBasic;` +
        `[Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile('${filePath}', 'AllDialogs', 'SendToRecycleBin', 'ThrowException')"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
    });

}

module.exports = function convertImage(filePath, quality, removePng, id, suffix) {
    return new Promise((resolve, reject) => {

        async function onImageRead(err, image) {
            if (err) {
                console.log('image read error', err)
                return reject(err)
            }
            const newFilePath = filePath.replace(new RegExp(`\.png(?!.*\.png)`), `${suffix}.jpg`)
            id && this?.workerEmit({ path: filePath, id, end: false, status: 'converting' })
            image.quality(parseInt(quality)).write(newFilePath, (err) => {
                if (err) {
                    console.log('image write error:', err)
                    return reject(err)
                }

                if (removePng) {
                    removeFile(filePath)
                    id && this.workerEmit({ path: filePath, id, end: false, status: 'removeOriginal' })
                }
                resolve({ path: newFilePath, id, status: 'done' })
            })
        }

        id && this.workerEmit({ path: filePath, id, end: false, status: 'reading' })
        jimp.read(filePath, onImageRead.bind(this))
    })
}
