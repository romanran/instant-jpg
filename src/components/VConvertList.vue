<template>
    <div class="convert-list">

        <p class="convert-list__status" v-html="convertStatus" v-show="convertStatus"></p>
        <div class="convert-list__list" ref="$convertList" v-show="convertStatus">
            <p class="convert-list__filename" :class="file.status" :style="`order: ${file.order};`"
                v-for="file in convertedFiles">
                {{ `${file.path} - ${file.status}` }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref, defineExpose } from 'vue'
const $convertList = ref(null)
defineProps({
    convertStatus: String | null,
    convertedFiles: [],
})
defineExpose({
    onEvent() {
        console.log('aaaaa', $convertList.value.scrollHeight);
        $convertList.value.scrollTo({ left: 0, top: $convertList.value.scrollHeight + 20 })
    }
})
</script>

<style lang="scss">
.convert-list {
    display: grid;
    width: 100%;
    padding: 10px;
    flex: 0 1 auto;
    overflow: auto;
    min-height: 120px;
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
        color: yellow;
    }
}

.convert-list__list {
    overflow: auto
}
</style>
