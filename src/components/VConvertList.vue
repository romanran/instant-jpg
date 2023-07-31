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
        $convertList.value.scrollTo({ left: 0, top: $convertList.value.scrollHeight + 20 })
    }
})
</script>

<style lang="scss" scoped></style>
