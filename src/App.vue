<template>
    <div>
        <div>Directory: {{ dir }} <button @click="openExplorer">Select</button></div>
        <div>Remove original PNG files: <input type="checkbox" checked v-model="remove" @change="setConfig" /></div>
        asd
        <div>Quality: <input type="range" min="50" max="100" v-model="quality" @change="setConfig" /> {{ quality }}</div>
        <div>
            <span>Scan directory:</span> <button @click="scanDir">Select</button>
            <p></p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const dir = ref('')
const remove = ref(true)
const quality = ref(90)

async function openExplorer() {
    const newDir = await window.api?.openExplorer()
    if (newDir) {
        dir.value = newDir
        setConfig()
    }
}

async function getConfig() {
    const config = await window.api?.readStore('config')
    if (config) {
        dir.value = config.watchDir
        remove.value = config.removePng
        quality.value = config.quality
    }
}

getConfig()

async function setConfig() {
    const newConfig = {
        watchDir: dir.value,
        removePng: remove.value,
        quality: quality.value,
    }
    await window.api?.setStore('config', newConfig)
}

async function scanDir() {
    window.api?.scanDir()
}
</script>

<style></style>
