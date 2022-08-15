import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// import electron from 'vite-plugin-electron'
// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: './appDist',
    },
    experimental: {
        renderBuiltUrl(filename) {
            return 'serve://' + filename
        },
    },
    plugins: [vue()],
})
