<script setup>
defineProps({
  type: { type: String, default: 'text' },
  id: String,
  name: String,
  placeholder: String,
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
})

const modelValue = defineModel()
</script>

<template>
  <input
    :id="id"
    :name="name"
    :type="type"
    :placeholder="placeholder"
    v-model="modelValue"
    :disabled="disabled"
    :required="required"
    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</template>
