<template>
    <div class="settings" :class="converting && 'disabled'">
        <label class="settings__line settings__label"
            >Directory: <strong>{{ dir }} </strong><button class="" @click="setWatchDir">Select directory</button></label
        >
        <label class="settings__line settings__label"
            >Remove original PNG files: <input type="checkbox" checked v-model="remove" @change="setConfig"
        /></label>
        <span class="settings__line"
            >Quality:
            <input
                ref="$quality"
                type="range"
                min="50"
                max="100"
                v-model="quality"
                @change="setConfig"
                @input="handleRange"
            />
            {{ quality }}</span
        >
        <div class="settings__line">
            <button @click="() => convertDir()">Convert files in default directory</button>
            <button class="" @click="convertCustomDir">Convert files in custom directory</button>
        </div>
        <p class="convert-list__status" v-html="convertStatus" v-show="convertStatus"></p>
        <div class="convert-list" ref="$convertList" v-show="convertStatus">
            <p
                class="convert-list__filename"
                :class="file.status"
                :style="`order: ${file.order};`"
                v-for="file in convertedFiles"
            >
                {{ `${file.path} - ${file.status}` }}
            </p>
        </div>
    </div>
    <div class="overlay" v-if="converting">
        <button @click="stopConvert">Stop</button>
        <span v-show="convertStatusAdditional">{{ convertStatusAdditional }}</span>
        <span>{{ workProgress }}</span>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const dir = ref('')
const remove = ref(true)
const quality = ref(90)
const convertedFiles = ref({})
const converting = ref(false)
const convertStatus = ref()
const convertStatusAdditional = ref()
const workProgress = ref('')
const $convertList = ref()
const $quality = ref()

async function setWatchDir() {
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

function convertDir(targetDir = dir.value) {
    // targetDir || (targetDir = dir.value)
    let fileIndex = 0
    convertedFiles.value = {}
    converting.value = true
    convertStatus.value = null
    workProgress.value = workProgressDefault

    window.api?.convertDir(targetDir)
    window.api?.receive('convert-stream', (e) => {
        if (!converting.value) {
            return
        }
        if (e.filesNumber) {
            convertStatus.value = `Found <strong>${e.filesNumber} files</strong>, converting...`
            return
        }
        if (e.id) {
            if (!convertedFiles.value[e.id]) {
                e.order = fileIndex++
                $convertList.value.scrollTo({ left: 0, top: $convertList.value.scrollHeight + 20 })
            }
            e.path = e.path.replace(targetDir, '')
            convertedFiles.value[e.id] = { ...convertedFiles.value[e.id], ...e }
        }
        if (e.end) {
            converting.value = false
            convertStatus.value = `Done! <strong>${Object.keys(convertedFiles.value).length} files</strong> converted`
        }
    })
}
async function convertCustomDir() {
    const targetDir = await window.api?.openExplorer()
    targetDir && convertDir(targetDir)
}
function stopConvert() {
    workProgress.value = 'Finishing jobs before stopping'
    window.api?.stopConvert()
}

function handleRange() {
    const min = $quality.value.min
    const max = $quality.value.max
    const val = $quality.value.value
    $quality.value.style.backgroundSize = ((val - min) * 100) / (max - min) + '% 100%'
}

const workProgressDefault = 'Converting'
onMounted(() => {
    handleRange()
    setInterval(() => {
        if (workProgress.value === workProgressDefault + '...') {
            workProgress.value = workProgressDefault
        } else {
            workProgress.value += '.'
        }
    }, 500)
})
</script>

<style lang="scss">
.settings {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px 20px;
    overflow: auto;
    line-height: 2;
    height: 100%;
    &.disabled {
        * {
            pointer-events: none;
            cursor: default;
        }
    }
}

.settings__line {
    display: block;
    margin: 5px 0;
}
.settings__label {
    cursor: pointer;
    &:hover {
        color: rgb(182, 255, 171);
    }
}
.convert-list {
    display: grid;
    width: 100%;
    flex: 0 1 auto;
    overflow: auto;
    min-height: 80px;
    border: 1px solid var(--primary-color-l);
}

.convert-list__status {
    font-size: 18px;
}
.convert-list__filename {
    width: 100%;
    color: var(--primary-color);
    margin: 0px;
    padding: 4px;
    font-size: 12px;
    line-height: 0.8;
    &.reading {
        color: orange;
    }
    &.converting {
        color: yellowgreen;
    }
}
input[type='range'] {
    cursor: grab;
    -webkit-appearance: none;
    margin: 5px 10px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 5px;
    height: 4px;
    background-image: linear-gradient(var(--primary-color), var(--primary-color));
    background-size: 70% 100%;
    background-repeat: no-repeat;
    &:active {
        cursor: grabbing;
    }
    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        margin-top: -2px;
        width: 10px;
        height: 10px;
        background: var(--primary-color);
        box-shadow: 2px 0 4px rgba(black, 0.5);
        border-radius: 5px;
    }
    &::-webkit-slider-runnable-track {
        border: none;
        background: transparent;
    }
}
input[type='checkbox'] {
    cursor: pointer;
}
button {
    font-family: inherit;
    font-weight: bold;
    background: var(--primary-color);
    color: white;
    border: none;
    box-shadow: 0 0 8px rgba(black, 0.3);
    padding: 15px 30px;
    margin: 10px;
    letter-spacing: 0.5px;
    font-size: 16px;
    &:first-child {
        margin-left: 0;
    }
    &:hover {
        background: var(--primary-color-l);
        box-shadow: -2px 0 8px rgba(black, 0.3);
    }
    &:active {
        background: var(--primary-color-d);
        box-shadow: 0px 0 5px rgba(black, 0.4);
    }
}
* {
    scrollbar-width: thin;
    scrollbar-color: var(--primary-color) transparent;
}
*::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
*::-webkit-scrollbar-track {
    background: rgba(black, 0.2);
}

*::-webkit-scrollbar-thumb {
    background-color: var(--primary-color);
    border-radius: 20px;
    border: none;
}
.overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(black, 0.1);
}
</style>
