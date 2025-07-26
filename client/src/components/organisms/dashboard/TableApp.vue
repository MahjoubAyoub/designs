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
        <!-- Filter for Name -->
        <template #header-name="header">
          <div class="filter-column flex items-center space-x-1">
            <BaseIcon name="ListFilter" />
            <span>{{ header.text }}</span>
            <div
              v-if="showNameFilter"
              class="filter-menu absolute bg-white border border-gray-300 rounded shadow-lg p-2 mt-8 z-20"
            >
              <input
                v-model="nameCriteria"
                class="border border-gray-300 rounded px-2 py-1 w-40"
                placeholder="Filter by name"
              />
            </div>
          </div>
        </template>

        <!-- Filter for Creation Date -->
        <template #header-creation="header">
          <div class="filter-column flex items-center space-x-1">
            <BaseIcon name="ListFilter" />
            <span>{{ header.text }}</span>
            <div
              v-if="showCreationFilter"
              class="filter-menu absolute bg-white border border-gray-300 rounded shadow-lg p-2 mt-8 z-20"
            >
              <input
                v-model="creationCriteria"
                type="date"
                class="border border-gray-300 rounded px-2 py-1 w-40"
              />
            </div>
          </div>
        </template>

        <!-- Filter for Update Date -->
        <template #header-update="header">
          <div class="filter-column flex items-center space-x-1">
            <BaseIcon name="ListFilter" />
            <span>{{ header.text }}</span>
            <div
              v-if="showUpdateFilter"
              class="filter-menu absolute bg-white border border-gray-300 rounded shadow-lg p-2 mt-8 z-20"
            >
              <input
                v-model="updateCriteria"
                type="date"
                class="border border-gray-300 rounded px-2 py-1 w-40"
              />
            </div>
          </div>
        </template>
      </EasyDataTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import EasyDataTable from 'vue3-easy-data-table'
import type { Header, Item, FilterOption } from 'vue3-easy-data-table'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'

// Table headers
const headers: Header[] = [
  { text: 'Designs', value: 'name' },
  { text: 'Preview', value: 'preview' },
  { text: 'Creation Date', value: 'creation', sortable: true },
  { text: 'Update Date', value: 'update', sortable: true },
  { text: 'Delete', value: 'delete' },
]

const items: Item[] = [
  {
    name: 'Design Test',
    preview: 'img',
    creation: '10-07-2025',
    update: '11-07-2025',
    delete: 'Button',
  },
  {
    name: 'Salem weld omi',
    preview: 'img',
    creation: '20-07-2025',
    update: '21-07-2025',
    delete: 'Button',
  },
]
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
