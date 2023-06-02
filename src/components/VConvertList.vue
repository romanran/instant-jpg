<template>
    <p class="convert-list__status" v-html="convertStatus" v-show="convertStatus"></p>
    <div class="convert-list" ref="$convertList" v-show="convertStatus">
        <p
            class="convert-list__filename"
            :class="file.status"
            :style="`order: ${file.order};`"
            v-for="file in convertedFiles"
        >
            {{ `${file.path} - ${file.status}` }}
        </p>
    </div>
</template>

<script setup>
import { defineProps } from 'vue'
defineProps({
    convertStatus: String | null,
    convertedFiles: [],
})
</script>

<style lang="scss" scoped></style>
