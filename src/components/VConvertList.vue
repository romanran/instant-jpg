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
import { defineProps, watch, ref } from 'vue'
const props = defineProps({
    convertStatus: String | null,
    convertedFiles: [],
})
const $convertList = ref()

const a =
[
    {
      "id": "tab1",
      "label": "Audi R8",
      "content": "The Audi R8 is a mid-engine, 2-seater sports car, which uses Audi's trademark quattro permanent all-wheel drive system. It was introduced by the German car manufacturer Audi AG in 2006."
    },
	{
      "id": "tab1",
      "label": "BMW 3 Series (E36)",
      "content": "The third generation of the BMW 3 Series range of compact executive cars is designated under the model code E36, and was produced by the German automaker BMW from 1990 to 2000. The initial models were of the four-door sedan body style, followed by the coupe, convertible, wagon (\"Touring\"), hatchback (\"Compact\"), and the rare four-door convertible Baur TC4 in later years."
    },
	{
      "id": "tab1",
      "label": "Mercedes-Benz CLS (C219)",
      "content": "The C219 Mercedes-Benz CLS-Class is the first generation of the CLS-Class range of four-door coupe which features a fastback body style by Mercedes-Benz, and was produced between 2004 and 2010."
    }
  ]


watch(
    () => props.convertedFiles,
    () => {
        $convertList.value.scrollTo({ left: 0, top: $convertList.value.scrollHeight + 20 })
    },
    { deep: true }
)
</script>

<style lang="scss" scoped></style>
