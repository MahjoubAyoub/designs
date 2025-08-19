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

    <!-- Generate Missing Previews Button -->
    <div v-else-if="publicDesigns.length > 0" class="space-y-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-800 dark:text-neutral-200">
          Public Designs
        </h3>
        <button
          v-if="publicDesigns.some(d => !d.preview && !d.imageUrl)"
          @click="generateMissingPreviews"
          :disabled="generatingPreviews"
          class="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {{ generatingPreviews ? `Generating... (${previewProgress.current}/${previewProgress.total})` : 'Generate Missing Previews' }}
        </button>
      </div>

    <!-- Grid -->
    <div class="grid sm:grid-cols-3 gap-4">
                <button
                  v-for="design in publicDesigns"
                  :key="design.id"
                  type="button"
                  class="relative cursor-pointer rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors w-full"
                  @click="copyDesign(design)"
                >
                  <div class="flex flex-col items-center">
                    <!-- Preview Image -->
                    <div class="w-full h-32 mb-3 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        v-if="design.imageUrl"
                        :src="design.imageUrl"
                        :alt="design.name"
                        class="w-full h-full object-contain"
                      />
                      <div v-else class="text-gray-400 text-sm text-center">
                        <div class="mb-1">📄</div>
                        <div>No Preview</div>
                      </div>
                    </div>

                    <!-- Design Info -->
                    <div class="text-center">
                      <div class="font-semibold text-sm text-gray-800 dark:text-neutral-200 mb-1">
                        {{ design.name }}
                      </div>
                      <div class="text-xs text-gray-500 mb-2">
                        By {{ design.user?.name || `User ${design.user?.id}` || 'Unknown' }}
                      </div>
                      <div class="text-xs text-blue-600 font-medium">
                        Click to use
                      </div>
                    </div>
                  </div>
                </button>
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
import { getPublicDesigns, saveDesign } from '@/api/designs.js'
import { generatePolotnoPreviewFromData, generatePolotnoPreviewById } from '@/services/polotnoPreviewService.js'

const publicDesigns = ref([])
const isLoading = ref(true)
const error = ref(null)
const generatingPreviews = ref(false)
const previewProgress = ref({ current: 0, total: 0 })

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
    console.error('Test preview generation failed:', error)
    alert('Test failed! Check console for details.')
  }
}

// Generate preview for a single design
async function generateSingleDesignPreview(design) {
  try {
    const previewDataUrl = await generatePolotnoPreviewById(design.id, 400, 300)

    if (previewDataUrl) {
      // Update design with preview
      const updateData = {
        id: design.id,
        name: design.name,
        public: design.public,
        data: design.data,
        imageUrl: previewDataUrl,
        userId: design.userId
      }

      await saveDesign(updateData)
      design.imageUrl = previewDataUrl
      design.preview = previewDataUrl
      console.log(`✓ Preview generated for design: ${design.name}`)
    }
  } catch (error) {
    console.error(`Error generating preview for design ${design.name}:`, error)
  }
}

// Generate missing previews for designs that don't have them
async function generateMissingPreviews() {
  const designsWithoutPreviews = publicDesigns.value.filter(d => !d.preview && !d.imageUrl)

  if (designsWithoutPreviews.length === 0) {
    return
  }

  generatingPreviews.value = true
  previewProgress.value = { current: 0, total: designsWithoutPreviews.length }

  try {
    for (const design of designsWithoutPreviews) {
      previewProgress.value.current++
      await generateSingleDesignPreview(design)
      // Add a small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    alert('Preview generation completed!')
  } catch (error) {
    console.error('Error in batch preview generation:', error)
    alert('Some previews failed to generate.')
  } finally {
    generatingPreviews.value = false
    previewProgress.value = { current: 0, total: 0 }
  }
}

onMounted(() => {
  fetchPublicDesigns()
})
</script>
