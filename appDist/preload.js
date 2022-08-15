/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 519:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { ipcMain } = __webpack_require__(298)
const electron = __webpack_require__(298)

module.exports = function (win, storage) {
    const handlers = {
        async readStore(event, name) {
            return storage.get(name)
        },
        async setStore(event, name, data) {
            return storage.set(name, data)
        },
        async openExplorer() {
            const response = await electron.dialog.showOpenDialog({
                properties: ['openDirectory'],
            })
            return response.canceled ? false : response.filePaths[0]
        },
    }

    Object.keys(handlers).forEach((key) => {
        ipcMain?.handle(key, handlers[key])
    })
    return handlers
}


/***/ }),

/***/ 298:
/***/ ((module) => {

"use strict";
module.exports = require("electron");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";


const { contextBridge, ipcRenderer } = __webpack_require__(298)

const handlers = __webpack_require__(519)

/****************************************************************
 * Auto-creates window.api[handleName] handlers
 *
 *
 * *************/
const apiFunctions = Object.keys(handlers()).reduce((reducer, key) => {
    reducer[key] = async (...args) => {
        const response = await ipcRenderer.invoke(key, ...args)
        return response
    }
    return reducer
}, {})

contextBridge.exposeInMainWorld('api', {
    ...apiFunctions,
    closeWindow() {},
})

})();

/******/ })()
;