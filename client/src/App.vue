<script setup lang="ts">
import AnimeSearch from './components/AnimeSearch.vue'
</script>

<template>
  <div class="w-full max-w-6xl">
    <div class="text-center mb-8">
      <h1 class="text-5xl font-bold text-white mb-4">
          🎌 Anime Rating Search
      </h1>
      <p class="text-xl text-white/80">
         Search for your favorite anime and get detailed information
      </p>
    </div>
    
    <AnimeSearch />
  </div>
</template>

<style scoped>
</style>
