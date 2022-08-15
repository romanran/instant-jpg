const path = require('path')
const { IgnorePlugin } = require('webpack')

const optionalPlugins = []
if (process.platform !== 'darwin') {
    // don't ignore on OSX
    optionalPlugins.push(new IgnorePlugin({ resourceRegExp: /^fsevents$/ }))
}

const config = {
    entry: {
        background: './src/electron/background.js',
        preload: './src/electron/preload.js',
    },
    target: 'node',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'electron'),
    },
    plugins: [...optionalPlugins],
    mode: 'production',
}

module.exports = () => {
    return config
}
