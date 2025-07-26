<script setup>
import AuthCard from '@/components/organisms/auth/AuthCard.vue'
import { ref } from 'vue'

const mode = ref('signup')
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900">
    <AuthCard :mode="mode" />
  </div>
</template>
