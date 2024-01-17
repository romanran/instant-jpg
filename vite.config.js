import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const config = {
    build: {
        outDir: './distRender',
    },
    publicDir: 'src/public',
    plugins: [vue()],
}
config.emptyOutDir = false
config.rollupOptions = {
    output: {
        entryFileNames: '[name].js', // Preserve original file names without hashing
        chunkFileNames: '[name].js', // Preserve original file names without hashing
        assetFileNames: '[name].[ext]', // Preserve original file names without hashing
    },
}

config.experimental = {
    renderBuiltUrl(filename) {
        return 'serve://' + filename
    },
}

export default defineConfig(config)
