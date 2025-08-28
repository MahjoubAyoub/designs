<script setup>
import InputBox from '@/components/molecules/InputBox.vue'

const newPassword = defineModel('newPassword')

const emit = defineEmits(['submit'])

const handleSubmit = () => {
  if (newPassword.value) {
    emit('submit', newPassword.value)
  }
}
</script>

<template>
  <div class="w-full max-w-md mx-auto py-80 px-40">
    <div
      class="mt-7 bg-white border border-gray-200 rounded-xl shadow-2xs dark:bg-neutral-900 dark:border-neutral-700"
    >
      <div class="p-4 sm:p-7">
        <div class="text-center">
          <h1 class="block text-2xl font-bold text-gray-800">Set New Password</h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">
            Choose a strong password.
            <a
              class="text-blue-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium dark:text-blue-500"
              href="login"
            >
              Back to login
            </a>
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 mt-10">
          <InputBox
            id="password_box"
            label="New Password"
            placeholder="Enter new password"
            type="password"
            v-model="newPassword"
          />

          <BaseButton type="submit" class="w-full py-10"> Set Password </BaseButton>
        </form>
      </div>
    </div>
  </div>
</template>
