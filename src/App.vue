<template>
    <div class="settings" :class="converting && 'disabled'">
        <!-- Directory select -->
        <label class="settings__line settings__label">
            <FolderEditOutlineIcon class="settings__icon" />
            <span>Directory: <strong>{{ dir }} </strong></span>
            <button :class="explorerOpen && 'disabled'" @click="setWatchDir">Select directory</button>
        </label>

        <!-- Trashbin -->
        <label class="settings__line settings__label">
            <TrashCanOutlineIcon class="settings__icon" />
            <span>Trashbin original PNG files&nbsp;&nbsp;</span>
            <input class="settings__checkbox" type="checkbox" checked v-model="remove" @change="setConfig" />
            <CheckboxMarkedIcon class="settings__icon" :size="18" v-show="remove" />
            <CheckboxBlankOutlineIcon class="settings__icon" :size="18" v-show="!remove" />
        </label>

        <!-- Quality -->
        <div class="settings__line settings__quality">
            <TuneIcon class="settings__icon" />
            <span>Quality</span>

            <!-- Slider -->
            <input ref="$quality" type="range" :min="qualityRange.min" :max="qualityRange.max" v-model.number="quality"
                @change="setConfig" @input="handleRangeSlider" />

            <!-- Input -->
            <input class="settings__quality-input" type="number" :min="qualityRange.min" :max="qualityRange.max"
                :value="quality" @change="onQualityChange" v-on:keyup.enter="onQualityChange">

            <VQualityPreview :quality="quality" :quality-range="qualityRange" :images="previews"
                :number-of-types="numberOfTypes">
            </VQualityPreview>
        </div>

        <!-- Convert buttons -->
        <div class="settings__line">
            <button @click="() => convertDir(dir)">Convert files in default directory</button>
            <button :class="explorerOpen && 'disabled'" @click="convertCustomDir">Convert files in custom directory</button>
        </div>
        <h4 class="settings__title">Conversion status</h4>
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
import { nextTick, onMounted, ref, watch } from 'vue'
import VConvertList from './components/VConvertList.vue'
import VQualityPreview from './components/QualityPreview/VQualityPreview.vue'
import { useConfig, useActions, usePreviews } from './logic/handler.js'
import TuneIcon from 'vue-material-design-icons/Tune.vue';
import TrashCanOutlineIcon from 'vue-material-design-icons/TrashCanOutline.vue';
import FolderEditOutlineIcon from 'vue-material-design-icons/FolderEditOutline.vue';
import CheckboxBlankOutlineIcon from 'vue-material-design-icons/CheckboxBlankOutline.vue';
import CheckboxMarkedIcon from 'vue-material-design-icons/CheckboxMarked.vue';

const { dir, remove, quality, qualityRange, getConfig, setConfig } = useConfig()
const { convertDir, converting, convertedFiles, convertStatus, workProgress, $listComponent } = useActions()
const { previews, numberOfTypes } = usePreviews()
const convertStatusAdditional = ref()
const explorerOpen = ref(false)
const $quality = ref()
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

async function handleRangeSlider() {
    await nextTick()
    const min = $quality.value.min
    const max = $quality.value.max
    const val = $quality.value.value
    $quality.value.style.backgroundSize = ((val - min) * 100) / (max - min) + '% 100%'
}
function onQualityChange($event) {
    $event.target.blur()
    quality.value = $event.target.value
}

watch(quality, (newValue) => {
    handleRangeSlider()
    setConfig()
})

onMounted(() => {
    handleRangeSlider()
})
</script>

<style lang="scss">
.settings {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    height: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 10px 20px;
    line-height: 2;
    overflow: auto;

    &.disabled {
        * {
            pointer-events: none;
            cursor: default;
        }
    }
}

.settings__quality {
    user-select: none;
}

.settings__quality-input {
    vertical-align: middle;
    background: none;
    color: white;
    border: none;
    outline: none;
    font-family: inherit;
    font-size: 16px;
}

.settings__icon {
    vertical-align: middle;
    margin-right: 10px;
    font-size: 0;
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

.settings__title {
    margin-bottom: 10px;
}

input[type="checkbox"] {
    display: none;
}

input[type='range'] {
    cursor: grab;
    vertical-align: middle;
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
    transition: all 150ms ease-out;

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
