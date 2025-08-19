<script setup>
import SideBar from '@/components/organisms/dashboard/SideBar.vue'
import Header from '@/components/organisms/header/HeaderDashboard.vue'
import Footer from '@/components/organisms/footer/FooterLayout.vue'
</script>

<template>
  <main>
    <div class="flex overflow-hidden min-h-screen">
      <div class="flex-auto grow-0 shrink-0">
        <SideBar />
      </div>
      <div class="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div class="flex-1 p-20 bg-gray-100">
          <router-view />
        </div>
        <div>
          <!-- <Footer /> -->
        </div>
      </div>
    </div>
  </main>
</template>
