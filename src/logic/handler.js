import { ref } from 'vue'

export function usePreviews() {
    const previews = []
    const noOfPreviews = 4
    for (let qualityIndex = 60; qualityIndex <= 100; qualityIndex++) {
        for (let previewIndex = 1; previewIndex <= noOfPreviews; previewIndex++) {
            previews.push(`serve://assets/previews/${previewIndex}-quality${qualityIndex}.jpg`)
        }
    }
    return {
        previews
    }
}

export function useConfig() {
    const dir = ref('')
    const remove = ref(true)
    const quality = ref(90)
    async function getConfig() {
        const config = await window.api?.readStore('config')

        if (config) {
            dir.value = config.watchDir
            remove.value = config.removePng
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
    const $convertList = ref(null)

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
                    $convertList.value.onEvent()
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
    }
}
