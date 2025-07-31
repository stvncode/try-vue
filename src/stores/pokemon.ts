import type { Pokemon, PokemonListResponse } from "@/lib/api"
import { defineStore } from "pinia"
import { computed, ref } from "vue"

export const usePokemonStore = defineStore("pokemon", () => {
  // State
  const pokemonList = ref<PokemonListResponse | null>(null)
  const currentPokemon = ref<Pokemon | null>(null)
  const searchQuery = ref("")
  const currentPage = ref(1)
  const itemsPerPage = ref(20)
  const selectedTypes = ref<string[]>([])
  const favorites = ref<number[]>([])

  // Getters
  const totalPages = computed(() => {
    if (!pokemonList.value) return 0
    return Math.ceil(pokemonList.value.count / itemsPerPage.value)
  })

  const filteredPokemon = computed(() => {
    if (!pokemonList.value?.results) return []

    let filtered = pokemonList.value.results

    // Filter by search query
    if (searchQuery.value) {
      filtered = filtered.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }

    // Filter by selected types (if we had type data)
    // This would require additional API calls to implement properly

    return filtered
  })

  const isFavorite = computed(() => (pokemonId: number) => {
    return favorites.value.includes(pokemonId)
  })

  // Actions
  const setPokemonList = (list: PokemonListResponse) => {
    pokemonList.value = list
  }

  const setCurrentPokemon = (pokemon: Pokemon) => {
    currentPokemon.value = pokemon
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
    currentPage.value = 1
  }

  const setPage = (page: number) => {
    currentPage.value = page
  }

  const setSelectedTypes = (types: string[]) => {
    selectedTypes.value = types
  }

  const toggleFavorite = (pokemonId: number) => {
    const index = favorites.value.indexOf(pokemonId)
    if (index > -1) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.push(pokemonId)
    }

    // Save to localStorage
    localStorage.setItem("pokemon-favorites", JSON.stringify(favorites.value))
  }

  const loadFavorites = () => {
    const saved = localStorage.getItem("pokemon-favorites")
    if (saved) {
      favorites.value = JSON.parse(saved)
    }
  }

  const clearFilters = () => {
    searchQuery.value = ""
    selectedTypes.value = []
    currentPage.value = 1
  }

  return {
    // State
    pokemonList,
    currentPokemon,
    searchQuery,
    currentPage,
    itemsPerPage,
    selectedTypes,
    favorites,

    // Getters
    totalPages,
    filteredPokemon,
    isFavorite,

    // Actions
    setPokemonList,
    setCurrentPokemon,
    setSearchQuery,
    setPage,
    setSelectedTypes,
    toggleFavorite,
    loadFavorites,
    clearFilters,
  }
})
