# About
Electron app that can watch new PNG files in a specificed directory to JPG's on the fly, also it can batch convert existing directories. Mainly used for NVidia Geforce screenshots.

## Development
For electron app `npm start`

## Build
#### Vue app
`/src/` build with `build:app` using vite. Output dir `/distRender/`
#### Electron renderer
`/src/preload.js` build with `build:electron` using webpack. Output dir `/distRender/preload.js`
#### Electron background
`/index.js` build with `build:electron` using webpack. Output dir `/distRender/preload.js`

#### Windows executable
`build:exe` using electron-builder -> dist

#### Icons
For previewing icons:
https://pictogrammers.com/library/mdi/

Library: https://github.com/robcresswell/vue-material-design-icons
Usege:
import CheckboxMarkedIcon from 'vue-material-design-icons/CheckboxMarked.vue'

<CheckboxMarkedIcon />