```vue
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import InputBox from '@/components/molecules/InputBox.vue';
import BaseButton from '@/components/atoms/BaseButton.vue'; // Adjust path if needed

const email = defineModel('email');
const password = defineModel('password');
const confirm = defineModel('confirm');
const nom = defineModel('nom');
const error = ref(''); // Store error messages
const router = useRouter(); // For redirecting after signup/login

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const handleSignup = async () => {
  error.value = '';

  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        motDePasse: password.value,
        nom: nom.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    // Auto-login after successful signup
    await autoLogin(email.value, password.value);
  } catch (err) {
    error.value = err.message;
    console.error('Signup error:', err);
  }
};

// Auto-login after signup
const autoLogin = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store the JWT token and user info
    localStorage.setItem('token', data.token);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    console.log('JWT Token:', data.token); // Log token for debugging
    // Redirect to a protected route (e.g., dashboard)
    router.push('/dashboard/designs');
  } catch (err) {
    error.value = err.message;
    console.error('Login error:', err);
  }
};

const handleGoogleSignup = () => {
  // Redirect to Google OAuth
  window.location.href = `${API_URL}/auth/google`;
};
</script>

<template>
  <div class="mx-30">
    <p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">
      Already have an account?
      <a
        class="text-blue-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium dark:text-blue-500"
        href="/login"
      >
        Sign in here
      </a>
    </p>
  </div>

  <form @submit.prevent="handleSignup" class="flex flex-col gap-4">
    <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>

    <div class="mt-5">
      <BaseButton type="button" class="w-full py-10" @click="handleGoogleSignup">
        <svg class="w-4 h-auto" width="46" height="47" viewBox="0 0 46 47" fill="none">
          <path
            d="M46 24.0287C46 22.09 45.8533 20.68 45.5013 19.2112H23.4694V27.9356H36.4069C36.1429 30.1094 34.7347 33.37 31.5957 35.5731L31.5663 35.8669L38.5191 41.2719L38.9885 41.3306C43.4477 37.2181 46 31.1669 46 24.0287Z"
            fill="#4285F4"
          />
          <path
            d="M23.4694 47C29.8061 47 35.1161 44.9144 39.0179 41.3012L31.625 35.5437C29.6301 36.9244 26.9898 37.8937 23.4987 37.8937C17.2793 37.8937 12.0281 33.7812 10.1505 28.1412L9.88649 28.1706L2.61097 33.7812L2.52296 34.0456C6.36608 41.7125 14.287 47 23.4694 47Z"
            fill="#34A853"
          />
          <path
            d="M10.1212 28.1413C9.62245 26.6725 9.32908 25.1156 9.32908 23.5C9.32908 21.8844 9.62245 20.3275 10.0918 18.8588V18.5356L2.75765 12.8369L2.52296 12.9544C0.909439 16.1269 0 19.7106 0 23.5C0 27.2894 0.909439 30.8731 2.49362 34.0456L10.1212 28.1413Z"
            fill="#FBBC05"
          />
          <path
            d="M23.4694 9.07688C27.8699 9.07688 30.8622 10.9863 32.5344 12.5725L39.1645 6.11C35.0867 2.32063 29.8061 0 23.4694 0C14.287 0 6.36607 5.2875 2.49362 12.9544L10.0918 18.8588C11.9987 13.1894 17.25 9.07688 23.4694 9.07688Z"
            fill="#EB4335"
          />
        </svg>
        Sign up with Google
      </BaseButton>
    </div>
    <div
      class="py-3 flex items-center text-xs text-gray-400 uppercase before:flex-1 before:border-t after:flex-1 after:border-t dark:text-neutral-500"
    >
      Or
    </div>

    <InputBox
      id="email_box"
      label="Email Address"
      placeholder="Insert E-mail"
      v-model="email"
      type="email"
      required
    />
    <InputBox
      id="UserName_box"
      label="UserName"
      placeholder=" Your Name"
      v-model="nom"
      type="text"
      required
    />
    <InputBox
      id="password_box"
      label="Password"
      placeholder="Insert Password"
      v-model="password"
      type="password"
      required
    />
    <InputBox
      id="confirm_box"
      label="Confirm Password"
      placeholder="Confirm Password"
      v-model="confirm"
      type="password"
      required
    />

    <BaseButton type="submit" class="w-full mt-4 py-10">Sign up</BaseButton>
  </form>
</template>
```
