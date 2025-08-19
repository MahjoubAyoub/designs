<script setup>
import Header from '@/components/organisms/header/HeaderLanding.vue'
import Hero from '@/components/organisms/landing/HeroSection.vue'
import FeatureList from '@/components/organisms/landing/FeaturesSection.vue'
import Quote from '@/components/organisms/landing/QuoteSection.vue'
import FAQ from '@/components/organisms/landing/FAQ.vue'
import Footer from '@/components/organisms/footer/FooterLayout.vue'
</script>

<template>
  <main id="app" class="relative overflow-clip">
    <Header />
    <Hero />
    <FeatureList />
    <Quote />
    <FAQ />
    <Footer />
  </main>
</template>
