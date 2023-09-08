<template>
    <div class="v-preview">
        <div class="v-preview__image" :style="`background-image: url(${currentPreview})`"></div>
    </div>
</template>
<script setup>
import { defineProps, computed, ref } from 'vue'
const props = defineProps({
    quality: Number,
    images: [],
    qualityRange: {},
    numberOfTypes: Number
})

const type = ref(1)

const currentPreview = computed(() => {
    const imageIndex = props.quality * type.value - props.qualityRange.min
    return props.images[imageIndex]
})

</script>
<style lang="scss">
.v-preview__image {
    width: 200px;
    height: 200px;
    background-size: 2;
    background-position: center;
}
</style>
