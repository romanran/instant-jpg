<template>
    <div class="v-preview" v-if="currentPreviewUrl">
        <h2 class="v-preview__title">Preview test images</h2>
        <div class="v-preview__image">
            <div class="v-preview__image-regular" :style="`background-image: url(${currentPreviewUrl})`"></div>
            <div class="v-preview__image-zoomed" :style="`background-image: url(${currentPreviewUrl})`"></div>
            <div class="v-preview__size">{{ currentOriginalSize }}kb
                <ArrowRightThin class="v-preview__icon" /> {{ currentPreviewSize }}kb
                <strong>({{ percentageSaved }}% saved)</strong>
            </div>
        </div>
        <MoveResize :size="20" class="v-preview__resize" />
        <div class="v-preview__buttons">
            <button class="v-preview__button" :class="i === type && 'active'" v-for="i in numberOfTypes"
                @click="() => onTypeClick(i)">{{ i }}</button>
        </div>
    </div>
</template>
<script setup>
import { defineProps, watch, ref, onMounted, nextTick, computed } from 'vue'
import ArrowRightThin from 'vue-material-design-icons/ArrowRightThin.vue';
import MoveResize from 'vue-material-design-icons/MoveResize.vue';
import _ from 'lodash'

const props = defineProps({
    quality: Number,
    images: [],
    qualityRange: {},
    numberOfTypes: Number
})

const type = ref(1)
const currentPreviewUrl = ref('')
const currentPreviewSize = ref(0)
const currentOriginalSize = ref(0)
const percentageSaved = computed(() => 100 - _.round(currentPreviewSize.value / currentOriginalSize.value * 100))

function onTypeClick(number) {
    type.value = number
}

function getImageSize(imageUrl) {
    return new Promise((resolve) => {
        const request = new XMLHttpRequest();
        request.addEventListener("load", event => {
            resolve(parseInt(event.total / 1024)) // to kB
        })
        request.open("HEADER", imageUrl);
        request.send(null);
    })
}

async function preloadImage() {
    const img = new Image();
    const previewsAmount = props.qualityRange.max - props.qualityRange.min + 1
    const imageIndex = previewsAmount * (type.value - 1) + (props.quality - props.qualityRange.min)
    const imageUrl = props.images[imageIndex]

    img.src = imageUrl;
    img.addEventListener("load", async () => {
        await nextTick()
        currentPreviewUrl.value = imageUrl
    })
    currentPreviewSize.value = await getImageSize(imageUrl)
    currentOriginalSize.value = await getImageSize(`assets/previews/${type.value}.png`)
}

onMounted(preloadImage)

watch([type, () => props.quality], preloadImage)

</script>
<style lang="scss">
.v-preview__image {
    position: relative;
    resize: vertical;
    overflow: auto;
    min-height: 300px;
    max-height: 600px;
    aspect-ratio: 1 / 1;
    border: 2px solid var(--primary-color);

    &::-webkit-resizer {
        width: 100%;
        height: 15px;
        background: none;
    }
}

.v-preview__resize {
    position: absolute;
    bottom: 0;
    right: 0;
}

.v-preview__image-regular {
    width: 100%;
    padding-bottom: 100%;
    background-size: cover;
    background-position: center;
}

.v-preview__image-zoomed {
    position: absolute;
    bottom: 10px;
    left: 10px;
    width: 100px;
    height: 100px;
    background-size: 1000%;
    background-position: center;
    border-radius: 50%;
    border: 2px solid var(--primary-color);
}

.v-preview__size {
    display: flex;
    justify-content: space-around;
    align-items: center;
    position: absolute;
    top: 0;
    width: 100%;
    line-height: 1;
    padding: 5px 10px;
    background: #333339A0;
    user-select: all;
}

.v-preview__title {
    margin-bottom: 0px;
}

.v-preview__buttons {
    display: flex;
    justify-content: stretch;
    margin: 0;
    width: 100%;
}

.v-preview__button {
    width: 100%;
    box-shadow: none;
    margin: 0 0.5px;

    &.active {
        cursor: default;
        background: var(--primary-color-d);
    }
}

.v-preview__icon {
    line-height: 1;
    vertical-align: middle;
    font-size: 0;
}
</style>
