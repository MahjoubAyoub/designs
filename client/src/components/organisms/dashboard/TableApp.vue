<template>
  <div class="container mx-auto p-4 space-y-4 bg-white">
    <!-- Search and Button -->
    <div class="bg-white rounded-t-lg p-4 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <span class="text-gray-700">Search value:</span>
        <input
          type="text"
          v-model="searchValue"
          class="border border-gray-300 rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <BaseButton
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        href="/dashboard/templates"
      >
        Create
      </BaseButton>
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
        header-class-name="bg-gray-800 text-white font-semibold text-sm sticky top-0 z-10"
        body-row-class-name="even:bg-gray-100 odd:bg-white hover:bg-gray-200"
        body-item-class-name="p-3 border-b border-gray-300"
      >
        <!-- Preview image cell, clickable -->
        <template #item-preview="{ preview, id }">
          <router-link :to="`/create/${id}`">
            <img :src="preview" alt="Design preview" style="width:80px; height:60px; object-fit:cover; border-radius:6px; border:1px solid #ccc; cursor:pointer;" />
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

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import EasyDataTable from 'vue3-easy-data-table'
import { Header, Item, FilterOption } from 'vue3-easy-data-table'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'

import { getAllDesigns, deleteDesign } from '@/api/designs.js'

const headers: Header[] = [
  { text: 'Design Name', value: 'name' },
  { text: 'Preview', value: 'preview' },
  { text: 'Creation Date', value: 'dateCreation', sortable: true },
  { text: 'Update Date', value: 'dateModification', sortable: true },
  { text: 'Delete', value: 'delete' },
]

const items = ref<Item[]>([])

async function fetchDesigns() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    const designs = await getAllDesigns(userId);
    items.value = designs.map(d => ({
      id: d.id,
      name: d.name,
      preview: d.imageUrl || '',
      dateCreation: d.dateCreation ? d.dateCreation.split('T')[0] : '',
      dateModification: d.dateModification ? d.dateModification.split('T')[0] : '',
      delete: d.id,
    }))
  } catch (e) {
    items.value = []
  }
}

onMounted(fetchDesigns)

async function handleDelete(id) {
  if (confirm('Are you sure you want to delete this design?')) {
    await deleteDesign(id)
    fetchDesigns()
  }
}
// Search and filter
const searchValue = ref('')
const nameCriteria = ref('')
const creationCriteria = ref('')
const updateCriteria = ref('')
const showNameFilter = ref(false)
const showCreationFilter = ref(false)
const showUpdateFilter = ref(false)

const filterOptions = computed((): FilterOption[] => {
  const filterOptionsArray: FilterOption[] = []

  // Name filter
  if (nameCriteria.value) {
    filterOptionsArray.push({
      field: 'name',
      criteria: nameCriteria.value,
      comparison: (value, criteria): boolean =>
        value != null &&
        criteria != null &&
        typeof value === 'string' &&
        value.toLowerCase().includes(criteria.toLowerCase()),
    })
  }

  // Creation date filter
  if (creationCriteria.value) {
    filterOptionsArray.push({
      field: 'creation',
      criteria: creationCriteria.value,
      comparison: (value, criteria): boolean => value === criteria,
    })
  }

  // Update date filter
  if (updateCriteria.value) {
    filterOptionsArray.push({
      field: 'update',
      criteria: updateCriteria.value,
      comparison: (value, criteria): boolean => value === criteria,
    })
  }

  return filterOptionsArray
})
</script>
