<script setup>
import InputBox from '@/components/molecules/InputBox.vue'

const code = defineModel('code')

const emit = defineEmits(['submit'])

const handleSubmit = () => {
  console.log('VerifyCodeModal: submitting code:', code.value) // Add this debug log
  if (code.value) {
    emit('submit', code.value)
  } else {
    console.log('VerifyCodeModal: No code entered') // Add this debug log
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
          <h1 class="block text-2xl font-bold text-gray-800">Verify Code</h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">
            Enter the 6-digit code sent to your email.
            <a
              class="text-blue-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium dark:text-blue-500"
              href="forgot-password"
            >
              Resend code
            </a>
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 mt-10">
          <InputBox
            id="code_box"
            label="6-Digit Code"
            placeholder="Enter code"
            v-model="code"
          />

          <BaseButton type="submit" class="w-full py-10"> Verify </BaseButton>
        </form>
      </div>
    </div>
  </div>
</template>
