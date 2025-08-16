<template>
  <div class="bg-white rounded-xl shadow-xs p-4 sm:p-7">
  <!-- Card Blog -->
  <div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center text-gray-500 py-10">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2">Loading public designs...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center text-red-500 py-10">
      <p>{{ error }}</p>
      <button @click="fetchPublicDesigns" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Try Again
      </button>
    </div>

    <!-- Grid -->
    <div v-else-if="publicDesigns.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="design in publicDesigns" :key="design.id" class="group flex flex-col h-full bg-white border border-gray-200 shadow-2xs rounded-xl">
        <div class="h-52 flex justify-center items-center bg-cover bg-center rounded-t-xl" :style="{ backgroundImage: `url(${design.preview || '/placeholder.svg'})` }">
          <!-- Fallback icon if no image available -->
          <span class="text-gray-500" v-if="!design.imageUrl">No Image</span>
        </div>
        <div class="flex-grow p-4 md:p-6">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-neutral-300">{{ design.name }}</h3>
          <p class="mt-3 text-gray-500 dark:text-neutral-500">
            {{ design.description || 'Description not available' }}
          </p>
        </div>
        <div class="mt-auto flex border-t border-gray-200 divide-x divide-gray-200 dark:border-neutral-700">
          <a
            class="w-full py-3 px-4 inline-flex text-sm font-medium bg-white text-gray-800 shadow-2xs hover:bg-gray-50"
            :href="`/create/${design.id}`"
          >
            Use It
          </a>
        </div>
      </div>
    </div>
    <!-- No Designs Message -->
    <div v-else class="text-center text-gray-500 py-10">No public designs available.</div>
    </div>
    <!-- End Grid -->

  <!-- End Card Blog -->
   </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPublicDesigns } from '@/api/designs.js'
import { generatePolotnoPreviewFromData, generatePolotnoPreviewById, generateBatchPolotnopreviews } from '@/services/polotnoPreviewService.js'

const publicDesigns = ref([])
const isLoading = ref(true)
const error = ref(null)

async function fetchPublicDesigns() {
  try {
    isLoading.value = true
    error.value = null
    const designs = await getPublicDesigns()
    publicDesigns.value = designs
  } catch (err) {
    console.error('Failed to fetch public designs:', err)
    error.value = 'Failed to load public designs'
    publicDesigns.value = []
  } finally {
    isLoading.value = false
  }
}

// Test function to debug preview generation using design ID
async function testPreviewGeneration() {
  console.log('🧪 Testing Vite preview generation by design ID...')

  if (publicDesigns.value.length === 0) {
    alert('No designs available to test!')
    return
  }

  const testDesign = publicDesigns.value[0]
  console.log('🎯 Testing with design ID:', testDesign.id)

  try {
    // Test using design ID to fetch and render canvas elements
    const previewDataUrl = await generatePolotnoPreviewById(testDesign.id, 400, 300)
    console.log('✅ Test preview generated successfully:', previewDataUrl ? 'Yes' : 'No')

    if (previewDataUrl) {
      // Create a temporary image to show the result
      const img = new Image()
      img.src = previewDataUrl
      img.style.border = '2px solid green'
      img.style.maxWidth = '200px'
      img.style.maxHeight = '150px'

      // Show in a new window for testing
      const newWindow = window.open('', '_blank', 'width=400,height=300')
      newWindow.document.body.appendChild(img)
      newWindow.document.title = `Test Preview Result - Design ID: ${testDesign.id}`

      // Also test the regular method for comparison
      console.log('🔄 Also testing with design data object...')
      const previewDataUrl2 = await generatePolotnoPreviewFromData(testDesign, 400, 300)
      if (previewDataUrl2) {
        const img2 = new Image()
        img2.src = previewDataUrl2
        img2.style.border = '2px solid blue'
        img2.style.maxWidth = '200px'
        img2.style.maxHeight = '150px'
        img2.style.marginLeft = '10px'
        newWindow.document.body.appendChild(img2)
      }
    }
  } catch (error) {
    console.error('❌ Test preview generation failed:', error)
    alert('Test failed! Check console for details.')
  }
}

// Generate missing previews for designs that don't have them using design IDs
async function generateMissingPreviews() {
  console.log('🔄 Starting batch preview generation using design IDs...')

  const designsWithoutPreviews = publicDesigns.value.filter(design => !design.preview)

  if (designsWithoutPreviews.length === 0) {
    alert('All designs already have previews!')
    return
  }

  console.log(`📊 Found ${designsWithoutPreviews.length} designs without previews`)

  try {
    let successCount = 0

    for (const design of designsWithoutPreviews) {
      try {
        console.log(`🎨 Generating preview for design ID: ${design.id}`)
        const previewDataUrl = await generatePolotnoPreviewById(design.id, 400, 300)

        if (previewDataUrl) {
          design.preview = previewDataUrl
          successCount++
          console.log(`✅ Preview generated for design ${design.id}`)
        } else {
          console.warn(`⚠️ No preview generated for design ${design.id}`)
        }
      } catch (error) {
        console.error(`❌ Failed to generate preview for design ${design.id}:`, error)
      }
    }

    alert(`Generated ${successCount} previews successfully out of ${designsWithoutPreviews.length} designs!`)
  } catch (error) {
    console.error('❌ Batch preview generation failed:', error)
    alert('Batch generation failed! Check console for details.')
  }
}

onMounted(() => {
  fetchPublicDesigns()
})
</script>
