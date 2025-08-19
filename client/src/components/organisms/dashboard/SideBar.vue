<script setup>
  import BaseIcon from '@/components/atoms/BaseIcon.vue';
</script>

<template>

  <!-- Sidebar -->
  <div id="dashboard-sidebar" class="hs-overlay [--auto-close:lg] relative max-lg:fixed top-0 left-0 hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform w-65 h-full hidden bg-white border-e border-gray-200 lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 z-10" role="dialog" tabindex="-1" aria-label="Sidebar">
    <div class="relative flex flex-col h-full max-h-full">
      <router-link
          class="flex-none font-semibold text-xl text-black focus:outline-hidden p-20 focus:opacity-80"
          to="/"
          aria-label="Brand"
          >Designih</router-link
        >
      <!-- Content -->
      <div class="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
        <nav class="hs-accordion-group p-3 w-full flex flex-col flex-wrap" data-hs-accordion-always-open>
          <ul class="flex flex-col space-y-1">
            <li>
              <router-link
                to="/dashboard/designs"
                class="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-neutral-700 rounded-lg hover:bg-gray-100"
                active-class="bg-gray-100 dark:bg-neutral-700"
              >
                <BaseIcon name="Image"/>
                My Designs
              </router-link>
            </li>
             <li>
              <router-link
                to="/dashboard/public"
                class="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-neutral-700 rounded-lg hover:bg-gray-100"
                active-class="bg-gray-100 dark:bg-neutral-700"
              >
                <BaseIcon name="BookCheck"/>
                Public Designs
              </router-link>
            </li>
            <li>
              <router-link
                to="/dashboard"
                class="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-neutral-700 rounded-lg hover:bg-gray-100"
                active-class="bg-gray-100 dark:bg-neutral-700"
              >
                <BaseIcon name="LayoutTemplate"/>
                Templates
              </router-link>
            </li>
            <li>
              <router-link
                to="/dashboard/settings"
                class="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-neutral-700 rounded-lg hover:bg-gray-100"
                active-class="bg-gray-100 dark:bg-neutral-700"
              >
                <BaseIcon name="Settings"/>
                My Settings
              </router-link>
            </li>
            <li>
              <router-link
                to="/dashboard/feedback"
                class="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-neutral-700 rounded-lg hover:bg-gray-100"
                active-class="bg-gray-100 dark:bg-neutral-700"
              >
                <BaseIcon name="MessageSquare"/>
                Feedback
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
      <!-- End Content -->
    </div>
  </div>
<!-- End Sidebar -->
</template>
