<script setup>
import { ref, onMounted } from 'vue'
import { getPublicDesigns } from '@/api/designs.js'
import { useRouter } from 'vue-router'
import InputBox from '@/components/molecules/InputBox.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'

// Reactive state for form data
const name = ref('')
const selectedSize = ref('a4')
const selectedTemplate = ref('cv')
const customWidth = ref(0)
const customHeight = ref(0)
const activeTab = ref('empty')
const publicDesigns = ref([])
const router = useRouter()

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

// Predefined templates
const templates = [
  { id: 'cv', label: 'Curriculum Vitae', width: 595, height: 842, preview: 'CV Preview' },
  { id: 'visit-card', label: 'Visit Card', width: 241, height: 156, preview: 'Visit Card Preview' },
  {
    id: 'powerpoint',
    label: 'PowerPoint Presentation',
    width: 960,
    height: 540,
    preview: 'PowerPoint Preview',
  },
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
  // You can add logic for other tabs (pre-defined, public) here
}

onMounted(async () => {
  publicDesigns.value = await getPublicDesigns();
})
</script>

<template>
  <!-- Card -->
  <div class="bg-white rounded-xl shadow-xs p-4 sm:p-7">
    <form @submit.prevent="handleSubmit">
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
              class="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-10 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600 active"
              id="basic-tabs-item-1"
              data-hs-tab="#basic-tabs-1"
              role="tab"
            >
              Empty
            </button>
            <button
              type="button"
              class="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-10 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              id="basic-tabs-item-2"
              data-hs-tab="#basic-tabs-2"
              role="tab"
            >
              Pre-defined
            </button>
            <button
              type="button"
              class="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-10 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              id="basic-tabs-item-3"
              data-hs-tab="#basic-tabs-3"
              role="tab"
            >
              Public
            </button>
          </nav>
        </div>

        <div class="mt-3">
          <div
            id="basic-tabs-1"
            role="tabpanel"
            aria-labelledby="basic-tabs-item-1"
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
          <div
            id="basic-tabs-2"
            role="tabpanel"
            aria-labelledby="basic-tabs-item-2"
            :class="{ hidden: activeTab !== 'pre-defined' }"
          >
            <div class="space-y-4">
              <h3 class="text-md font-medium text-gray-800 dark:text-neutral-200">
                Select Pre-defined Template
              </h3>
              <div class="grid sm:grid-cols-3 gap-4">
                <label
                  v-for="template in templates"
                  :key="template.id"
                  class="relative block cursor-pointer rounded-lg border border-gray-200 p-4 hover:border-blue-500"
                  :class="{ 'border-blue-500 bg-blue-50': selectedTemplate === template.id }"
                >
                  <BaseInput
                    :id="template.id"
                    type="radio"
                    v-model="selectedTemplate"
                    :value="template.id"
                    class="absolute opacity-0"
                  />
                  <div class="flex flex-col items-center">
                    <div
                      class="w-24 h-24 bg-gray-100 mb-2 flex items-center justify-center text-xs text-gray-500"
                      :style="{
                        aspectRatio: template.width / template.height,
                        maxWidth: '100px',
                        maxHeight: '100px',
                      }"
                    >
                      {{ template.preview }}
                    </div>
                    <span class="text-sm font-medium text-gray-800 dark:text-neutral-200">
                      {{ template.label }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ template.width }} x {{ template.height }}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div
            id="basic-tabs-3"
            role="tabpanel"
            aria-labelledby="basic-tabs-item-3"
            :class="{ hidden: activeTab !== 'public' }"
          >
            <div v-if="publicDesigns.length === 0" class="text-gray-500">No public designs available.</div>
            <div v-else class="grid sm:grid-cols-3 gap-4">
              <div v-for="design in publicDesigns" :key="design.id" class="border rounded-lg p-4 flex flex-col items-center">
                <img :src="design.imageUrl" alt="Preview" class="w-24 h-24 object-cover mb-2 rounded" />
                <div class="font-semibold">{{ design.name }}</div>
                <div class="text-xs text-gray-500 mb-2">By User {{ design.user?.id || 'Unknown' }}</div>
                <router-link :to="`/create/${design.id}`" class="bg-blue-600 text-white px-3 py-1 rounded">Open</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- End Col -->
      <div class="mt-10 text-right">
        <BaseButton type="submit"> Submit </BaseButton>
      </div>
    </form>
  </div>
</template>
