<script setup>
import InputBox from '@/components/molecules/InputBox.vue'

const email = defineModel('email')
</script>

<template>
  <div class="w-full max-w-md mx-auto p-6">
    <div
      class="mt-7 bg-white border border-gray-200 rounded-xl shadow-2xs dark:bg-neutral-900 dark:border-neutral-700"
    >
      <div class="p-4 sm:p-7">
        <div class="text-center">
          <h1 class="block text-2xl font-bold text-gray-800">Forgot password?</h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">
            Remember your password?
            <a
              class="text-blue-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium dark:text-blue-500"
              href="login"
            >
              Sign in here
            </a>
          </p>
        </div>

        <div class="flex flex-col gap-4 mt-10">
          <InputBox
            id="email_box"
            label="Your Email Address"
            placeholder="Insert E-mail"
            v-model="email"
          />

          <BaseButton type="submit" class="w-full py-10"> Reset password </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
