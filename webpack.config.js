const path = require('path')
const { IgnorePlugin } = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')

// const optionalPlugins = []
// if (process.platform !== 'darwin') {
//     // don't ignore on OSX
//     optionalPlugins.push(new IgnorePlugin({ resourceRegExp: /^fsevents$/ }))
// }

const config = {
    target: 'electron-renderer',
    entry: {
        preload: './src/preload.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './appDist'),
        clean: false,
    },
    // externals: { electron: 'require("electron")' },
    // plugins: [...optionalPlugins],
    mode: 'production',
    optimization: {
        minimize: false,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
            }),
        ],
    },
}

module.exports = () => {
    return config
}
