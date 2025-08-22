<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ex from '@/assets/images/export.jpg'
import ex1 from '@/assets/images/export1.jpg'
import ex2 from '@/assets/images/export2.jpg'


const images = ref([
  ex,
  ex1,
  ex2,
])
const currentImage = ref(0)
let sliderInterval = null

const startSlider = () => {
  sliderInterval = setInterval(() => {
    currentImage.value = (currentImage.value + 1) % images.value.length
  }, 5000) // Change image every 5 seconds
}

onMounted(() => {
  startSlider()
})

onUnmounted(() => {
  clearInterval(sliderInterval)
})
</script>

<template>
  <div class="relative bg-gray-100 overflow-hidden">
    <div class="absolute inset-0">
      <transition
        enter-active-class="transition-transform duration-500 ease-in-out absolute w-full h-full"
        leave-active-class="transition-transform duration-500 ease-in-out absolute w-full h-full"
        enter-from-class="translate-x-full"
        leave-to-class="-translate-x-full"
      >
        <img
          :key="currentImage"
          :src="images[currentImage]"
          alt="Hero Background"
          class="w-full h-full object-cover absolute inset-0"
        />
      </transition>
    </div>
    <div class="relative max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div class="mt-5 max-w-xl text-center mx-auto">
        <h1 class="block font-bold text-gray-800 text-4xl md:text-5xl lg:text-6xl">
          Build your dream <span class="text-primary">Design</span> effortlessly
        </h1>
      </div>
      <div class="mt-5 max-w-3xl text-center mx-auto my-20">
        <p class="text-lg text-gray-600 dark:text-neutral-400 pt-4 lg:text-xl">
          Where Creativity Meets Simplicity.
        </p>
      </div>
      <div class="mt-8 gap-3 flex justify-center">
        <BaseButton
          reverse="true"
          href="/signup"
          class="bg-primary text-white text-14 font-medium py-10 px-20 border border-transparent rounded-full"
        >
          <BaseIcon name="Feather"></BaseIcon>
          Start now
        </BaseButton>
      </div>
    </div>
  </div>
</template>
