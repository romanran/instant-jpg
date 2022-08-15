import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: './render',
    },
    plugins: [
        vue(),
        electron({
            main: {
                preload: { input: './electron/preload.js' },
                entry: './main.js',
            },
        }),
    ],
})
