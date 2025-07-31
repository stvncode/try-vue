<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import PokemonCard from "@/features/explorer/PokemonCard.vue"
import PokemonSearch from "@/features/explorer/PokemonSearch.vue"
import { pokemonApi } from "@/lib/api"
import { usePokemonStore } from "@/stores/pokemon"
import { Loader2 } from "lucide-vue-next"
import { computed, onMounted, onUnmounted, ref } from "vue"

const store = usePokemonStore()

// State for infinite scrolling
const allPokemon = ref<any[]>([])
const isLoadingMore = ref(false)
const isLoadingType = ref(false)
const hasMore = ref(true)
const currentOffset = ref(0)
const limit = 20

// Load favorites on mount
onMounted(() => {
  store.loadFavorites()
  loadInitialPokemon()
})

// Load initial Pokemon
const loadInitialPokemon = async () => {
  try {
    const response = await pokemonApi.getPokemonList(limit, 0)
    const pokemonPromises = response.results.map((pokemon) => pokemonApi.getPokemon(pokemon.name))
    const pokemonData = await Promise.all(pokemonPromises)
    allPokemon.value = pokemonData
    currentOffset.value = limit
    hasMore.value = response.next !== null
  } catch (error) {
    console.error("Failed to load initial Pokemon:", error)
  }
}

// Load more Pokemon for infinite scrolling
const loadMorePokemon = async () => {
  if (isLoadingMore.value || !hasMore.value) return

  isLoadingMore.value = true
  try {
    const response = await pokemonApi.getPokemonList(limit, currentOffset.value)
    const pokemonPromises = response.results.map((pokemon) => pokemonApi.getPokemon(pokemon.name))
    const pokemonData = await Promise.all(pokemonPromises)
    allPokemon.value.push(...pokemonData)
    currentOffset.value += limit
    hasMore.value = response.next !== null
  } catch (error) {
    console.error("Failed to load more Pokemon:", error)
  } finally {
    isLoadingMore.value = false
  }
}

// Search Pokemon
const searchPokemon = async (query: string) => {
  if (!query.trim()) {
    loadInitialPokemon()
    return
  }

  try {
    const response = await pokemonApi.searchPokemon(query)
    const pokemonPromises = response.results.map((pokemon) => pokemonApi.getPokemon(pokemon.name))
    const pokemonData = await Promise.all(pokemonPromises)
    allPokemon.value = pokemonData
    hasMore.value = false // No pagination for search results
  } catch (error) {
    console.error("Failed to search Pokemon:", error)
  }
}

// Load Pokemon by type
const loadPokemonByType = async (type: string) => {
  isLoadingType.value = true
  try {
    // Get type information to find all Pokemon of this type
    const typeData = await pokemonApi.getType(type)
    const pokemonPromises = typeData.pokemon.map((p: any) => pokemonApi.getPokemon(p.pokemon.name))
    const pokemonData = await Promise.all(pokemonPromises)

    // Sort Pokemon by their ID/number
    const sortedPokemonData = pokemonData.sort((a, b) => a.id - b.id)

    allPokemon.value = sortedPokemonData
    hasMore.value = false // No pagination for type filtering
  } catch (error) {
    console.error("Failed to load Pokemon by type:", error)
  } finally {
    isLoadingType.value = false
  }
}

// Load Pokemon by multiple types
const loadPokemonByTypes = async (types: string[]) => {
  isLoadingType.value = true
  try {
    // Get all Pokemon for each type
    const allTypePromises = types.map(async (type) => {
      const typeData = await pokemonApi.getType(type)
      return typeData.pokemon.map((p: any) => p.pokemon.name)
    })

    const allTypeResults = await Promise.all(allTypePromises)

    // Flatten and remove duplicates
    const uniquePokemonNames = [...new Set(allTypeResults.flat())]

    // Fetch full Pokemon data for unique names
    const pokemonPromises = uniquePokemonNames.map((name) => pokemonApi.getPokemon(name))
    const pokemonData = await Promise.all(pokemonPromises)

    // Sort Pokemon by their ID/number
    const sortedPokemonData = pokemonData.sort((a, b) => a.id - b.id)

    allPokemon.value = sortedPokemonData
    hasMore.value = false // No pagination for type filtering
  } catch (error) {
    console.error("Failed to load Pokemon by types:", error)
  } finally {
    isLoadingType.value = false
  }
}

// Computed properties
const filteredPokemon = computed(() => {
  return allPokemon.value
})

// Event handlers
const handleSearchChange = (query: string) => {
  store.setSearchQuery(query)
  searchPokemon(query)
}

const handleTypeChange = async (types: string[]) => {
  store.setSelectedTypes(types)

  // If a type is selected, load all Pokemon of that type
  if (types.length === 1) {
    await loadPokemonByType(types[0])
  } else if (types.length === 0) {
    // If no types selected, go back to normal browsing
    loadInitialPokemon()
  } else {
    // For multiple types, load Pokemon that have ANY of the selected types
    await loadPokemonByTypes(types)
  }
}

const handleClearFilters = () => {
  store.clearFilters()
  loadInitialPokemon()
}

const handleToggleFavorite = (pokemonId: number) => {
  store.toggleFavorite(pokemonId)
}

const handlePokemonClick = (pokemon: any) => {
  store.setCurrentPokemon(pokemon)
  console.log("Pokemon clicked:", pokemon.name)
}

// Infinite scroll handler
const handleScroll = () => {
  const scrollTop = window.scrollY
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  if (scrollTop + windowHeight >= documentHeight - 100) {
    loadMorePokemon()
  }
}

// Add scroll listener
onMounted(() => {
  window.addEventListener("scroll", handleScroll)
})

// Remove scroll listener on unmount
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h1
        class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
      >
        Pokemon Explorer
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Discover and explore the amazing world of Pokemon
      </p>
    </div>

    <!-- Search and Filters -->
    <PokemonSearch
      :search-query="store.searchQuery"
      :selected-types="store.selectedTypes"
      :on-search-change="handleSearchChange"
      :on-type-change="handleTypeChange"
      :on-clear-filters="handleClearFilters"
    />

    <!-- Loading State -->
    <div v-if="(allPokemon.length === 0 && !isLoadingMore) || isLoadingType" class="space-y-4">
      <!-- Type Loading Message -->
      <div v-if="isLoadingType" class="text-center py-8">
        <div class="flex items-center justify-center gap-2 mb-4">
          <Loader2 class="h-8 w-8 animate-spin text-blue-600" />
          <span class="text-lg font-semibold">
            Loading
            {{
              store.selectedTypes.length === 1
                ? store.selectedTypes[0]
                : store.selectedTypes.join(" & ")
            }}
            Pokemon...
          </span>
        </div>
        <p class="text-gray-600 dark:text-gray-400">
          Fetching all Pokemon of
          {{ store.selectedTypes.length === 1 ? "this type" : "these types" }}. This may take a few
          seconds.
        </p>
      </div>

      <!-- Skeleton Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card v-for="i in 8" :key="i" class="p-4">
          <div class="space-y-3">
            <Skeleton class="h-32 w-32 mx-auto rounded-lg" />
            <Skeleton class="h-4 w-24 mx-auto" />
            <div class="flex justify-center gap-2">
              <Skeleton class="h-6 w-16" />
              <Skeleton class="h-6 w-16" />
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- Pokemon Grid -->
    <div v-else-if="filteredPokemon.length > 0" class="space-y-6">
      <!-- Results Count -->
      <div class="flex justify-between items-center">
        <p class="text-gray-600 dark:text-gray-400">
          Showing {{ filteredPokemon.length }} Pokemon
          <span v-if="store.searchQuery"> (search results)</span>
        </p>
      </div>

      <!-- Pokemon Cards -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
      >
        <PokemonCard
          v-for="pokemon in filteredPokemon"
          :key="pokemon.id"
          :pokemon="pokemon"
          :is-favorite="store.isFavorite(pokemon.id)"
          @toggle-favorite="handleToggleFavorite"
          @click="handlePokemonClick"
        />
      </div>

      <!-- Load More Indicator -->
      <div v-if="isLoadingMore" class="flex justify-center py-8">
        <div class="flex items-center gap-2">
          <Loader2 class="h-6 w-6 animate-spin" />
          <span class="text-gray-600 dark:text-gray-400">Loading more Pokemon...</span>
        </div>
      </div>

      <!-- End of Results -->
      <div v-else-if="!hasMore && !store.searchQuery" class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400">
          You've reached the end! All Pokemon have been loaded.
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-gray-500 text-lg font-semibold mb-2">No Pokemon found</div>
      <p class="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search or filters</p>
      <Button @click="handleClearFilters">Clear Filters</Button>
    </div>
  </div>
</template>
