<script setup>
import BaseIcon from '@/components/atoms/BaseIcon.vue';
</script>

<template>
  <footer class="bg-gray-950 text-white">
    <div class="max-w-[85rem] py-20 px-15 mx-auto">
      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-15">
        <div class="max-md:text-center">
          <a class="flex-none text-xl font-semibold focus:outline-hidden" href="#" aria-label="Brand">Designih</a>
        </div>
        <!-- End Col -->

        <!-- Social Brands -->
        <div class="flex gap-10 justify-center-safe space-x-2">
          <a class="inline-flex justify-center items-center p-5 rounded-full hover:bg-white hover:text-black" href="#">
            <BaseIcon name="Instagram" size="20" />
          </a>
          <a class="inline-flex justify-center items-center p-5 rounded-full hover:bg-white hover:text-black" href="#">
            <BaseIcon name="Facebook" size="20" />
          </a>
          <a class="inline-flex justify-center items-center p-5 rounded-full hover:bg-white hover:text-black" href="#">
            <BaseIcon name="Linkedin" size="20" />
          </a>
          <a class="inline-flex justify-center items-center p-5 rounded-full hover:bg-white hover:text-black" href="#">
            <BaseIcon name="Youtube" size="20" />
          </a>
        </div>
        <!-- End Social Brands -->

        <div class="text-center">
          <img
              src="/src/assets/images/intuitiv_technology_logo1.jpg"
              alt="Intuitiv-logo"
              class="rounded-xl w-100 max-md:mx-auto md:ml-auto"
            />
        </div>
        <!-- End Social Brands -->
      </div>
    </div>
    <!-- End Grid -->
  </footer>
</template>
