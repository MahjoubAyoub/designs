<script setup>
import { ref, watch } from 'vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

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
  <header class="bg-white shadow-sm flex justify-between items-center gap-15 border-b border-gray-300">
    <BaseButton class="border-0 border-r px-15 py-15 rounded-none" href="/dashboard/designs">
      <BaseIcon class="text-black" name="ChevronLeft" size="25" />
    </BaseButton>
    <BaseInput v-model="name" type="text" placeholder="Design Name" class="!w-auto mr-auto border-0 border-b rounded-none py-5 px-5 focus:!ring-0 focus:!outline-0" />
    <div class="flex items-center gap-15">
      <label for="hs-public" class="text-sm text-gray-500">{{ isPublic ? 'Public' : 'Private' }}</label>
      <label for="hs-public" class="relative inline-block w-[36px] h-[20px] cursor-pointer">
        <input type="checkbox" id="hs-public" v-model="isPublic" class="peer sr-only" checked="">
        <span class="absolute inset-0 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out peer-checked:bg-blue-600 dark:bg-neutral-700 dark:peer-checked:bg-blue-500 peer-disabled:opacity-50 peer-disabled:pointer-events-none"></span>
        <span class="absolute top-1/2 start-0.5 -translate-y-1/2 size-15 bg-white rounded-full shadow-xs transition-transform duration-200 ease-in-out peer-checked:translate-x-full"></span>
      </label>
    </div>
    <BaseButton class="border-0 border-l px-15 py-15 rounded-none" @click="handleSave">
      <BaseIcon name="Save" size="20" />
    </BaseButton>
  </header>
</template>
