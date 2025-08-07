<template>
  <div class="bg-white rounded-xl shadow-xs p-4 sm:p-7">
    <div>
      <!-- Section -->
      <div class="grid sm:grid-cols-12 gap-2 sm:gap-4 border-gray-200">
        <div class="sm:col-span-12">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-neutral-200">
            Create a new design
          </h2>
        </div>
        <div class="sm:col-span-12">
          <InputBox id="template_name" label="Design Name" placeholder="Choose your design name" v-model="name" />
        </div>
      </div>
      <!-- End Section -->

      <!-- Section -->
      <div class="mt-15">
        <div class="border-b border-gray-200">
          <nav class="flex gap-x-2" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
            <button
              type="button"
              class="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-10 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              @click="activeTab = 'empty'"
              :class="{ 'border-blue-600 text-blue-600 font-semibold': activeTab === 'empty' }"
            >
              Empty
            </button>
            
            <button
              type="button"
              class="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-10 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              @click="activeTab = 'pre-defined'"
              :class="{ 'border-blue-600 text-blue-600 font-semibold': activeTab === 'pre-defined' }"
            >
              Create Custom Resume
            </button>
            
            <button
              type="button"
              class="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-10 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              @click="activeTab = 'templates'"
              :class="{ 'border-blue-600 text-blue-600 font-semibold': activeTab === 'templates' }"
            >
              Templates
            </button>
            
            <button
              type="button"
              class="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-10 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              @click="activeTab = 'public'"
              :class="{ 'border-blue-600 text-blue-600 font-semibold': activeTab === 'public' }"
            >
              Public
            </button>
          </nav>
        </div>

        <div class="mt-3">
          <!-- Empty Canvas Tab -->
          <div
            id="basic-tabs-1"
            role="tabpanel"
            :class="{ hidden: activeTab !== 'empty' }"
          >
            <div class="space-y-4">
              <h3 class="text-md font-medium text-gray-800 dark:text-neutral-200">
                Select Canvas Size
              </h3>
              <div class="grid sm:grid-cols-3 gap-4">
                <label
                  v-for="size in canvasSizes"
                  :key="size.id"
                  class="relative block cursor-pointer rounded-lg border border-gray-200 p-4 hover:border-blue-500"
                  :class="{ 'border-blue-500 bg-blue-50': selectedSize === size.id }"
                >
                  <input
                    :id="size.id"
                    type="radio"
                    v-model="selectedSize"
                    :value="size.id"
                    class="absolute opacity-0"
                  />
                  <div class="flex flex-col items-center">
                    <div
                      class="w-24 h-24 bg-gray-100 mb-2 flex items-center justify-center text-xs text-gray-500"
                      :style="{
                        aspectRatio: size.width / size.height,
                        maxWidth: '100px',
                        maxHeight: '100px',
                      }"
                    >
                      {{ size.width }} x {{ size.height }}
                    </div>
                    <span class="text-sm font-medium text-gray-800 dark:text-neutral-200">
                      {{ size.label }}
                    </span>
                  </div>
                </label>
              </div>
              <!-- Custom Size Inputs -->
              <div v-if="selectedSize === 'custom'" class="grid sm:grid-cols-2 gap-4 mt-4">
                <InputBox
                  id="custom_width"
                  label="Width (px)"
                  type="number"
                  placeholder="Width"
                  v-model.number="customWidth"
                />
                <InputBox
                  id="custom_height"
                  label="Height (px)"
                  type="number"
                  placeholder="Height"
                  v-model.number="customHeight"
                />
              </div>
            </div>
          </div>
         
          <!-- Custom Resume Tab -->
          <div
             id="basic-tabs-2"
             role="tabpanel"
             :class="{ hidden: activeTab !== 'pre-defined' }"
           >
             <div class="space-y-4">
               <h3 class="text-md font-medium text-gray-800 dark:text-neutral-200">
                 Create Custom Resume
               </h3>
               <div class="mt-8 p-8 border border-gray-200 rounded-xl bg-white">
                 <JsonResumeForm />
               </div>
             </div>
           </div>
          
          <!-- Templates Tab -->
          <div
            id="basic-tabs-3"
            role="tabpanel"
            :class="{ hidden: activeTab !== 'templates' }"
          >
            <div class="flex space-x-2 justify-end mb-4">
              <input
                type="file"
                ref="fileInput"
                @change="handleImport"
                accept=".json"
                class="hidden"
              />
              <BaseButton
                @click="triggerImport"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Import Template
              </BaseButton>
            </div>
            
            <!-- Loading State -->
            <div v-if="isLoadingTemplates" class="text-center text-gray-500 py-8">
              <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
              <p>Loading templates...</p>
            </div>
            
            <!-- Error State -->
            <div v-else-if="templatesError" class="text-center text-red-500 py-8">
              <p class="mb-2">{{ templatesError }}</p>
              <button @click="fetchUserTemplates" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Retry
              </button>
            </div>
            
            <!-- No Templates -->
            <div v-else-if="userTemplates.length === 0" class="text-center text-gray-500 py-8">
              <p>No templates available. Import some templates to get started!</p>
            </div>
            
            <!-- Templates Grid -->
             <div v-else class="space-y-4">
               <div class="flex items-center justify-between mb-4">
                 <h3 class="text-md font-medium text-gray-800 dark:text-neutral-200">
                   Your Templates
                 </h3>
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
                     <div class="w-full h-32 mb-3 rounded-lg overflow-hidden border-2 border-gray-200 relative">
                       <!-- Loading indicator for preview generation -->
                       <div 
                         v-if="generatingPreviewFor === template.id"
                         class="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10"
                       >
                         <div class="text-center">
                           <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                           <p class="text-xs text-gray-600">Generating...</p>
                         </div>
                       </div>
                       
                       <img 
                         v-if="template.preview && template.preview !== ''"
                         :src="template.preview" 
                         :alt="template.name + ' preview'" 
                         class="w-full h-full object-cover"
                         @error="handleImageError"
                       />
                       <div 
                         v-else 
                         class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 cursor-pointer"
                         @click.stop="generateSingleTemplatePreview(template)"
                       >
                         <div class="text-center">
                           <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                             <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                           </svg>
                           <span class="text-xs">Click to generate preview</span>
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

          <!-- Public Designs Tab -->
          <div
            id="basic-tabs-4"
            role="tabpanel"
            :class="{ hidden: activeTab !== 'public' }"
          >
            <!-- Loading State -->
            <div v-if="isLoadingPublic" class="text-center text-gray-500 py-8">
              <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
              <p>Loading public templates...</p>
            </div>
            
            <!-- Error State -->
            <div v-else-if="publicError" class="text-center text-red-500 py-8">
              <p class="mb-2">{{ publicError }}</p>
              <button @click="fetchPublicDesigns" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Retry
              </button>
            </div>
            
            <!-- No Designs -->
            <div v-else-if="publicDesigns.length === 0" class="text-center text-gray-500 py-8">
              <p>No public designs available.</p>
            </div>
            
            <!-- Public Designs Grid -->
            <div v-else class="space-y-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-md font-medium text-gray-800 dark:text-neutral-200">
                  Select a Public Template
                </h3>
                <button
                  v-if="publicDesigns.some(d => !d.imageUrl)"
                  @click="generatePublicPreviews"
                  :disabled="generatingPublicPreviews"
                  class="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {{ generatingPublicPreviews ? 'Generating...' : 'Generate Missing Previews' }}
                </button>
              </div>
              
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
                    <div class="w-24 h-24 mb-3 rounded-lg overflow-hidden border-2 border-gray-200 relative">
                      <!-- Loading indicator -->
                      <div 
                        v-if="generatingPreviewFor === design.id"
                        class="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10"
                      >
                        <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                      
                      <img 
                        v-if="design.imageUrl && design.imageUrl !== ''"
                        :src="design.imageUrl" 
                        :alt="design.name + ' preview'" 
                        class="w-full h-full object-cover"
                        @error="handleImageError"
                      />
                      <div 
                        v-else 
                        class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 cursor-pointer"
                        @click.stop="generateSingleDesignPreview(design)"
                      >
                        <div class="text-center">
                          <svg class="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                          </svg>
                          <span class="text-xs">Generate</span>
                        </div>
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
          </div>
        </div>
      </div>
      <!-- End Col -->
      <div v-if="activeTab !== 'public' && activeTab !== 'templates' && activeTab !== 'pre-defined'" class="mt-10 text-right">
        <BaseButton @click="handleSubmit"> Submit </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPublicDesigns, saveDesign } from '@/api/designs.js'
import { useRouter } from 'vue-router'
import InputBox from '@/components/molecules/InputBox.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { createTemplate, getAllTemplates, updateTemplate } from '@/api/templates.js'
import { importTemplate, createDesignFromTemplate } from '@/services/templateService.js'
import { generateDesignPreview, generateTemplatePreview } from '@/services/generate-canvas-previews.js'
import JsonResumeForm from './JsonResumeForm.vue'

// Reactive state for form data
const name = ref('')
const selectedSize = ref('a4')
const customWidth = ref(0)
const customHeight = ref(0)
const activeTab = ref('empty')
const publicDesigns = ref([])
const isLoadingPublic = ref(false)
const publicError = ref(null)
const userTemplates = ref([])
const isLoadingTemplates = ref(false)
const templatesError = ref(null)
const router = useRouter()
const fileInput = ref(null)
const generatingPreviewFor = ref(null)
const generatingPublicPreviews = ref(false)

// Predefined canvas sizes
const canvasSizes = [
  { id: 'a4', label: 'A4 (210 x 297 mm)', width: 595, height: 842 },
  { id: 'visit-card', label: 'Visit Card (85 x 55 mm)', width: 241, height: 156 },
  { id: 'instagram-post', label: 'Instagram Post (1080 x 1080 px)', width: 1080, height: 1080 },
  { id: 'facebook-post', label: 'Facebook Post (1200 x 630 px)', width: 1200, height: 630 },
  { id: 'invitation', label: 'Invitation (5 x 7 in)', width: 360, height: 504 },
  { id: 'youtube-thumbnail', label: 'YouTube Thumbnail (1280 x 720 px)', width: 1280, height: 720 },
  { id: 'custom', label: 'Custom Size', width: 0, height: 0 },
]

function handleSubmit() {
  if (activeTab.value === 'empty') {
    let width, height
    if (selectedSize.value === 'custom') {
      width = customWidth.value
      height = customHeight.value
    } else {
      const size = canvasSizes.find(s => s.id === selectedSize.value)
      width = size?.width || 0
      height = size?.height || 0
    }
    router.push({ path: '/create', query: { width, height, name: name.value } })
    return
  }
}

// Generate preview for a single template
async function generateSingleTemplatePreview(template) {
  generatingPreviewFor.value = template.id
  
  try {
    const previewDataUrl = generateTemplatePreview(template, 400, 300)
    
    if (previewDataUrl) {
      // Update template with preview
      await updateTemplate(template.id, { preview: previewDataUrl })
      template.preview = previewDataUrl
      console.log(`✓ Preview generated for template: ${template.name}`)
    }
  } catch (error) {
    console.error(`Error generating preview for template ${template.name}:`, error)
    alert('Failed to generate preview. Please try again.')
  } finally {
    generatingPreviewFor.value = null
  }
}

// Generate preview for a single design
async function generateSingleDesignPreview(design) {
  generatingPreviewFor.value = design.id
  
  try {
    const previewDataUrl = generateDesignPreview(design.data, 400, 300)
    
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
      console.log(`✓ Preview generated for design: ${design.name}`)
    }
  } catch (error) {
    console.error(`Error generating preview for design ${design.name}:`, error)
    alert('Failed to generate preview. Please try again.')
  } finally {
    generatingPreviewFor.value = null
  }
}

// Generate previews for all public designs without previews
async function generatePublicPreviews() {
  const designsWithoutPreviews = publicDesigns.value.filter(d => !d.imageUrl)
  
  if (designsWithoutPreviews.length === 0) {
    alert('All designs already have previews!')
    return
  }

  generatingPublicPreviews.value = true
  
  try {
    for (const design of designsWithoutPreviews) {
      await generateSingleDesignPreview(design)
      // Add a small delay
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    alert('Preview generation completed!')
  } catch (error) {
    console.error('Error in batch preview generation:', error)
    alert('Some previews failed to generate.')
  } finally {
    generatingPublicPreviews.value = false
  }
}

// Function to copy a public design for the current user
async function copyDesign(design) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      alert('Please log in to use this template');
      return;
    }
    
    // Create a copy of the design for the current user
    const copyData = {
      name: `Copy of ${design.name}`,
      data: design.data,
      userId: user.id,
      public: true
    };
    
    const response = await saveDesign(copyData);
    if (response && response.data && response.data.id) {
      // Navigate to the editor with the new copy
      router.push(`/create/${response.data.id}`);
    }
  } catch (error) {
    console.error('Failed to copy design:', error);
    alert('Failed to copy design. Please try again.');
  }
}

// Fetch public designs with auto-preview generation
async function fetchPublicDesigns() {
  try {
    isLoadingPublic.value = true
    publicError.value = null
    const designs = await getPublicDesigns()
    publicDesigns.value = designs
  } catch (error) {
    console.error('Failed to fetch public designs:', error)
    publicError.value = 'Failed to load public designs. Please try again.'
    publicDesigns.value = []
  } finally {
    isLoadingPublic.value = false
  }
}

// Fetch user templates
async function fetchUserTemplates() {
  try {
    isLoadingTemplates.value = true
    templatesError.value = null
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      userTemplates.value = []
      return
    }
    const allTemplates = await getAllTemplates()
    userTemplates.value = allTemplates.filter(template => 
      template.public === true || (template.user && template.user.id === user.id)
    )
  } catch (error) {
    console.error('Failed to fetch user templates:', error)
    templatesError.value = 'Failed to load templates. Please try again.'
    userTemplates.value = []
  } finally {
    isLoadingTemplates.value = false
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

function triggerImport() {
  fileInput.value?.click()
}

async function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const jsonData = JSON.parse(text)
    
    // Process the imported data as a template
    const templateData = importTemplate({
      name: jsonData.name || file.name.replace('.json', ''),
      description: jsonData.description || 'Imported professional template',
      category: 'professional',
      type: 'design',
      theme: jsonData.theme || '',
      content: {
        polotnoElements: jsonData.pages?.[0]?.children || jsonData.polotnoElements || [],
        width: jsonData.pages?.[0]?.width || jsonData.width || 1024,
        height: jsonData.pages?.[0]?.height || jsonData.height || 1024,
        jsonResume: jsonData.jsonResume || null
      }
    })
    
    // Get current user
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      alert('Please log in to import templates')
      return
    }
    
    // Add user ID to template data
    templateData.userId = user.id
    
    // Create the template
    const createdTemplate = await createTemplate(templateData)
    
    // Generate preview for the new template
    if (createdTemplate) {
      const previewDataUrl = generateTemplatePreview(createdTemplate, 400, 300)
      if (previewDataUrl) {
        await updateTemplate(createdTemplate.id, { preview: previewDataUrl })
      }
    }
    
    alert('Template imported successfully!')
    
    // Refresh templates list
    await fetchUserTemplates()
    
    // Reset file input
    event.target.value = ''
  } catch (error) {
    console.error('Import failed:', error)
    alert('Failed to import template. Please check the file format.')
  }
}

// Function to use a template
async function useTemplate(template) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      alert('Please log in to use this template')
      return
    }
    
    // Create design data from template using the service function
    const designData = createDesignFromTemplate(template, {
      name: `Design from ${template.name}`
    })
    
    // Save the new design with proper structure
    const saveData = {
      name: designData.name,
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
      public: true
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

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  fetchPublicDesigns()
  fetchUserTemplates()
})
</script>