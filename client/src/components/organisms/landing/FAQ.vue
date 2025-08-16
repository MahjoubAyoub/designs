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
        <Collapse title="What is Designih?">
          Designih is an easy-to-use online design platform that lets you create, customize, and manage professional designs without needing advanced design skills.
        </Collapse>
        <Collapse title="Do I need to install anything to use Designih?">
           No. Designih works directly in your browser — no downloads or installations required.
        </Collapse>
        <Collapse title="Can I save and edit my designs later?">
          Yes. Your designs are saved in your account so you can revisit, edit, and update them anytime.
        </Collapse>
        <Collapse title="Is my work saved automatically?">
          Yes. Designih automatically saves your progress in real time, so you never have to worry about losing your work. You can close your browser or switch devices and pick up right where you left off.
        </Collapse>
      </div>
    </div>
  </div>
</template>
