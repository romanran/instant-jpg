import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const config = {
    build: {
        outDir: './appDist',
    },
    plugins: [vue()],
}
if (process.env.WEB !== 'true') {
    config.experimental = {
        renderBuiltUrl(filename) {
            return 'serve://' + filename
        },
    }
}

export default defineConfig(config)
