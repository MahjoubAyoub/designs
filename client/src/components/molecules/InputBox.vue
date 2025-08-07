<script setup>
defineProps({
  type: { type: String, default: 'text' },
  label: String,
  id: String,
  placeholder: String,
  inputClass: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
})
const inputModel = defineModel()
</script>

<template>
  <div class="">
    <label :for="id" class="block text-sm font-medium text-gray-700 mb-10">
      {{ label }}
    </label>
    <BaseInput
      :id="id"
      :type="type"
      :placeholder="placeholder"
      v-model="inputModel"
      :class="inputClass"
      :disabled="disabled"
      :required="required"
    />
  </div>
</template>

<script>
import BaseInput from '@/components/atoms/BaseInput.vue'
export default {
  components: { BaseInput },
}
</script>
