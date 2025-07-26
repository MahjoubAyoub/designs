<template>
  <div ref="container" class="w-full h-screen" />
</template>

<script setup>
import { onMounted, ref } from 'vue'

const container = ref(null)

onMounted(async () => {
  await import('@blueprintjs/core/lib/css/blueprint.css')

  const ReactDOM = await import('react-dom/client')
  const PolotnoEditor = (await import('./BuilderEditor.jsx')).default

  const root = ReactDOM.createRoot(container.value)
  root.render(PolotnoEditor())
})
</script>
