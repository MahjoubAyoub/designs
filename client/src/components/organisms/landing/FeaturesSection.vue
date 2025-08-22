<script setup>
import Feature from '@/components/molecules/FeatureCard.vue'
import easy from '@/assets/images/easy.png'
import ai from '@/assets/images/ai_ss.png'
import templates from '@/assets/images/templates_ss.png'
</script>

<template>
  <section class="features flex flex-col max-w-[1200px] my-40 mx-auto gap-40 md:gap-60 px-20">
    <h2 class="h2">Features</h2>
    <Feature
      title="Easy To Use"
      text="Design anything in minutes with our simple, Designih tools."
      :image="easy"
      :items="['Easy & fast designing', 'Powerful features', 'User Experience Design']"
      alt="feat1"
    />
    <Feature
      title="AI image generator"
      text="Turn your ideas into stunning visuals with just a prompt."
      :image="ai"
      alt="feat2"
      :items="['Generate unique images from text prompts', 'Multiple styles and customization options', 'High-quality, fast rendering']"
      :reverse="true"
    />
    <Feature
      title="Pre-made templates"
      text="Start faster with ready-made, fully customizable templates."
      :image="templates"
      alt="feat3"
      :items="['Professionally designed layouts', 'Ready-to-use for social media, ads, and more', 'Fully customizable to match your brand']"
    />
  </section>
</template>
