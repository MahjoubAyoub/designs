<script setup>
defineProps({
  type: { type: String, default: 'text' },
  id: String,
  placeholder: String,
})

const modelValue = defineModel()
</script>

<template>
  <input
    :id="id"
    :type="type"
    :placeholder="placeholder"
    v-model="modelValue"
    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</template>
