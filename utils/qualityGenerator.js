const convertImage = require('../electron/service/handlers/workers/convertImage')
const fs = require('fs-extra')
const path = './testImages/'
const targetPath = '../src/public/assets/previews/'
const tasks = []
for (let i = 1; i <= 4; i++) {
    for (let q = 60; q <= 100; q = q + 1) {
        tasks.push(convertImage.call(null, `${path}${i}.png`, q, false, false, `-quality${q}`))
    }
}
Promise.all(tasks).then(results => {
    results.forEach(result => {
        const newPath = result.path.replace(path, targetPath)
        fs.move(result.path, newPath, { overwrite: true })
    })
})
