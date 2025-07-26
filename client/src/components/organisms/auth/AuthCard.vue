<script setup>
import { computed } from 'vue'
import Login from '@/components/molecules/LoginModal.vue'
import Signup from '@/components/molecules/SignupModal.vue'
import ForgetPassword from '@/components/molecules/ForgetPasswordModal.vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'login', // options: login | signup | reset
  },
})

const componentMap = {
  login: Login,
  signup: Signup,
  reset: ForgetPassword,
}

const titleMap = {
  login: 'Sign in',
  signup: 'Sign up',
  reset: 'Reset Password',
}

const currentComponent = computed(() => componentMap[props.mode] || Login)
const currentTitle = computed(() => titleMap[props.mode] || 'Sign in')
</script>

<template>
  <div class="w-full max-w-md mx-auto p-6">
    <div
      class="mt-7 bg-white border border-gray-200 rounded-xl shadow-2xs dark:bg-neutral-900 dark:border-neutral-700"
    >
      <div class="p-4 sm:p-7">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
            {{ currentTitle }}
          </h1>
        </div>

        <component :is="currentComponent" />
      </div>
    </div>
  </div>
</template>
