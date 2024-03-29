import _ from 'lodash'
import { computed, ref } from 'vue'

export function usePreviews() {
    const previews = []
    const numberOfTypes = 4
    for (let previewIndex = 1; previewIndex <= numberOfTypes; previewIndex++) {
        for (let qualityIndex = 60; qualityIndex <= 100; qualityIndex++) {
            previews.push(`assets/previews/${previewIndex}-quality${qualityIndex}.jpg`)
        }
    }
    return {
        previews,
        numberOfTypes
    }
}

export function useConfig() {
    const dir = ref('')
    const remove = ref(true)
    const qualityRange = { min: 60, max: 100 }
    const qualityVal = ref(0)
    const quality = computed({
        get: () => {
            return qualityVal.value
        },
        set: (newQuality) => {
            newQuality = parseInt(newQuality)
            if (_.isNaN(newQuality)) {
                qualityVal.value = qualityVal.value
            } else {
                qualityVal.value = 0 //force watch trigger
                qualityVal.value = _.clamp(newQuality, qualityRange.min, qualityRange.max)
            }
        }
    })

    async function getConfig() {
        const config = await window.api?.readStore('config')
        if (config) {
            dir.value = config.watchDir
            remove.value = config.removePng
            qualityVal.value = config.quality
            quality.value = config.quality
        }
    }

    async function setConfig() {
        const newConfig = {
            watchDir: dir.value,
            removePng: remove.value,
            quality: quality.value,
        }
        await window.api?.setStore('config', newConfig)
    }
    return {
        dir,
        remove,
        quality,
        qualityVal,
        qualityRange,
        getConfig,
        setConfig,
    }
}

export function useActions() {
    const workProgressDefault = 'Converting'
    const convertedFiles = ref({})
    const converting = ref(false)
    const convertStatus = ref()
    const workProgress = ref('')
    const $listComponent = ref(null)

    function convertDir(targetDir) {
        let fileIndex = 0
        convertedFiles.value = {}
        converting.value = true
        convertStatus.value = null
        workProgress.value = workProgressDefault
        const progressInterval = setInterval(() => {
            if (workProgress.value === workProgressDefault + '...') {
                workProgress.value = workProgressDefault
            } else {
                workProgress.value += '.'
            }
        }, 300)

        window.api?.convertDir(targetDir)
        // window.api?.receive('debug', (messages) => {
        //     console.log(...messages)
        // })
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
                    $listComponent.value?.onEvent()
                }
                e.path = e.path.replace(targetDir, '')
                convertedFiles.value[e.id] = { ...convertedFiles.value[e.id], ...e }
            }
            if (e.end) {
                converting.value = false
                convertStatus.value = `Done! <strong>${Object.keys(convertedFiles.value).length} files</strong> converted`
                clearInterval(progressInterval)
            }
        })
    }


    return {
        convertDir,
        converting,
        convertedFiles,
        convertStatus,
        workProgress,
        workProgressDefault,
        $listComponent
    }
}
