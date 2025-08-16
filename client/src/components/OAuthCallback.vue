<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
      <p class="mt-4 text-lg">Processing authentication...</p>
      <p v-if="error" class="mt-2 text-red-500">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const error = ref('')

onMounted(async () => {
  try {
    // Get the token and user data from URL parameters
    const token = route.query.token
    const userData = route.query.user
    
    if (!token) {
      throw new Error('No authentication token received')
    }
    
    // Store the token and user data
    localStorage.setItem('token', token)
    
    if (userData) {
      // Decode the user data (it's URL encoded)
      const decodedUserData = decodeURIComponent(userData)
      localStorage.setItem('user', decodedUserData)
    }
    
    // Redirect to dashboard
    router.push('/dashboard/designs')
  } catch (err) {
    error.value = err.message
    console.error('OAuth callback error:', err)
    
    // Redirect to login page after a delay
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }
})
</script>

<style scoped>
/* Add any specific styles if needed */
</style>