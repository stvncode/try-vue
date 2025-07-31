<script setup lang="ts">
import { Skeleton } from "@/components/ui/skeleton"
import {
  PokemonSelector,
  TeamAnalysis,
  TeamDisplay,
  TeamHeader,
  pokemonTypes,
} from "@/features/builder"
import type { Pokemon } from "@/lib/api"
import { pokemonApi } from "@/lib/api"
import { usePokemonStore } from "@/stores/pokemon"
import { Shield, Target, Users } from "lucide-vue-next"
import { onMounted, ref } from "vue"

const store = usePokemonStore()

const teamName = ref("My Pokemon Team")
const team = ref<Pokemon[]>([])
const allPokemon = ref<Array<{ name: string; url: string; id: number }>>([])
const isLoading = ref(false)
const isLoadingPokemon = ref(false)

const loadPokemon = async () => {
  isLoading.value = true
  try {
    const response = await pokemonApi.getPokemonList(151, 0)
    allPokemon.value = response.results.map((pokemon, index) => ({
      name: pokemon.name,
      url: pokemon.url,
      id: index + 1,
    }))
  } catch (error) {
    console.error("Failed to load Pokemon:", error)
  } finally {
    isLoading.value = false
  }
}

const loadPokemonData = async (pokemonName: string): Promise<Pokemon> => {
  try {
    return await pokemonApi.getPokemon(pokemonName)
  } catch (error) {
    console.error(`Failed to load Pokemon ${pokemonName}:`, error)
    throw error
  }
}

const addPokemonToTeam = async (pokemonName: string) => {
  if (team.value.length >= 6) return

  isLoadingPokemon.value = true
  try {
    const pokemonData = await loadPokemonData(pokemonName)
    team.value.push(pokemonData)
  } catch (error) {
    console.error("Failed to add Pokemon to team:", error)
  } finally {
    isLoadingPokemon.value = false
  }
}

const removePokemonFromTeam = (index: number) => {
  team.value.splice(index, 1)
}

const saveTeam = () => {
  const teamData = {
    name: teamName.value,
    pokemon: team.value.map((p) => ({ id: p.id, name: p.name })),
    timestamp: new Date().toISOString(),
  }

  const teams = JSON.parse(localStorage.getItem("pokemonTeams") || "[]")
  teams.push(teamData)
  localStorage.setItem("pokemonTeams", JSON.stringify(teams))
}

const exportTeam = () => {
  const teamData = {
    name: teamName.value,
    pokemon: team.value.map((p) => ({ id: p.id, name: p.name })),
    timestamp: new Date().toISOString(),
  }

  const dataStr = JSON.stringify(teamData, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${teamName.value.replace(/\s+/g, "_")}_team.json`
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  loadPokemon()
})
</script>

<template>
  <div class="space-y-6">
    <div class="text-center space-y-4">
      <div class="relative">
        <div
          class="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 blur-3xl"
        ></div>
        <h1
          class="relative text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Team Builder
        </h1>
      </div>
      <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Create the perfect Pokemon team with type coverage analysis and strategic insights
      </p>
      <div class="flex justify-center gap-4">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <Users class="h-4 w-4 text-green-500" />
          <span>6 Pokemon Teams</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <Shield class="h-4 w-4 text-blue-500" />
          <span>Type Coverage</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <Target class="h-4 w-4 text-purple-500" />
          <span>Team Analysis</span>
        </div>
      </div>
    </div>

    <TeamHeader
      v-model:team-name="teamName"
      :team-length="team.length"
      @save-team="saveTeam"
      @export-team="exportTeam"
    />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 space-y-4">
        <PokemonSelector
          :all-pokemon="allPokemon"
          :is-loading="isLoading"
          :is-loading-pokemon="isLoadingPokemon"
          :team-length="team.length"
          :pokemon-types="pokemonTypes"
          @add-pokemon="addPokemonToTeam"
        />
      </div>

      <div class="lg:col-span-2 space-y-4">
        <TeamDisplay :team="team" @remove-pokemon="removePokemonFromTeam" />
        <TeamAnalysis :team="team" />
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <div class="flex items-center justify-center gap-2">
        <Skeleton class="h-8 w-8 rounded-full animate-spin" />
        <span class="text-gray-600 dark:text-gray-400">Loading Pokemon...</span>
      </div>
    </div>
  </div>
</template>
