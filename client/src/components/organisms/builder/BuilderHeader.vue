<script setup>
import { ref, watch } from 'vue'
import BaseInput from '@/components/atoms/BaseInput.vue'

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  public: {
    type: Boolean,
    default: false,
  },
  onSave: Function
})


const emit = defineEmits(['update:name', 'update:public'])
const name = ref(props.name)
const isPublic = ref(props.public)

watch(() => props.name, val => { name.value = val })
watch(name, val => emit('update:name', val))
watch(() => props.public, val => { isPublic.value = val })
watch(isPublic, val => emit('update:public', val))

function handleSave() {
  emit('update:name', name.value);
  emit('update:public', isPublic.value);
  if (props.onSave) props.onSave();
}
</script>

<template>
  <header class="bg-white shadow-sm p-1 flex justify-between items-center">
    <router-link
      class="flex items-center mx-2 text-gray-600 hover:text-blue-600 focus:outline-none"
      to="/dashboard"
      >Go Back</router-link
    >
    <BaseInput v-model="name" type="text" placeholder="Design Name" class="!w-auto mr-auto" />
    <div class="flex items-center mx-4">
      <label class="mr-2 font-medium">{{ isPublic ? 'Public' : 'Private' }}</label>
      <input type="checkbox" v-model="isPublic" class="form-checkbox h-5 w-5 text-blue-600" />
    </div>
    <baseButton class="bg-blue-600 text-white px-4 py-2 rounded-lg" @click="handleSave"> Save Design </baseButton>
  </header>
</template>
