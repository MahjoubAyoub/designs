<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const userName = ref('');
const userImage = ref('');
const router = useRouter();

onMounted(() => {
  // Try to get user info from localStorage
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      userName.value = user.nom || user.email || 'User';
      userImage.value = user.photoProfil || user.image || 'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg';
    } catch (e) {
      userName.value = 'User';
      userImage.value = 'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg';
    }
  } else {
    userName.value = 'User';
    userImage.value = 'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg';
  }
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
        <a
          class="flex-none font-semibold text-xl text-black focus:outline-hidden p-20 focus:opacity-80 dark:text-white"
          href="/"
          aria-label="Brand"
          >Designih</a
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
