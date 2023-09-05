# About
Electron app that can watch new PNG files in a specificed directory to JPG's on the fly, also it can batch convert existing directories. Mainly used for NVidia Geforce screenshots.

## Development
For electron app `npm run electron`
For the frontend part of the app `npm run watch` and CTRL+R inside app's window after it is rebuilt

## Build
#### Vue app
`/src/` build with `build:app` using vite. Output dir `/appDist/`
#### Electron renderer
`/src/preload.js` build with `build:electron` using webpack. Output dir `/appDist/preload.js`
#### Electron background
`/index.js` build with `build:electron` using webpack. Output dir `/appDist/preload.js`

#### Windows executable
`build:exe` using electron-builder -> dist