<template>
  <div class="bg-white rounded-xl shadow-xs p-4 sm:p-7">
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-neutral-200">
        Templates
      </h2>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center text-gray-500 py-8">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
      <p>Loading your templates...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center text-red-500 py-8">
      <p class="mb-2">{{ error }}</p>
      <button @click="fetchUserTemplates" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Retry
      </button>
    </div>

    <!-- No Templates -->
    <div v-else-if="userTemplates.length === 0" class="text-center text-gray-500 py-8">
      <p class="mb-4">You haven't created any templates yet.</p>
      <router-link to="/dashboard/templates" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Create Your First Template
      </router-link>
    </div>

    <!-- Templates Grid -->
    <div v-else class="space-y-4">
      <!-- Generate Previews Button -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-md font-medium text-gray-800 dark:text-neutral-200">
          Your Templates
        </h3>
        <button
          v-if="userTemplates.some(t => !t.preview || t.preview === '')"
          @click="generateMissingPreviews"
          :disabled="generatingPreviews"
          class="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {{ generatingPreviews ? `Generating... (${previewProgress.current}/${previewProgress.total})` : 'Generate Missing Previews' }}
        </button>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="template in userTemplates"
          :key="template.id"
          class="relative cursor-pointer rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
          @click="useTemplate(template)"
        >
          <div class="flex flex-col h-full">
            <!-- Template Preview -->
            <div class="w-full h-32 mb-3 rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                v-if="template.preview && template.preview !== ''"
                :src="template.preview"
                :alt="template.name + ' preview'"
                class="w-full h-full object-cover"
                @error="handleImageError(template, $event)"
                @load="(e) => console.log('✅ Template preview loaded successfully:', template.name, e.target.naturalWidth + 'x' + e.target.naturalHeight)"
              />
              <div
                v-else
                class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <div class="text-center">
                  <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-xs">{{ template.type === 'json-resume' ? 'Resume' : 'Design' }}</span>
                </div>
              </div>
            </div>

            <!-- Template Info -->
            <div class="flex-1">
              <h3 class="font-medium text-gray-900 mb-1 truncate">{{ template.name }}</h3>
              <p class="text-sm text-gray-500 mb-2 line-clamp-2">{{ template.description || 'No description' }}</p>

              <!-- Template Meta -->
              <div class="flex items-center justify-between text-xs text-gray-400">
                <span class="px-2 py-1 bg-gray-100 rounded-full">{{ template.category || 'General' }}</span>
                <span>{{ formatDate(template.dateCreation) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllTemplates, updateTemplate } from '@/api/templates.js'
import { createDesignFromTemplate } from '@/services/templateService.js'
import { saveDesign } from '@/api/designs.js'
import { generatePolotnoPreviewFromData, generatePolotnoPreviewById } from '@/services/polotnoPreviewService.js'

const router = useRouter()
const userTemplates = ref([])
const isLoading = ref(true)
const error = ref(null)
const generatingPreviews = ref(false)
const previewProgress = ref({ current: 0, total: 0 })

async function fetchUserTemplates() {
  try {
    isLoading.value = true
    error.value = null

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      error.value = 'Please log in to view your templates'
      return
    }

    const allTemplates = await getAllTemplates()
    userTemplates.value = allTemplates.filter(template =>
      template.public === true || (template.user && template.user.id === user.id)
    )

    console.log('📋 Templates fetched:', userTemplates.value.length)
    userTemplates.value.forEach((template, index) => {
      console.log(`Template ${index + 1}:`, {
        id: template.id,
        name: template.name,
        preview: template.preview,
        hasPreview: !!template.preview,
        previewType: typeof template.preview,
        previewLength: template.preview?.length,
        previewPrefix: template.preview?.substring(0, 100) + '...',
        isValidDataUrl: template.preview?.startsWith('data:image/')
      })
    })
  } catch (err) {
    console.error('Failed to fetch user templates:', err)
    error.value = 'Failed to load your templates. Please try again.'
    userTemplates.value = []
  } finally {
    isLoading.value = false
  }
}

async function useTemplate(template) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      alert('Please log in to use templates')
      return
    }

    const designData = createDesignFromTemplate(template, {
      name: `${template.name} - Copy`
    })

    const saveData = {
      name: `Design from ${template.name}`,
      data: {
        pages: [{
          id: 'page-1',
          width: designData.width,
          height: designData.height,
          children: designData.elements
        }],
        unit: 'pt',
        dpi: 72,
        jsonResume: designData.jsonResume || null
      },
      userId: user.id,
      public: true,
    }

    const response = await saveDesign(saveData)
    if (response && response.data && response.data.id) {
      try {
        const previewDataUrl = await generatePolotnoPreviewById(response.data.id, 400, 300, { forceRefresh: true })
        if (previewDataUrl) {
          const updateData = {
            id: response.data.id,
            name: saveData.name,
            public: saveData.public,
            data: saveData.data,
            imageUrl: previewDataUrl,
            userId: saveData.userId
          }
          await saveDesign(updateData)
          console.log(`✓ Preview generated for new design: ${saveData.name}`)
        }
      } catch (previewError) {
        console.error('Failed to generate preview for new design:', previewError)
      }

      router.push(`/create/${response.data.id}`)
    }
  } catch (error) {
    console.error('Failed to use template:', error)
    alert('Failed to use template. Please try again.')
  }
}

async function generateSingleTemplatePreview(template) {
  try {
    const previewDataUrl = await generatePolotnoPreviewFromData(template.content, 400, 300, { forceRefresh: true })
    if (previewDataUrl) {
      const updateData = { preview: previewDataUrl }
      await updateTemplate(template.id, updateData)
      template.preview = previewDataUrl
      console.log(`✓ Preview generated for template: ${template.name}`)
    }
  } catch (error) {
    console.error(`Error generating preview for template ${template.name}:`, error)
  }
}

async function generateMissingPreviews() {
  const templatesWithoutPreviews = userTemplates.value.filter(t => !t.preview || t.preview === '')
  if (templatesWithoutPreviews.length === 0) {
    return
  }

  generatingPreviews.value = true
  previewProgress.value = { current: 0, total: templatesWithoutPreviews.length }

  try {
    for (const template of templatesWithoutPreviews) {
      previewProgress.value.current++
      await generateSingleTemplatePreview(template)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    alert('Template preview generation completed!')
  } catch (error) {
    console.error('Error in batch template preview generation:', error)
    alert('Some template previews failed to generate.')
  } finally {
    generatingPreviews.value = false
    previewProgress.value = { current: 0, total: 0 }
  }
}

async function handleImageError(template, event) {
  const img = event.target
  const fallback = img.nextElementSibling

  console.error('🖼️ Template preview image failed to load:', {
    src: img.src,
    srcLength: img.src?.length,
    srcPrefix: img.src?.substring(0, 50) + '...',
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    templateId: template.id,
    templateName: template.name,
    error: event
  })

  if (fallback) {
    img.style.display = 'none'
    fallback.style.display = 'flex'
  }

  // Retry preview generation
  try {
    const previewDataUrl = await generatePolotnoPreviewFromData(template.content, 400, 300, { forceRefresh: true })
    if (previewDataUrl) {
      await updateTemplate(template.id, { preview: previewDataUrl })
      template.preview = previewDataUrl
      console.log(`✓ Regenerated preview for template: ${template.name}`)
    }
  } catch (error) {
    console.error(`Failed to regenerate preview for template ${template.name}:`, error)
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  fetchUserTemplates()
})
</script>
