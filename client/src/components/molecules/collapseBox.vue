<script setup>
defineProps({
  title: String,
})
</script>

<template>
  <div class="hs-accordion hs-accordion-active:bg-gray-100 rounded-xl p-6">
    <button
      class="hs-accordion-toggle group pb-3 inline-flex items-center justify-between gap-x-3 w-full md:text-lg font-semibold text-start text-gray-800 rounded-lg transition"
      aria-expanded="false"
    >
      {{ title }}
      <BaseIcon name="ChevronDown" class="hs-accordion-active:rotate-180"></BaseIcon>
    </button>
    <div
      class="hs-accordion-content hidden w-full overflow-hidden transition-[height] duration-300"
      role="region"
    >
      <p class="text-gray-800">
        <slot />
      </p>
    </div>
  </div>
</template>

<script></script>
