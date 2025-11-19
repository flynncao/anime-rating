<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

interface AnimeDetails {
  id: number
  title: string
  main_picture?: {
    medium: string
    large: string
  }
  alternative_titles?: {
    synonyms: string[]
    en: string
    ja: string
  }
  synopsis?: string
  mean?: number
  rank?: number
  popularity?: number
  num_list_users?: number
  num_scoring_users?: number
  rating?: string
  start_date?: string
  end_date?: string
}

const searchTitle = ref('')
const animeData = ref<AnimeDetails | null>(null)
const loading = ref(false)
const error = ref('')

const searchAnime = async () => {
  if (!searchTitle.value.trim()) {
    error.value = 'Please enter an anime title'
    return
  }

  loading.value = true
  error.value = ''
  animeData.value = null

  try {
    // Use relative URL in development (Vite proxy will handle it)
    // Use absolute URL in production
    const apiUrl = import.meta.env.PROD ? import.meta.env.VITE_API_URL : ''
    const fullUrl = `${apiUrl}/api/search`
    
    console.log('🚀 Making request to:', fullUrl)
    console.log('📍 Environment:', import.meta.env.PROD ? 'production' : 'development')
    
    const response = await axios.get<AnimeDetails>(fullUrl, {
      params: { title: searchTitle.value },
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 10000 // 10 second timeout
    })
    
    console.log('✅ Response received:', response.status)
    animeData.value = response.data
  } catch (err: any) {
    console.error('❌ Error details:', err)
    console.error('❌ Error response:', err.response)
    console.error('❌ Error request:', err.request)
    
    if (err.code === 'ERR_NETWORK') {
      error.value = 'Network error - CORS or connectivity issue. Check console for details.'
    } else if (err.response) {
      error.value = err.response.data?.error || `Server error: ${err.response.status} ${err.response.statusText}`
    } else if (err.request) {
      error.value = 'No response from server - CORS or network issue'
    } else {
      error.value = err.message || 'Failed to fetch anime data. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    searchAnime()
  }
}
</script>

<template>
  <div class="card">
    <!-- Search Input -->
    <div class="flex gap-4 mb-8">
      <input
        v-model="searchTitle"
        type="text"
        placeholder="Enter anime title (e.g., Attack on Titan, Naruto...)"
        class="input flex-1 text-lg"
        @keypress="handleKeyPress"
      />
      <button
        class="btn-primary"
        :disabled="loading"
        @click="searchAnime"
      >
        {{ loading ? 'Searching...' : 'Search' }}
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 text-gray-600">Searching for anime...</p>
    </div>

    <!-- Anime Details Output -->
    <div v-if="animeData && !loading" class="anime-details">
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Image -->
        <div class="flex-shrink-0">
          <img
            v-if="animeData.main_picture?.large"
            :src="animeData.main_picture.large"
            :alt="animeData.title"
            class="w-full md:w-64 rounded-lg shadow-lg"
          />
          <div v-else class="w-full md:w-64 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <span class="text-gray-400 text-4xl">🎬</span>
          </div>
        </div>

        <!-- Details -->
        <div class="flex-1">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">
            {{ animeData.title }}
          </h2>

          <!-- Alternative Titles -->
          <div v-if="animeData.alternative_titles" class="mb-4">
            <p v-if="animeData.alternative_titles.en" class="text-gray-600">
              <span class="font-semibold">English:</span> {{ animeData.alternative_titles.en }}
            </p>
            <p v-if="animeData.alternative_titles.ja" class="text-gray-600">
              <span class="font-semibold">Japanese:</span> {{ animeData.alternative_titles.ja }}
            </p>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
              <p class="text-sm opacity-90">Score</p>
              <p class="text-2xl font-bold">{{ animeData.mean || 'N/A' }}</p>
            </div>
            <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg">
              <p class="text-sm opacity-90">Rank</p>
              <p class="text-2xl font-bold">#{{ animeData.rank || 'N/A' }}</p>
            </div>
            <div class="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-4 rounded-lg">
              <p class="text-sm opacity-90">Popularity</p>
              <p class="text-2xl font-bold">#{{ animeData.popularity || 'N/A' }}</p>
            </div>
            <div class="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
              <p class="text-sm opacity-90">Users</p>
              <p class="text-2xl font-bold">{{ animeData.num_list_users?.toLocaleString() || 'N/A' }}</p>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="space-y-2 mb-6">
            <p v-if="animeData.rating" class="text-gray-700">
              <span class="font-semibold">Rating:</span> {{ animeData.rating }}
            </p>
            <p v-if="animeData.start_date" class="text-gray-700">
              <span class="font-semibold">Aired:</span> {{ animeData.start_date }}
              <span v-if="animeData.end_date"> to {{ animeData.end_date }}</span>
            </p>
            <p v-if="animeData.num_scoring_users" class="text-gray-700">
              <span class="font-semibold">Scored by:</span> {{ animeData.num_scoring_users.toLocaleString() }} users
            </p>
          </div>

          <!-- Synopsis -->
          <div v-if="animeData.synopsis" class="mt-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Synopsis</h3>
            <p class="text-gray-700 leading-relaxed">{{ animeData.synopsis }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.anime-details {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
