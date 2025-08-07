<script setup>
import { ref } from 'vue'
import InputBox from '@/components/molecules/InputBox.vue'
import { sendContactMessage } from '@/api/contact.js'

// Form data
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  website: '',
  message: ''
})

// Form state
const isSubmitting = ref(false)
const submitStatus = ref(null) // 'success', 'error', or null
const errorMessage = ref('')

// Form validation
const validateForm = () => {
  if (!formData.value.firstName.trim()) {
    throw new Error('First name is required')
  }
  if (!formData.value.lastName.trim()) {
    throw new Error('Last name is required')
  }
  if (!formData.value.email.trim()) {
    throw new Error('Email is required')
  }
  if (!formData.value.email.includes('@')) {
    throw new Error('Please enter a valid email address')
  }
  if (!formData.value.message.trim()) {
    throw new Error('Message is required')
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
    
    // Prepare data for API
    const contactData = {
      name: `${formData.value.firstName} ${formData.value.lastName}`,
      email: formData.value.email,
      message: `Company: ${formData.value.company}\nWebsite: ${formData.value.website}\n\nMessage:\n${formData.value.message}`
    }
    
    // Send to backend
    await sendContactMessage(contactData)
    
    // Success
    submitStatus.value = 'success'
    
    // Reset form
    formData.value = {
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      website: '',
      message: ''
    }
    
  } catch (error) {
    console.error('Contact form error:', error)
    submitStatus.value = 'error'
    errorMessage.value = error.message || 'Failed to send message. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <!-- Hire Us -->
  <div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
    <!-- Grid -->
    <div class="grid md:grid-cols-2 items-center gap-12">
      <div>
        <h1
          class="text-3xl font-bold text-gray-800 sm:text-4xl lg:text-5xl lg:leading-tight dark:text-white"
        >
          Contact Us
        </h1>
        <p class="mt-1 md:text-lg text-gray-800 dark:text-neutral-200">
          We help brands and platforms turn big ideas into beautiful digital products and
          experiences.
        </p>
      </div>
      <!-- Brands -->
      <div class="relative">
        <!-- Card -->
        <div class="flex flex-col border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-10">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-neutral-200">
            Fill in the form
          </h2>

          <form @submit.prevent="handleSubmit">
            <!-- Success Message -->
            <div v-if="submitStatus === 'success'" class="mb-4 p-4 text-green-700 bg-green-100 rounded-lg">
              ✅ Thank you! Your message has been sent successfully. We'll get back to you soon.
            </div>
            
            <!-- Error Message -->
            <div v-if="submitStatus === 'error'" class="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
              ❌ {{ errorMessage }}
            </div>
            
            <div class="mt-6 grid gap-4 lg:gap-6">
              <!-- Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <InputBox 
                    label="First Name" 
                    v-model="formData.firstName"
                    :disabled="isSubmitting"
                    required
                  />
                </div>

                <div>
                  <InputBox 
                    label="Last Name" 
                    v-model="formData.lastName"
                    :disabled="isSubmitting"
                    required
                  />
                </div>
              </div>
              <!-- End Grid -->

              <div>
                <InputBox 
                  label="Work Email" 
                  type="email"
                  v-model="formData.email"
                  :disabled="isSubmitting"
                  required
                />
              </div>

              <!-- Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <InputBox 
                    label="Company" 
                    v-model="formData.company"
                    :disabled="isSubmitting"
                  />
                </div>

                <div>
                  <InputBox 
                    label="Company Website" 
                    v-model="formData.website"
                    :disabled="isSubmitting"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <!-- End Grid -->
              <div>
                <label
                  for="contact-message"
                  class="block mb-2 text-sm text-gray-700 font-medium dark:text-white"
                  >Details *</label
                >
                <textarea
                  id="contact-message"
                  v-model="formData.message"
                  :disabled="isSubmitting"
                  rows="4"
                  class="py-2.5 sm:py-3 px-4 block w-full rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none border-gray-300"
                  placeholder="Tell us about your project, requirements, or any questions you have..."
                  required
                ></textarea>
              </div>
            </div>
            
            <!-- Submit Button -->
            <div class="mt-6 grid">
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                <span v-if="isSubmitting" class="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading"></span>
                {{ isSubmitting ? 'Sending...' : 'Send inquiry' }}
              </button>
            </div>
          </form>

          <div class="mt-3 text-center">
            <p class="text-sm text-gray-500 dark:text-neutral-500">
              We'll get back to you in 1-2 business days.
            </p>
          </div>
        </div>
        <!-- End Card -->
      </div>
      <!-- End Col -->
    </div>
    <!-- End Grid -->
  </div>
  <!-- End Hire Us -->
</template>
