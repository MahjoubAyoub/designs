<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getTestimonials } from '@/api/testimonials.js'
import BaseIcon from '@/components/atoms/BaseIcon.vue'

// Testimonials data
const testimonials = ref([])
const currentIndex = ref(0)
const isLoading = ref(true)
const error = ref(null)

// Auto-rotation
let rotationInterval = null
const autoRotateDelay = 5000 // 5 seconds

// Fetch testimonials from backend
const fetchTestimonials = async () => {
  try {
    isLoading.value = true
    error.value = null
    const data = await getTestimonials()
    testimonials.value = data
    
    // If no testimonials, use fallback
    if (data.length === 0) {
      testimonials.value = [{
        id: 'fallback',
        name: 'Our Users',
        message: 'Join thousands of professionals who trust our platform to create stunning resumes.',
        jobTitle: 'Professional',
        company: 'Community'
      }]
    }
  } catch (err) {
    console.error('Failed to fetch testimonials:', err)
    error.value = err.message
    // Use fallback testimonial on error
    testimonials.value = [{
      id: 'fallback',
      name: 'Our Users',
      message: 'Join thousands of professionals who trust our platform to create stunning resumes.',
      jobTitle: 'Professional',
      company: 'Community'
    }]
  } finally {
    isLoading.value = false
  }
}

// Get current testimonial
const currentTestimonial = computed(() => {
  if (testimonials.value.length === 0) return null
  return testimonials.value[currentIndex.value]
})

// Navigation functions
const nextTestimonial = () => {
  if (testimonials.value.length > 1) {
    currentIndex.value = (currentIndex.value + 1) % testimonials.value.length
  }
}

const prevTestimonial = () => {
  if (testimonials.value.length > 1) {
    currentIndex.value = currentIndex.value === 0 ? testimonials.value.length - 1 : currentIndex.value - 1
  }
}

const goToTestimonial = (index) => {
  currentIndex.value = index
}

// Auto-rotation
const startAutoRotation = () => {
  if (testimonials.value.length > 1) {
    rotationInterval = setInterval(nextTestimonial, autoRotateDelay)
  }
}

const stopAutoRotation = () => {
  if (rotationInterval) {
    clearInterval(rotationInterval)
    rotationInterval = null
  }
}

// Lifecycle
onMounted(() => {
  fetchTestimonials().then(() => {
    startAutoRotation()
  })
})

onUnmounted(() => {
  stopAutoRotation()
})
</script>

<template>
  <!-- Testimonials -->
  <div class="relative max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center lg:mx-auto lg:w-3/5">
      <div class="animate-pulse">
        <div class="h-8 bg-gray-200 rounded mb-4"></div>
        <div class="h-4 bg-gray-200 rounded mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
      </div>
    </div>

    <!-- Testimonials Content -->
    <div v-else class="relative">
      <!-- Navigation Arrows (only show if multiple testimonials) -->
      <div v-if="testimonials.length > 1" class="absolute inset-y-0 left-0 flex items-center">
        <button
          @click="prevTestimonial"
          @mouseenter="stopAutoRotation"
          @mouseleave="startAutoRotation"
          class="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors z-10"
          aria-label="Previous testimonial"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div v-if="testimonials.length > 1" class="absolute inset-y-0 right-0 flex items-center">
        <button
          @click="nextTestimonial"
          @mouseenter="stopAutoRotation"
          @mouseleave="startAutoRotation"
          class="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors z-10"
          aria-label="Next testimonial"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Blockquote -->
      <blockquote 
        class="text-center lg:mx-auto lg:w-3/5 transition-all duration-500 ease-in-out"
        @mouseenter="stopAutoRotation"
        @mouseleave="startAutoRotation"
      >
        <div class="relative mt-6 lg:mt-10">
          <BaseIcon
            name="Quote"
            size="40"
            class="absolute top-0 start-0 text-primary rotate-180 -z-10"
          ></BaseIcon>
          <p
            class="relative text-xl sm:text-2xl md:text-3xl md:leading-normal font-medium italic text-gray-800 min-h-[120px] flex items-center justify-center"
          >
            {{ currentTestimonial?.message }}
          </p>
          <BaseIcon name="Quote" size="40" class="absolute bottom-0 end-0 text-primary"></BaseIcon>
        </div>

        <footer class="mt-6">
          <div class="font-semibold text-gray-800 dark:text-neutral-200">
            {{ currentTestimonial?.name }}
          </div>
          <div class="text-sm text-gray-500 dark:text-neutral-500">
            <span v-if="currentTestimonial?.jobTitle">{{ currentTestimonial.jobTitle }}</span>
            <span v-if="currentTestimonial?.jobTitle && currentTestimonial?.company"> | </span>
            <span v-if="currentTestimonial?.company">{{ currentTestimonial.company }}</span>
          </div>
        </footer>
      </blockquote>
      <!-- End Blockquote -->

      <!-- Dots Indicator (only show if multiple testimonials) -->
      <div v-if="testimonials.length > 1" class="flex justify-center mt-8 space-x-2">
        <button
          v-for="(testimonial, index) in testimonials"
          :key="testimonial.id"
          @click="goToTestimonial(index)"
          @mouseenter="stopAutoRotation"
          @mouseleave="startAutoRotation"
          class="w-3 h-3 rounded-full transition-colors"
          :class="index === currentIndex ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'"
          :aria-label="`Go to testimonial ${index + 1}`"
        ></button>
      </div>
    </div>
  </div>
  <!-- End Testimonials -->
</template>
