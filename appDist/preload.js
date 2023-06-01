/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 298:
/***/ ((module) => {

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
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {


const { contextBridge, ipcRenderer } = __webpack_require__(298)

/****************************************************************
 * Auto-creates window.api[handleName] handlers
 *
 *
 * *************/
const handlers = ['readStore', 'setStore', 'openExplorer', 'convertDir']

const apiFunctions = handlers.reduce((reducer, key) => {
    reducer[key] = async (...args) => {
        const response = await ipcRenderer.invoke(key, ...args)
        return response
    }
    return reducer
}, {})

contextBridge.exposeInMainWorld('api', {
    ...apiFunctions,
    closeWindow() {},
    receive: (channel, listener) => {
        let validChannels = ['stream-data']
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`.
            ipcRenderer.on(channel, (event, ...args) => {
                console.log('aaa', channel)
                listener(...args)
            })
        }
    },
})

})();

/******/ })()
;