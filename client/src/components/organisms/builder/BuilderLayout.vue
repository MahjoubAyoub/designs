<template>
  <BuilderHeader
    v-model:name="designName"
    :public="isPublic.value"
    :onSave="saveDesignHandler"
    @update:name="val => designName.value = val"
    @update:public="handlePublicChange"
  />
  <div ref="container" class="w-full h-screen" />
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { renderPolotnoEditor } from './renderPolotnoEditor.js'
import { saveDesign, getDesignById } from '@/api/designs.js'
import BuilderHeader from './BuilderHeader.vue'

const container = ref(null)
const route = useRoute()
const designName = ref('Untitled Design')
const isPublic = ref(false)
// If a name is provided in the query (from NewTemplates), use it as initial value
if (route.query.name) {
  designName.value = route.query.name;
}
// If public is provided in the query, use it
if (route.query.public !== undefined) {
  isPublic.value = route.query.public === 'true' || route.query.public === true;
}
// Handle public/private switcher
import { setDesignPublic } from '@/api/designs.js'
async function handlePublicChange(val) {
  isPublic.value = val;
  if (designId) {
    try {
      await setDesignPublic(designId, val);
    } catch (e) {
      alert('Failed to update public status');
    }
  }
}

let polotnoStore = null
let designId = null // Track the current design id for updates

// Save Design button handler: sends JSON to backend /api/designs/save
async function saveDesignHandler() {
  if (!polotnoStore) return;
  console.log('Saving design with name:', designName.value);
  const json = polotnoStore.toJSON();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const payload = {
    id: designId,
    name: designName.value,
    data: json,
    userId: user.id,
  };
  const res = await saveDesign(payload);
  if (res && res.data && res.data.id) {
    designId = res.data.id;
  }
  alert('Design saved!');
}

// Autosave handler: also uses /api/designs/save
async function autoSaveDesign(json) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const payload = {
    id: designId,
    name: designName.value,
    data: json,
    userId: user.id,
  };
  const res = await saveDesign(payload);
  if (res && res.data && res.data.id) {
    designId = res.data.id;
  }
}


onMounted(async () => {
  const width = parseInt(route.query.width) || 1024
  const height = parseInt(route.query.height) || 1024
  polotnoStore = await renderPolotnoEditor(container.value, width, height, { onAutoSave: autoSaveDesign })

  // If there is a design id in the route, fetch and load it
  if (route.params.id) {
    try {
      const design = await getDesignById(route.params.id);
      if (design && design.data) {
        polotnoStore.loadJSON(design.data);
        designName.value = design.name || 'Untitled Design';
        isPublic.value = !!design.public;
        designId = design.id;
      }
    } catch (e) {
      console.error('Failed to load design:', e);
    }
  }
})
</script>
