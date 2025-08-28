<script setup>
import { ref } from 'vue'
import axios from 'axios'
import ForgetPasswordModal from '@/components/molecules/ForgetPasswordModal.vue'
import VerifyCodeModal from '@/components/molecules/VerifyCodeModal.vue'
import NewPasswordModal from '@/components/molecules/NewPasswordModal.vue'

const API_BASE = 'http://localhost:3000/auth'

const step = ref(1)
const email = ref('')
const code = ref('') // Add this missing variable
const newPassword = ref('') // Add this missing variable
const resetToken = ref('')

const handleForgetSubmit = async (submittedEmail) => {
  email.value = submittedEmail
  try {
    console.log('Sending request with email:', email.value) // Debug log
    const response = await axios.post(`${API_BASE}/requestPasswordReset`, {
      email: email.value
    })
    console.log('Success response:', response.data) // Debug log
    step.value = 2
  } catch (err) {
    console.error('Error requesting reset:', err)
    console.error('Error response:', err.response?.data) // Show actual error
    console.error('Error status:', err.response?.status) // Show status code

    // Show user-friendly error message
    const errorMessage = err.response?.data?.error || 'Failed to send reset code. Please try again.'
    alert(errorMessage)
  }
}

const handleVerifySubmit = async (code) => {
  try {
    console.log('Verifying code:', code, 'for email:', email.value) // Debug log
    const res = await axios.post(`${API_BASE}/verifyResetCode`, {
      email: email.value,
      code: code.toString() // Ensure code is string
    })
    console.log('Verify success:', res.data) // Debug log
    console.log('Token received:', res.data.token) // Debug log

    if (res.data.token) {
      resetToken.value = res.data.token
      step.value = 3
      console.log('Moving to step 3, resetToken set:', resetToken.value)
    } else {
      throw new Error('No token received from server')
    }
  } catch (err) {
    console.error('Error verifying code:', err)
    console.error('Error response:', err.response?.data) // Show actual error
    console.error('Error status:', err.response?.status) // Show status code
    const errorMessage = err.response?.data?.error || 'Invalid or expired code. Please try again.'
    alert(errorMessage)
  }
}

const handleNewPasswordSubmit = async (newPassword) => {
  try {
    console.log('Resetting password with token:', resetToken.value) // Debug log
    await axios.post(`${API_BASE}/resetPassword`, {
      token: resetToken.value,
      newPassword
    })
    alert('Password reset successfully. Redirecting to login.')
    window.location.href = '/login'
  } catch (err) {
    console.error('Error resetting password:', err)
    console.error('Error response:', err.response?.data) // Show actual error
    const errorMessage = err.response?.data?.error || 'Failed to reset password. Please try again.'
    alert(errorMessage)
  }
}
</script>

<template>
  <div>
    <ForgetPasswordModal v-if="step === 1" v-model:email="email" @submit="handleForgetSubmit" />
    <VerifyCodeModal v-if="step === 2" v-model:code="code" @submit="handleVerifySubmit" />
    <NewPasswordModal v-if="step === 3" v-model:newPassword="newPassword" @submit="handleNewPasswordSubmit" />
  </div>
</template>
