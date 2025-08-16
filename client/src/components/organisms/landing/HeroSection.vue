<script setup></script>

<template>
  <!-- Hero -->
  <div class="relative overflow-hidden">
    <div class="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <!-- Title -->
      <div class="mt-5 max-w-xl text-center mx-auto">
        <h1 class="block font-bold text-gray-800 text-4xl md:text-5xl lg:text-6xl">
          Build your dream <span class="text-primary">Design</span> effortlessly
        </h1>
      </div>
      <!-- End Title -->

      <div class="mt-5 max-w-3xl text-center mx-auto">
        <p class="text-lg text-gray-600 dark:text-neutral-400 pt-4 lg:text-xl">
          Where Creativity Meets Simplicity.
        </p>
      </div>

      <!-- Buttons -->
      <div class="mt-8 gap-3 flex justify-center">
        <BaseButton
          reverse="true"
          href="/signup"
          class="bg-primary text-white text-14 font-medium border border-transparent rounded-full"
        >
          <BaseIcon name="Feather"></BaseIcon>
          Start now
        </BaseButton>
      </div>
      <!-- End Buttons -->
    </div>
  </div>
  <!-- End Hero -->
</template>
