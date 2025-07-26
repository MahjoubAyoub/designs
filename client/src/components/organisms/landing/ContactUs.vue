<script setup lang="ts">
import InputBox from '@/components/molecules/InputBox.vue'
</script>

<template>
  <!-- Hire Us -->
  <div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
    <!-- Grid -->
    <div class="grid md:grid-cols-2 items-center gap-12">
      <div>
        <h1
          class="text-3xl font-bold text-gray-800 sm:text-4xl lg:text-5xl lg:leading-tight dark:text-white"
        >
          Contact Us
        </h1>
        <p class="mt-1 md:text-lg text-gray-800 dark:text-neutral-200">
          We help brands and platforms turn big ideas into beautiful digital products and
          experiences.
        </p>
      </div>
      <!-- Brands -->
      <div class="relative">
        <!-- Card -->
        <div class="flex flex-col border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-10">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-neutral-200">
            Fill in the form
          </h2>

          <form>
            <div class="mt-6 grid gap-4 lg:gap-6">
              <!-- Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <InputBox label="First Name" />
                </div>

                <div>
                  <input-box label="Last Name" />
                </div>
              </div>
              <!-- End Grid -->

              <div>
                <input-box label="Work Email" />
              </div>

              <!-- Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <input-box label="Company" />
                </div>

                <div>
                  <input-box label="Company Website" />
                </div>
              </div>
              <!-- End Grid -->
              <div>
                <label
                  for="hs-about-hire-us-1"
                  class="block mb-2 text-sm text-gray-700 font-medium dark:text-white"
                  >Details</label
                >
                <textarea
                  id="hs-about-hire-us-1"
                  name="hs-about-hire-us-1"
                  rows="4"
                  class="py-2.5 sm:py-3 px-4 block w-full rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none border-gray-300"
                ></textarea>
              </div>
            </div>
          </form>
          <!-- End Grid -->
          <div class="mt-6 grid">
            <button
              type="submit"
              class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
            >
              Send inquiry
            </button>
          </div>

          <div class="mt-3 text-center">
            <p class="text-sm text-gray-500 dark:text-neutral-500">
              We'll get back to you in 1-2 business days.
            </p>
          </div>
        </div>
        <!-- End Card -->
      </div>
      <!-- End Col -->
    </div>
    <!-- End Grid -->
  </div>
  <!-- End Hire Us -->
</template>
