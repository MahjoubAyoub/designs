<script setup>
import BaseInput from '@/components/atoms/BaseInput.vue'
defineProps({
  name: {
    type: String,
    default: 'Untitled Design',
  },
  onSave: {
    type: Function,
    required: true,
  },
})
</script>

<template>
  <header class="bg-white shadow-sm p-1 flex justify-between items-center">
    <router-link
      class="flex items-center mx-2 text-gray-600 hover:text-blue-600 focus:outline-none"
      to="dashboard"
      >Go Back</router-link
    >
    <BaseInput type="text" placeholder="Design Name" class="!w-auto mr-auto" value="Test Design" />
    <baseButton class="bg-blue-600 text-white px-4 py-2 rounded-lg"> Save Design </baseButton>
  </header>
</template>
