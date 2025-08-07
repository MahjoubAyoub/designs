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
                @error="handleImageError"
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
import { getAllTemplates} from '@/api/templates.js'
import { createDesignFromTemplate } from '@/services/templateService.js'
import { saveDesign } from '@/api/designs.js'

const router = useRouter()
const userTemplates = ref([])
const isLoading = ref(true)
const error = ref(null)

// Fetch user templates
async function fetchUserTemplates() {
  try {
    isLoading.value = true
    error.value = null
    
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      error.value = 'Please log in to view your templates'
      return
    }
    
    // Get all templates and filter by current user and public templates
    const allTemplates = await getAllTemplates()
    userTemplates.value = allTemplates.filter(template => 
      template.public === true || (template.user && template.user.id === user.id)
    )
  } catch (err) {
    console.error('Failed to fetch user templates:', err)
    error.value = 'Failed to load your templates. Please try again.'
    userTemplates.value = []
  } finally {
    isLoading.value = false
  }
}

// Use a template to create a new design
async function useTemplate(template) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      alert('Please log in to use templates')
      return
    }
    
    // Create design data from template
    const designData = createDesignFromTemplate(template, {
      name: `${template.name} - Copy`
    })
    
    // Save the new design
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
      // Navigate to the editor with the new design
      router.push(`/create/${response.data.id}`)
    }
  } catch (error) {
    console.error('Failed to use template:', error)
    alert('Failed to use template. Please try again.')
  }
}

// Handle image loading errors
function handleImageError(event) {
  const img = event.target
  const fallback = img.nextElementSibling
  if (fallback) {
    img.style.display = 'none'
    fallback.style.display = 'flex'
  }
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString()
}


onMounted(() => {
  fetchUserTemplates()
})
</script>

