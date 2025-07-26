<script setup>
import BaseButton from '@/components/atoms/BaseButton.vue'
import InputBox from '@/components/molecules/InputBox.vue'
</script>

<template>
  <!-- Card Section -->
  <div class="max-w-4xl px-4 py-10 sm:px-6 lg:px-8 mx-auto">
    <!-- Card -->
    <div class="bg-white rounded-xl shadow-xs p-4 sm:p-7 dark:bg-neutral-800">
      <div class="mb-8">
        <h2 class="text-xl font-bold text-gray-800">Profile</h2>
      </div>

      <form>
        <!-- Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-15">

          <!-- Avatar -->
          <div class="lg:col-span-3">
            <label class="inline-block text-sm text-gray-800 mt-2.5"> Profile photo </label>
            <div class="flex items-center gap-5">
              <img
                class="inline-block size-16 rounded-full ring-2 ring-white dark:ring-neutral-900"
                src="https://preline.co/assets/img/160x160/img1.jpg"
                alt="Avatar"
              />
              <div class="flex gap-x-2">
                <div>
                  <BaseButton
                    type="button"
                    class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-50"
                  >
                    Upload photo
                  </BaseButton>
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
              placeholder="Maria"
              inputClass=""
            />
          </div>

          <!-- Email -->
          <div class="lg:col-span-3">
            <InputBox
              id="af-account-email"
              type="email"
              label="Email"
              placeholder="maria@site.com"
            />
          </div>

          <!-- Password -->
          <div class="lg:col-span-3">
            <InputBox
                id="af-account-password"
                type="text"
                label="Password"
                placeholder="Enter current password"
              />
          </div>

          <!-- Password check -->
          <div class="lg:col-span-3">
            <InputBox
              id="af-account-new-password"
              type="text"
              label="New Password"
              placeholder="Enter new password"
            />
          </div>

          <!-- Phone -->
          <div class="lg:col-span-3">
            <InputBox
              id="af-account-phone"
              type="text"
              label="Phone (Optional)"
              placeholder="+x(xxx)xxx-xx-xx"
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
                  checked
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
                />
                <span class="sm:text-sm text-gray-500 ms-3 dark:text-neutral-400">Female</span>
              </label>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="lg:col-span-4">
            <BaseButton
              type="button"
              class=""
            >
              Save changes
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
