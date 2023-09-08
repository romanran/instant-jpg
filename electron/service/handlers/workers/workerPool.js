const workerpool = require('workerpool')
const convertImage = require('./convertImage')

workerpool.worker({
    convertImage: convertImage.bind(workerpool),
})
