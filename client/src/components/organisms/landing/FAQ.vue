<script setup>
import Collapse from '@/components/molecules/collapseBox.vue'
</script>
<template>
  <!-- FAQ -->
  <div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
    <!-- Title -->
    <div class="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
      <h2 class="text-2xl font-bold md:text-4xl md:leading-tight dark:text-white">
        Your questions, answered
      </h2>
      <p class="mt-1 text-gray-600 dark:text-neutral-400">
        Answers to the most frequently asked questions.
      </p>
    </div>

    <div class="max-w-2xl mx-auto">
      <div class="hs-accordion-group">
        <Collapse title="Can I cancel at anytime?">
          Yes, you can cancel anytime no questions are asked while you cancel but we would highly
          appreciate if you will give us some feedback.
        </Collapse>
        <Collapse title="My team has credits. How do we use them?">
          Once your team signs up for a subscription plan. This is where we sit down, grab a cup of
          coffee and dial in the details.
        </Collapse>
        <Collapse title="How does Preline's pricing work?">
          Our subscriptions are tiered. Understanding the task at hand and ironing out the wrinkles
          is key.
        </Collapse>
        <Collapse title="How secure is Preline?">
          Protecting the data you trust to Preline is our first priority. This part is really
          crucial in keeping the project in line to completion.
        </Collapse>
      </div>
    </div>
  </div>
</template>
