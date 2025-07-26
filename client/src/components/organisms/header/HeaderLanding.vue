<script setup></script>

<template>
  <!-- ========== HEADER ========== -->
  <header
    class="flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full bg-white border-b border-gray-100"
  >
    <nav
      class="relative max-w-[85rem] w-full mx-auto md:flex md:items-center md:justify-between md:gap-3 py-3 px-4 sm:px-6 lg:px-8"
    >
      <div class="flex justify-between items-center gap-x-1">
        <a
          class="flex-none font-semibold text-xl text-black focus:outline-hidden focus:opacity-80 dark:text-white"
          href="/"
          aria-label="Brand"
          >Designih</a
        >

        <!-- Collapse Button -->
        <BaseButton
          type="button"
          class="hs-collapse-toggle md:hidden"
          data-hs-collapse="#hs-header-base"
        >
          <BaseIcon name="Menu" class="hs-collapse-open:hidden"></BaseIcon>
          <BaseIcon name="X" class="hs-collapse-open:block hidden"></BaseIcon>
        </BaseButton>
        <!-- End Collapse Button -->
      </div>

      <!-- Collapse -->
      <div
        id="hs-header-base"
        class="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow md:block"
        aria-labelledby="hs-header-base-collapse"
      >
        <div
          class="overflow-hidden overflow-y-auto max-h-[75vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300"
        >
          <div class="py-2 md:py-0 flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1">
            <div class="grow">
              <div class="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-1">
                <BaseButton class="" href="/about"> About </BaseButton>
                <BaseButton class="" href="/contact">
                  <BaseIcon name="Contact"></BaseIcon>
                  Contact
                </BaseButton>
              </div>
            </div>

            <!-- Button Group -->
            <div class="md:ms-auto mt-2 md:mt-0 flex flex-wrap items-center gap-x-1.5">
              <BaseButton class="" href="/Login"> Sign in </BaseButton>
              <BaseButton class="" href="/Signup"> Sign Up </BaseButton>
            </div>
            <!-- End Button Group -->
          </div>
        </div>
      </div>
      <!-- End Collapse -->
    </nav>
  </header>
  <!-- ========== END HEADER ========== -->
</template>
