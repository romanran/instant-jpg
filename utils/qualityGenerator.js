const convertImage = require('../electron/service/handlers/Converter')
const path = './testImages/'
for (let i = 1; i <= 4; i++) {
    for (let q = 60; q <= 100; q = q + 1) {
        convertImage.call(null, `${path}${i}.png`, q, false, false, `-quality${q}`)
    }
}
