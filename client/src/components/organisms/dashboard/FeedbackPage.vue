<script setup>
import { ref } from 'vue'
import { sendContactMessage } from '@/api/contact.js'
import BaseButton from '@/components/atoms/BaseButton.vue'

// Form data
const feedbackData = ref({
  name: '',
  email: '',
  feedback: ''
})

// Form state
const isSubmitting = ref(false)
const submitStatus = ref(null) // 'success', 'error', or null
const errorMessage = ref('')

// Load user data from localStorage
const loadUserData = () => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      feedbackData.value.name = user.nom || user.email || ''
      feedbackData.value.email = user.email || ''
    } catch (e) {
      console.error('Error parsing user data:', e)
    }
  }
}

// Initialize with user data
loadUserData()

// Form validation
const validateForm = () => {
  if (!feedbackData.value.name.trim()) {
    throw new Error('Name is required')
  }
  if (!feedbackData.value.email.trim()) {
    throw new Error('Email is required')
  }
  if (!feedbackData.value.email.includes('@')) {
    throw new Error('Please enter a valid email address')
  }
  if (!feedbackData.value.feedback.trim()) {
    throw new Error('Feedback is required')
  }
}

// Handle form submission
const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    submitStatus.value = null
    errorMessage.value = ''
    
    // Validate form
    validateForm()
    
    // Prepare data for API (reusing contact API structure)
    const contactData = {
      name: feedbackData.value.name,
      email: feedbackData.value.email,
      message: `Dashboard Feedback:\n\n${feedbackData.value.feedback}`
    }
    
    // Send to backend using existing contact API
    await sendContactMessage(contactData)
    
    // Success
    submitStatus.value = 'success'
    
    // Reset feedback field only
    feedbackData.value.feedback = ''
    
  } catch (error) {
    console.error('Feedback form error:', error)
    submitStatus.value = 'error'
    errorMessage.value = error.message || 'Failed to send feedback. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Feedback</h1>
      <p class="text-gray-600">
        We value your feedback! Let us know what you think about our platform and how we can improve.
      </p>
    </div>
    
    <!-- Success Message -->
    <div v-if="submitStatus === 'success'" class="mb-6 p-4 text-green-700 bg-green-100 rounded-lg border border-green-200">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span class="font-medium">Thank you for your feedback!</span>
      </div>
      <p class="mt-1 text-sm">We appreciate your input and will use it to improve our platform.</p>
    </div>
    
    <!-- Error Message -->
    <div v-if="submitStatus === 'error'" class="mb-6 p-4 text-red-700 bg-red-100 rounded-lg border border-red-200">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span class="font-medium">Error</span>
      </div>
      <p class="mt-1 text-sm">{{ errorMessage }}</p>
    </div>
    
    <!-- Feedback Form -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Name Field -->
        <div>
          <label for="feedback-name" class="block text-sm font-medium text-gray-700 mb-2">
            Your Name *
          </label>
          <input
            id="feedback-name"
            v-model="feedbackData.name"
            type="text"
            :disabled="isSubmitting"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            placeholder="Enter your name"
            required
          />
        </div>
        
        <!-- Email Field -->
        <div>
          <label for="feedback-email" class="block text-sm font-medium text-gray-700 mb-2">
            Your Email *
          </label>
          <input
            id="feedback-email"
            v-model="feedbackData.email"
            type="email"
            :disabled="isSubmitting"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <!-- Feedback Field -->
        <div>
          <label for="feedback-message" class="block text-sm font-medium text-gray-700 mb-2">
            Your Feedback *
          </label>
          <textarea
            id="feedback-message"
            v-model="feedbackData.feedback"
            :disabled="isSubmitting"
            rows="8"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none transition-colors"
            placeholder="Tell us what you think about our platform. What do you like? What could be improved? Any suggestions or issues you've encountered?"
            required
          ></textarea>
        </div>
        
        <!-- Submit Button -->
        <div class="flex justify-end">
          <BaseButton
            type="submit"
            :disabled="isSubmitting"
            class="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isSubmitting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending Feedback...
            </span>
            <span v-else>Send Feedback</span>
          </BaseButton>
        </div>
      </form>
    </div>
    
    <!-- Additional Info -->
    <div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-blue-800 mb-1">How we use your feedback</h3>
          <p class="text-sm text-blue-700">
            Your feedback helps us understand what's working well and what needs improvement. 
            We review all feedback and use it to prioritize new features and bug fixes.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>