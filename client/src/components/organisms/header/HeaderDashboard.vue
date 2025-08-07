<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/atoms/BaseButton.vue';
import BaseIcon from '@/components/atoms/BaseIcon.vue';

const userName = ref('');
const userImage = ref('');
const router = useRouter();

// Computed property to determine home link based on authentication status
const homeLink = computed(() => {
  return localStorage.getItem('token') ? '/dashboard' : '/';
});

// Load user data from localStorage
function loadUserData() {
  console.log('HeaderDashboard: Loading user data');
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('HeaderDashboard: User data found:', user);
      userName.value = user.nom || user.email || 'User';
      // Construct the full URL for profile photo
      if (user.photoProfil) {
        userImage.value = `http://localhost:3000/uploads/${user.photoProfil}`;
        console.log('HeaderDashboard: Profile image URL set to:', userImage.value);
      } else {
        console.log('HeaderDashboard: No profile photo found, using default');
        userImage.value = 'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg';
      }
    } catch (e) {
      console.error('HeaderDashboard: Error parsing user data:', e);
      userName.value = 'User';
      userImage.value = 'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg';
    }
  } else {
    console.log('HeaderDashboard: No user data found in localStorage');
    userName.value = 'User';
    userImage.value = 'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg';
  }
}

// Listen for storage changes
function handleStorageChange(event) {
  if (event.key === 'user') {
    loadUserData();
  }
}

// Listen for custom events for profile updates
function handleProfileUpdate(event) {
  console.log('HeaderDashboard: Profile update event received');
  loadUserData();
}

onMounted(() => {
  loadUserData();
  // Listen for localStorage changes from other tabs
  window.addEventListener('storage', handleStorageChange);
  // Listen for custom profile update events
  window.addEventListener('profileUpdated', handleProfileUpdate);
});

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange);
  window.removeEventListener('profileUpdated', handleProfileUpdate);
});

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/');
}
</script>

<template>
  <header class="bg-white border-b border-gray-200">
    <nav class="">
      <div class="flex justify-between items-center gap-x-1">
        <router-link
          class="flex-none font-semibold text-xl text-black focus:outline-hidden p-20 focus:opacity-80 dark:text-white"
          :to="homeLink"
          aria-label="Brand"
          >Designih</router-link
        >

        <div class="hs-dropdown relative inline-flex">
          <BaseButton
            class="hs-dropdown-toggle py-15 gap-10 border-0 border-l-1 border-gray-200 rounded-none"
            type="button"
          >
            <img
              class="w-40 h-40 rounded-full object-cover"
              :src="userImage"
              alt="Profile"
              @error="(e) => e.target.src = 'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg'"
            />
            {{ userName }}
          </BaseButton>
          <div
            class="hs-dropdown-menu border border-gray-200 rounded-lg transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 w-56 hidden z-10 mt-2 bg-white"
          >
            <router-link
              to="/dashboard/settings"
              class="w-full justify-start text-16 border-0 border-b rounded-none"
            >
              <BaseIcon name="Info" />
              Account Info
            </router-link>
            <BaseButton class="w-full justify-start text-16 border-0 rounded-none" @click="handleLogout">
              <BaseIcon name="LogOut" />
              Logout
            </BaseButton>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>
