<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/atoms/BaseButton.vue'
import InputBox from '@/components/molecules/InputBox.vue'
import { getUserById, updateProfile, changePassword, uploadProfilePhoto } from '@/api/users.js'

// Form data
const userProfile = ref({
  nom: '',
  email: '',
  photoProfil: '',
  phone: '',
  gender: 'male'
})

// Password change data
const passwordData = ref({
  currentPassword: '',
  newPassword: ''
})

// UI state
const isLoading = ref(false)
const isSaving = ref(false)
const isChangingPassword = ref(false)
const message = ref('')
const error = ref('')
const currentUser = ref(null)
const profilePhotoPreview = ref('')
const selectedPhoto = ref(null)

// Router instance
const router = useRouter()

// Handle authentication errors
function handleAuthError(error) {
  console.error('Authentication error:', error)
  // Clear user data from localStorage
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  // Redirect to login
  router.push('/auth/login')
}

// Get current user from localStorage
function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user
  } catch (error) {
    console.error('Error parsing user from localStorage:', error)
    return null
  }
}

// Load user profile
async function loadUserProfile() {
  try {
    isLoading.value = true
    error.value = ''

    const user = getCurrentUser()
    if (!user || !user.id) {
      error.value = 'User not found. Please log in again.'
      return
    }

    currentUser.value = user
    const profile = await getUserById(user.id)

    userProfile.value = {
      nom: profile.nom || '',
      email: profile.email || '',
      photoProfil: profile.photoProfil || '',
      phone: profile.phone || '',
      gender: profile.gender || 'male'
    }

    // Set profile photo preview - handle both Google photos and local uploads
    if (profile.photoProfil) {
      if (profile.photoProfil.startsWith('http')) {
        // Google profile photo or other external URL
        profilePhotoPreview.value = profile.photoProfil
        console.log('Using external profile photo URL:', profilePhotoPreview.value)
      } else {
        // Local uploaded photo
        profilePhotoPreview.value = `http://localhost:3000/uploads/${profile.photoProfil}`
        console.log('Using local profile photo URL:', profilePhotoPreview.value)
      }
    } else {
      console.log('No profile photo found in user data')
    }

  } catch (err) {
    if (err.message.includes('jwt expired') || err.message.includes('Unauthorized')) {
      handleAuthError(err)
      return
    }
    console.error('Failed to load user profile:', err)
    error.value = 'Failed to load profile information'
  } finally {
    isLoading.value = false
  }
}

// Handle photo selection
function handlePhotoSelect(event) {
  const file = event.target.files[0]
  if (file) {
    selectedPhoto.value = file
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      profilePhotoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Update profile
async function updateUserProfile() {
  try {
    isSaving.value = true
    error.value = ''
    message.value = ''

    if (!currentUser.value?.id) {
      error.value = 'User not found'
      return
    }

    // If photo is selected, upload it first
    if (selectedPhoto.value) {
      console.log('Uploading profile photo...')
      const photoResult = await uploadProfilePhoto(currentUser.value.id, selectedPhoto.value)
      console.log('Photo upload result:', photoResult)
      
      // Update the photo profile in the user profile data
      if (photoResult && photoResult.photoProfil) {
        userProfile.value.photoProfil = photoResult.photoProfil
        console.log('Updated user profile with new photo:', userProfile.value.photoProfil)
      } else {
        console.log('No photo profile in upload result')
      }
    }

    // Update profile data
    const profileUpdateData = {
      nom: userProfile.value.nom,
      email: userProfile.value.email,
      phone: userProfile.value.phone,
      gender: userProfile.value.gender
    }
    
    console.log('Updating profile with data:', profileUpdateData)
    const updatedProfile = await updateProfile(currentUser.value.id, profileUpdateData)

    // Update localStorage with all profile data including photo
    const updatedUser = { 
      ...currentUser.value, 
      ...updatedProfile,
      photoProfil: userProfile.value.photoProfil // Ensure photo is included
    }
    console.log('Updating localStorage with user data:', updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    // Verify the data was stored correctly
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    console.log('Verified localStorage user data:', storedUser)

    message.value = 'Profile updated successfully!'
    selectedPhoto.value = null

    // Emit custom event to notify other components about profile update
    window.dispatchEvent(new CustomEvent('profileUpdated'))

  } catch (err) {
    console.error('Failed to update profile:', err)
    error.value = err.message || 'Failed to update profile'
  } finally {
    isSaving.value = false
  }
}

// Change password
async function changeUserPassword() {
  try {
    isChangingPassword.value = true
    error.value = ''
    message.value = ''

    if (!passwordData.value.currentPassword || !passwordData.value.newPassword) {
      error.value = 'Please fill in both password fields'
      return
    }

    if (!currentUser.value?.id) {
      error.value = 'User not found'
      return
    }

    await changePassword(
      currentUser.value.id,
      passwordData.value.currentPassword,
      passwordData.value.newPassword
    )

    message.value = 'Password changed successfully!'
    passwordData.value = { currentPassword: '', newPassword: '' }

  } catch (err) {
    console.error('Failed to change password:', err)
    error.value = err.message || 'Failed to change password'
  } finally {
    isChangingPassword.value = false
  }
}

// Clear messages after a delay
function clearMessages() {
  setTimeout(() => {
    message.value = ''
    error.value = ''
  }, 5000)
}

// Watch for message changes to auto-clear them
setTimeout(() => {
  if (message.value || error.value) {
    clearMessages()
  }
}, 100)

onMounted(() => {
  loadUserProfile()
  
  // Check if there's already a profile photo in localStorage
  const user = getCurrentUser()
  if (user && user.photoProfil) {
    if (user.photoProfil.startsWith('http')) {
      // Google profile photo or other external URL
      profilePhotoPreview.value = user.photoProfil
    } else {
      // Local uploaded photo
      profilePhotoPreview.value = `http://localhost:3000/uploads/${user.photoProfil}`
    }
  }
})
</script>

<template>
  <!-- Card Section -->
  <div class="max-w-4xl px-4 py-10 sm:px-6 lg:px-8 mx-auto">
    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-gray-600">Loading profile...</p>
    </div>

    <!-- Error/Success messages -->
    <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>
    <div v-if="message" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
      {{ message }}
    </div>

    <!-- Card -->
    <div class="bg-white rounded-xl shadow-xs p-4 sm:p-7 dark:bg-neutral-800">
      <div class="mb-8">
        <h2 class="text-xl font-bold text-gray-800">Profile</h2>
      </div>

      <form @submit.prevent>
        <!-- Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-15">

          <!-- Avatar -->
          <div class="lg:col-span-3">
            <label class="inline-block text-sm text-gray-800 mt-2.5"> Profile photo </label>
            <div class="flex items-center gap-5">
              <img
                class="inline-block size-16 rounded-full ring-2 ring-white dark:ring-neutral-900"
                :src="profilePhotoPreview || 'https://preline.co/assets/img/160x160/img1.jpg'"
                alt="Avatar"
                @error="(e) => e.target.src = 'https://preline.co/assets/img/160x160/img1.jpg'"
              />
              <div class="flex gap-x-2">
                <div>
                  <BaseButton
                    type="button"
                    class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-50"
                    @click="() => $refs.photoInput.click()"
                  >
                    Upload photo
                  </BaseButton>
                  <input 
                    type="file" 
                    ref="photoInput" 
                    @change="handlePhotoSelect" 
                    accept="image/*"
                    style="display: none" 
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Name -->
          <div class="lg:col-span-3">
            <InputBox
              id="af-account-full-name"
              type="text"
              label="Full name"
              placeholder="Your Name"
              v-model="userProfile.nom"
              inputClass=""
            />
          </div>

          <!-- Email -->
          <div class="lg:col-span-3">
            <InputBox
              id="af-account-email"
              type="email"
              label="Email"
              placeholder="Your Email"
              v-model="userProfile.email"
            />
          </div>

          <!-- Phone -->
          <div class="lg:col-span-3">
            <InputBox
              id="af-account-phone"
              type="text"
              label="Phone (Optional)"
              placeholder="+x(xxx)xxx-xx-xx"
              v-model="userProfile.phone"
            />
          </div>

          <!-- Gender -->
          <div class="lg:col-span-3">
            <label for="af-account-gender-checkbox" class="text-sm text-gray-800">
              Gender
            </label>
            <div class="sm:flex">
              <label
                for="af-account-gender-checkbox"
                class="flex py-2 px-3 w-full border border-gray-200 shadow-2xs -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 checked:border-blue-500 disabled:opacity-50 disabled:pointer-events-none"
              >
                <input
                  type="radio"
                  name="af-account-gender-checkbox"
                  class="shrink-0 mt-0.5 border-gray-300 rounded-full text-blue-600 focus:ring-blue-500 checked:border-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                  id="af-account-gender-checkbox"
                  value="male"
                  v-model="userProfile.gender"
                />
                <span class="sm:text-sm text-gray-500 ms-3">Male</span>
              </label>

              <label
                for="af-account-gender-checkbox-female"
                class="flex py-2 px-3 w-full border border-gray-200 shadow-2xs -mt-px -ms-px first:rounded-t-lg last:rounded-b-lg sm:first:rounded-s-lg sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-lg text-sm relative focus:z-10 focus:border-blue-500 focus:ring-blue-500 checked:border-blue-500 disabled:opacity-50 disabled:pointer-events-none"
              >
                <input
                  type="radio"
                  name="af-account-gender-checkbox"
                  class="shrink-0 mt-0.5 border-gray-300 rounded-full text-blue-600 focus:ring-blue-500 checked:border-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                  id="af-account-gender-checkbox-female"
                  value="female"
                  v-model="userProfile.gender"
                />
                <span class="sm:text-sm text-gray-500 ms-3 dark:text-neutral-400">Female</span>
              </label>
            </div>
          </div>

          <!-- Password Section -->
          <div class="lg:col-span-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
          </div>

          <!-- Current Password -->
          <div class="lg:col-span-3">
            <InputBox
              id="af-account-password"
              type="password"
              label="Current Password"
              placeholder="Enter current password"
              v-model="passwordData.currentPassword"
            />
          </div>

          <!-- New Password -->
          <div class="lg:col-span-3">
            <InputBox
              id="af-account-new-password"
              type="password"
              label="New Password"
              placeholder="Enter new password"
              v-model="passwordData.newPassword"
            />
          </div>

          <!-- Action Buttons -->
          <div class="lg:col-span-4 flex gap-4">
            <BaseButton
              type="button"
              class="bg-blue-600 text-white hover:bg-blue-700"
              @click="updateUserProfile"
              :disabled="isSaving"
            >
              {{ isSaving ? 'Saving...' : 'Save Profile' }}
            </BaseButton>
            
            <BaseButton
              type="button"
              class="bg-green-600 text-white hover:bg-green-700"
              @click="changeUserPassword"
              :disabled="isChangingPassword"
            >
              {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
            </BaseButton>
          </div>
        </div>
        <!-- End Grid -->
      </form>
    </div>
    <!-- End Card -->
  </div>
  <!-- End Card Section -->
</template>
