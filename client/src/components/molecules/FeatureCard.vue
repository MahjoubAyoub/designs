<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  text: String,
  image: String,
  alt: String,
  reverse: Boolean,
  items: Array,
})
const resolvedImage = computed(() => {
  try {
    return new URL(props.image, import.meta.url).href
  } catch {
    return props.image // fallback if it's already a valid URL
  }
})
</script>

<template>
  <div class="flex lg:items-center max-lg:flex-col gap-20 lg:gap-40" :class="{ 'md:flex-row-reverse': reverse }">
    <!-- Image -->
    <div class="lg:basis-2/3">
      <img class="rounded-xl" :src="resolvedImage" alt="Features Image" />
    </div>
    <!-- Content -->
    <div class="lg:basis-1/3">
      <div class="space-y-6 sm:space-y-8">
        <!-- Title -->
        <div class="space-y-2 md:space-y-4">
          <h2 class="font-bold text-3xl lg:text-4xl text-gray-800 dark:text-neutral-200">
            {{ title }}
          </h2>
          <p class="text-gray-500 dark:text-neutral-500">
            {{ text }}
          </p>
        </div>
        <!-- End Title -->

        <!-- List -->
        <ul class="space-y-2 sm:space-y-4">
          <li class="flex gap-x-3 items-center" v-for="(item, index) in items" :key="index">
            <span
              class="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-800/30 dark:text-blue-500"
            >
              <svg
                class="shrink-0 size-3.5"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <div class="grow">
              <span class="text-sm sm:text-base text-gray-500 dark:text-neutral-500">
                {{ item }}
              </span>
            </div>
          </li>
        </ul>
        <!-- End List -->
      </div>
    </div>
    <!-- End Col -->
  </div>
</template>
