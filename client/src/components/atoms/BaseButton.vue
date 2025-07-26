<script setup>
defineProps({
  href: String,
  target: String,
  reverse: Boolean,
})
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :_target="target"
    :class="{ 'flex-row-reverse': reverse }"
    class="inline-flex items-center justify-center gap-5 text-14 font-medium py-5 px-10 rounded-lg border border-gray-300"
  >
    <slot />
  </component>
</template>
