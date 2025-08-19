<template>
  <div class="mx-auto p-7 space-y-4 bg-white rounded-xl">
    <h2 class="text-3xl font-bold text-gray-800 pb-20 mb-20 border-b border-gray-200">
      Designs
    </h2>
    <!-- Search and Button -->
    <div class="bg-white rounded-t-lg flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <input
          type="text"
          v-model="searchValue"
          placeholder="Search..."
          class="border text-14 border-gray-300 rounded-full px-15 py-5 h-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div class="flex space-x-2">

        <BaseButton
          class="bg-blue-600 text-white text-14 px-15 py-10 rounded gap-10"
          href="/dashboard/templates"
        >
          <BaseIcon size="18" name="Plus" />
          Create
        </BaseButton>
      </div>
    </div>


    <!-- Data Table -->
    <div class="overflow-x-auto">
      <EasyDataTable
        :headers="headers"
        :items="items"
        :search-value="searchValue"
        :filter-options="filterOptions"
        buttons-pagination
        :rows-per-page="10"
        table-class-name="w-full border-collapse min-w-[600px]"
        header-class-name="bg-gray-800 text-white font-semibold text-sm sticky top-0"
        body-row-class-name="even:bg-gray-100 odd:bg-white hover:bg-gray-200"
        body-item-class-name="p-3 border-b border-gray-300"
      >
        <!-- Preview image cell, clickable -->
        <template #item-preview="{ preview, id }">
          <router-link :to="`/create/${id}`">
            <div class="w-20 h-15 relative overflow-hidden rounded-md border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity">
              <img
                v-if="preview && preview !== ''"
                :src="preview"
                alt="Design preview"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <div
                v-else
                class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <div class="text-center">
                  <svg class="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-xs">No Preview</span>
                </div>
              </div>
            </div>
          </router-link>
        </template>

        <!-- Name cell, clickable -->
        <template #item-name="{ name, id }">
          <router-link :to="`/create/${id}`" class="text-blue-600 hover:underline cursor-pointer">{{ name }}</router-link>
        </template>

        <!-- Delete button cell -->
        <template #item-delete="{ delete: id }">
          <button @click="handleDelete(id)" class="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
        </template>
      </EasyDataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import EasyDataTable from 'vue3-easy-data-table'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { getAllDesigns, deleteDesign, saveDesign } from '@/api/designs.js'
import { generatePolotnoPreviewById } from '@/services/polotnoPreviewService.js'

const headers = [
  { text: 'Design Name', value: 'name' },
  { text: 'Preview', value: 'preview' },
  { text: 'Creation Date', value: 'dateCreation', sortable: true },
  { text: 'Update Date', value: 'dateModification', sortable: true },
  { text: 'Delete', value: 'delete' },
]

const designs = ref([])
const items = ref([])
const generatingPreviews = ref(false)
const previewProgress = ref({ current: 0, total: 0 })

async function fetchDesigns() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user.id
    const fetchedDesigns = await getAllDesigns(userId)

    designs.value = fetchedDesigns
    items.value = fetchedDesigns.map(d => ({
      id: d.id,
      name: d.name,
      preview: d.imageUrl || '',
      dateCreation: d.dateCreation ? d.dateCreation.split('T')[0] : '',
      dateModification: d.dateModification ? d.dateModification.split('T')[0] : '',
      delete: d.id,
    }))
  } catch (e) {
    console.error('Error fetching designs:', e)
    designs.value = []
    items.value = []
  }
}

async function generateMissingPreviews() {
  const designsWithoutPreviews = designs.value.filter(d => !d.imageUrl)

  if (designsWithoutPreviews.length === 0) {
    return
  }

  generatingPreviews.value = true
  previewProgress.value = { current: 0, total: designsWithoutPreviews.length }

  try {
    for (const design of designsWithoutPreviews) {
      try {
        console.log(`Generating preview for design: ${design.name}`)

        // Generate preview using the Vite service with design ID
        const previewDataUrl = await generatePolotnoPreviewById(design.id, 400, 300)

        if (previewDataUrl) {
          // Update the design with the new preview
          const updateData = {
            id: design.id,
            name: design.name,
            public: design.public,
            data: design.data,
            imageUrl: previewDataUrl,
            userId: design.userId
          }

          await saveDesign(updateData)

          // Update local data
          design.imageUrl = previewDataUrl
          const itemIndex = items.value.findIndex(item => item.id === design.id)
          if (itemIndex !== -1) {
            items.value[itemIndex].preview = previewDataUrl
          }

          console.log(`✓ Preview generated for: ${design.name}`)
        } else {
          console.log(`⚠ Failed to generate preview for: ${design.name}`)
        }
      } catch (error) {
        console.error(`Error generating preview for ${design.name}:`, error)
      }

      previewProgress.value.current++

      // Add a small delay to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  } catch (error) {
    console.error('Error in batch preview generation:', error)
    alert('Some previews failed to generate. Check console for details.')
  } finally {
    generatingPreviews.value = false
    previewProgress.value = { current: 0, total: 0 }
  }
}

async function handleDelete(id) {
    try {
      await deleteDesign(id)
      await fetchDesigns() // Refresh the list
    } catch (error) {
      console.error('Error deleting design:', error)
      alert('Failed to delete design. Please try again.')
    }
}

// Handle image loading errors
function handleImageError(event) {
  const img = event.target
  img.style.display = 'none'
  const fallback = img.parentElement.querySelector('.text-center')
  if (fallback) fallback.style.display = 'flex'
}

// Search and filter
const searchValue = ref('')
const nameCriteria = ref('')
const creationCriteria = ref('')
const updateCriteria = ref('')

const filterOptions = computed(() => {
  const filterOptionsArray = []

  // Name filter
  if (nameCriteria.value) {
    filterOptionsArray.push({
      field: 'name',
      criteria: nameCriteria.value,
      comparison: (value, criteria) =>
        value != null &&
        criteria != null &&
        typeof value === 'string' &&
        value.toLowerCase().includes(criteria.toLowerCase()),
    })
  }

  // Creation date filter
  if (creationCriteria.value) {
    filterOptionsArray.push({
      field: 'dateCreation',
      criteria: creationCriteria.value,
      comparison: (value, criteria) => value === criteria,
    })
  }

  // Update date filter
  if (updateCriteria.value) {
    filterOptionsArray.push({
      field: 'dateModification',
      criteria: updateCriteria.value,
      comparison: (value, criteria) => value === criteria,
    })
  }

  return filterOptionsArray
})

onMounted(async () => {
  await fetchDesigns();
  await generateMissingPreviews();
<<<<<<< Updated upstream
=======

  // Run debug to understand preview generation issues
  setTimeout(() => {
    console.log('🔧 Running preview generation debug...');
    debugPreviewGeneration();
  }, 2000);
>>>>>>> Stashed changes
})
</script>
