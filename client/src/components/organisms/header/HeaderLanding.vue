<script setup></script>

<template>
  <header
    class="sticky top-0 flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full bg-white border-b border-gray-200 z-10"
  >
    <nav class="flex w-full justify-between items-center max-w-[85rem] px-15 py-10 mx-auto">
      <a
        class="flex-none font-semibold text-xl text-black focus:outline-hidden focus:opacity-80"
        href="/"
        aria-label="Brand"
        >Designih</a
      >

      <!-- Collapse Button -->
      <div class="flex items-center gap-10">
        <BaseButton class="border-0" href="/about">About</BaseButton>
        <BaseButton class="border-0" href="/contact">Contact</BaseButton>
        <BaseButton class="" href="/Login"> Sign in </BaseButton>
      </div>
      <!-- End Collapse Button -->
    </nav>
  </header>
</template>
