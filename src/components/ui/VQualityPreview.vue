<template>
    <div class="v-preview" v-if="currentPreview">
        <button v-for="i in numberOfTypes" @click="() => onTypeClick(i)">{{ i }}</button>
        <div class="v-preview__image">
            <div class="v-preview__image-regular" :style="`background-image: url(${currentPreview})`"></div>
            <div class="v-preview__image-zoomed" :style="`background-image: url(${currentPreview})`"></div>
        </div>
    </div>
</template>
<script setup>
import { defineProps, watch, ref, onMounted } from 'vue'

const props = defineProps({
    quality: Number,
    images: [],
    qualityRange: {},
    numberOfTypes: Number
})

const type = ref(1)
const currentPreview = ref()

function onTypeClick(number) {
    type.value = number
}
function setPreviewUrl(url) {
    currentPreview.value = url
}
function preloadImage() {
    const img = new Image();
    const previewsAmount = props.qualityRange.max - props.qualityRange.min + 1
    const imageIndex = previewsAmount * (type.value - 1) + (props.quality - props.qualityRange.min)
    const imageUrl = props.images[imageIndex]
    img.src = imageUrl;
    img.onload = setPreviewUrl.bind(this, imageUrl)
}

watch([type, () => props.quality], preloadImage)

onMounted(preloadImage)

</script>
<style lang="scss">
.v-preview__image {
    position: relative;
    resize: vertical;
    overflow: auto;
    max-height: 600px;
    aspect-ratio: 1 / 1;
}

.v-preview__image-regular {
    width: 100%;
    padding-bottom: 100%;
    background-size: cover;
    background-position: center;
}

.v-preview__image-zoomed {
    position: absolute;
    bottom: 0px;
    left: 0px;
    width: 100px;
    height: 100px;
    background-size: 1000%;
    background-position: center;
    border-radius: 50%;
    border: 2px solid var(--primary-color);
}
</style>
