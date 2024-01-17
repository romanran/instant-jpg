<template>
    <div class="settings" :class="converting && 'disabled'">
        <label class="settings__line settings__label">Directory: <strong>{{ dir }} </strong><button
                :class="explorerOpen && 'disabled'" @click="setWatchDir">Select directory</button></label>
        <label class="settings__line settings__label">Trashbin original PNG files: <input type="checkbox" checked
                v-model="remove" @change="setConfig" /></label>
        <div class="settings__line">Quality:
            <input ref="$quality" type="range" :min="qualityRange.min" :max="qualityRange.max" v-model.number="quality"
                @change="setConfig" @input="handleRange" />
            <span>{{ quality }}</span>
            <VQualityPreview :quality="quality" :quality-range="qualityRange" :images="previews"
                :number-of-types="numberOfTypes"></VQualityPreview>
        </div>
        <div class="settings__line">
            <button @click="() => convertDir(dir)">Convert files in default directory</button>
            <button :class="explorerOpen && 'disabled'" @click="convertCustomDir">Convert files in custom directory</button>
        </div>
        <VConvertList :convertStatus="convertStatus" :convertedFiles="convertedFiles" ref="$listComponent"></VConvertList>
    </div>
    <div class="overlay" v-if="converting">
        <button class="overlay__button" @click="stopConvert">Stop</button>
        <div class="overlay__image"></div>
        <span class="overlay__text" v-show="convertStatusAdditional">{{ convertStatusAdditional }}</span>
        <span class="overlay__text">{{ workProgress }}</span>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import VConvertList from './components/VConvertList.vue'
import VQualityPreview from './components/ui/VQualityPreview.vue'
import { useConfig, useActions, usePreviews } from './logic/handler.js'

const { dir, remove, quality, getConfig, setConfig } = useConfig()
const { convertDir, converting, convertedFiles, convertStatus, workProgress, $listComponent } = useActions()
const { previews, numberOfTypes } = usePreviews()
const convertStatusAdditional = ref()
const explorerOpen = ref(false)
const $quality = ref()
const qualityRange = { min: 60, max: 100 }
initWin()

async function initWin() {
    await getConfig()
    handleRangeSlider()
}

async function setWatchDir() {
    explorerOpen.value = true
    const newDir = await window.api?.openExplorer()
    explorerOpen.value = false
    if (newDir) {
        dir.value = newDir
        setConfig()
    }
}

async function convertCustomDir() {
    explorerOpen.value = true
    const targetDir = await window.api?.openExplorer()
    explorerOpen.value = false
    targetDir && convertDir(targetDir)
}
function stopConvert() {
    workProgress.value = 'Finishing jobs before stopping'
    window.api?.stopConvert()
}

function handleRangeSlider() {
    const min = $quality.value.min
    const max = $quality.value.max
    const val = $quality.value.value
    $quality.value.style.backgroundSize = ((val - min) * 100) / (max - min) + '% 100%'
}

onMounted(() => {
    handleRangeSlider()
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



input[type='range'] {
    cursor: grab;
    -webkit-appearance: none;
    margin: 5px 10px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 5px;
    height: 3.5px;
    background-image: linear-gradient(var(--primary-color), var(--primary-color));
    background-size: 100% 100%;
    background-repeat: no-repeat;

    &:active {
        cursor: grabbing;
    }

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        margin-top: -1.5px;
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
    user-select: none;

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

    main &.disabled {
        pointer-events: none;
    }
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
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(black, 0.2);
}

.overlay__image {
    width: 100%;
    height: 100%;
    position: absolute;
    background-image: url('./assets/noise2.gif');
    background-size: 20%;
    opacity: 0.05;
    z-index: -1;
}

.overlay__text {
    text-align: left;
    font-weight: bold;
    width: 100px;
    white-space: nowrap;
}
</style>
