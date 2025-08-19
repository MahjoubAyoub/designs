<script setup>
import Feature from '@/components/molecules/FeatureCard.vue'
</script>

<template>
  <section class="features flex flex-col max-w-[1200px] my-40 mx-auto gap-40 md:gap-60 px-20">
    <h2 class="h2">Features</h2>
    <Feature
      title="Easy To Use"
      text="Lorem ipsum dolor, sit amet consectetur adipisicing elit."
      image="@/assets/images/feature.jpg"
      :items="['Easy & fast designing', 'Powerful features', 'User Experience Design']"
      alt="feat1"
    />
    <Feature
      title="AI image generator"
      text="Lorem ipsum dolor, sit amet consectetur adipisicing elit."
      image="@/assets/images/feature.jpg"
      alt="feat2"
      :items="['Easy & fast designing', 'Powerful features', 'User Experience Design']"
      :reverse="true"
    />
    <Feature
      title="Pre-made templates"
      text="Lorem ipsum dolor, sit amet consectetur adipisicing elit."
      image="@/assets/images/feature.jpg"
      alt="feat3"
      :items="['Easy & fast designing', 'Powerful features', 'User Experience Design']"
    />
  </section>
</template>
