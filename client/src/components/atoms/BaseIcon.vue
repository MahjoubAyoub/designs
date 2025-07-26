<script setup>
import { defineAsyncComponent } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [String, Number], default: 16 },
  strokeWidth: { type: [String, Number], default: 2 },
})

// Lazy load icons
const Icon = defineAsyncComponent(() =>
  import(`lucide-vue-next`).then((module) => module[props.name]),
)
</script>

<template>
  <component :is="Icon" :size="size" :strokeWidth="strokeWidth"></component>
</template>
