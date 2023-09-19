<template>
    <div class="v-preview">
        <button v-for="i in numberOfTypes" @click="() => onTypeClick(i)">{{ i }}</button>
        <div class="v-preview__image">
            <div class="v-preview__image-regular" :style="`background-image: url(${currentPreview})`"></div>
            <div class="v-preview__image-zoomed" :style="`background-image: url(${currentPreview})`"></div>
        </div>
    </div>
</template>
<script setup>
import { defineProps, computed, ref } from 'vue'

import { nativeImage } from 'electron'
const props = defineProps({
    quality: Number,
    images: [],
    qualityRange: {},
    numberOfTypes: Number
})

const type = ref(1)

function onTypeClick(number) {
    type.value = number
}

const currentPreview = computed(() => {
    const previewsAmount = props.qualityRange.max - props.qualityRange.min + 1
    const imageIndex = previewsAmount * (type.value - 1) + (props.quality - props.qualityRange.min)
    const imageUrl = props.images[imageIndex]
    const image = nativeImage.createFromDataURL(imageUrl)
    console.log(image);
    return image
})

</script>
<style lang="scss">
.v-preview__image {
    position: relative;
}

.v-preview__image-regular {
    width: 400px;
    height: 400px;
    background-size: cover;
    background-position: center;
}

.v-preview__image-zoomed {
    position: absolute;
    top: calc(100% - 200px);
    left: calc(100% - 100px);
    width: 200px;
    height: 200px;
    background-size: 4;
    background-position: center;
}
</style>
