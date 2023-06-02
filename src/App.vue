<template>
    <div class="settings" :class="converting && 'disabled'">
        <label class="settings__line settings__label"
            >Directory: <strong>{{ dir }} </strong><button class="" @click="openExplorer">Select directory</button></label
        >
        <label class="settings__line settings__label"
            >Remove original PNG files: <input type="checkbox" checked v-model="remove" @change="setConfig"
        /></label>
        <span class="settings__line"
            >Quality: <input type="range" min="50" max="100" v-model="quality" @change="setConfig" /> {{ quality }}</span
        >
        <label class="settings__line settings__label"
            ><span>Convert files in directory:</span> <button @click="scanDir">Convert</button></label
        >
        <div class="settings__convert-list">
            <p class="filename" v-for="file in convertedFiles">{{ `${file.path} - ${file.status}` }}</p>
        </div>
        <p v-show="convertFinish">Done! ({{ filesConverted }} files converted)</p>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const dir = ref('')
const remove = ref(true)
const quality = ref(90)
const convertedFiles = ref({})
const convertFinish = ref(false)
const converting = ref(false)
const filesConverted = ref(0)

async function openExplorer() {
    const newDir = await window.api?.openExplorer()
    if (newDir) {
        console.log(dir.value, newDir)
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
    convertedFiles.value = {}
    convertFinish.value = false
    converting.value = true
    filesConverted.value = 0
    window.api?.convertDir()
    window.api?.receive('convert-stream', (e) => {
        if (!converting.value) {
            return
        }
        if (e.id) {
            console.log(e)
            e.path = e.path.replace(dir.value, '')
            convertedFiles.value[e.id] = e
        }
        convertFinish.value = e.end
        filesConverted.value = e.files
        if (e.end) converting.value = false
    })
}
</script>

<style lang="scss">
.settings {
    display: flex;
    flex-direction: column;
    padding: 30px;
    overflow: auto;
    line-height: 2;
    white-space: pre;
    max-height: 100%;
    &.disabled {
        .settings__label {
            cursor: default;
            pointer-events: none;
        }
    }
}
.filename {
    width: 100%;
    color: var(--green);
    margin: 0;
    font-size: 12px;
}
input[type='range'] {
    cursor: grab;
    &:active {
        cursor: grabbing;
    }
}
input[type='checkbox'] {
    cursor: pointer;
}
.settings__line {
    display: block;
}
.settings__label {
    cursor: pointer;
    &:hover {
        color: rgb(182, 255, 171);
    }
}
.settings__convert-list {
    flex: 0 1 auto;
    overflow: auto;
    min-height: 80px;
}
</style>
