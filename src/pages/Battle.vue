<script setup lang="ts">
import { Skeleton } from "@/components/ui/skeleton"
import {
  BattleControls,
  BattleLog,
  PokemonSelector,
  WinnerDisplay,
  calculateDamage,
} from "@/features/battle"
import type { Pokemon } from "@/lib/api"
import { pokemonApi } from "@/lib/api"
import { usePokemonStore } from "@/stores/pokemon"
import { Sword, Target, Zap } from "lucide-vue-next"
import { onMounted, ref } from "vue"

const store = usePokemonStore()

const pokemon1 = ref<Pokemon | null>(null)
const pokemon2 = ref<Pokemon | null>(null)
const allPokemon = ref<Array<{ name: string; url: string; id: number }>>([])
const isLoading = ref(false)
const isBattleInProgress = ref(false)
const battleLog = ref<string[]>([])
const currentTurn = ref(1)
const winner = ref<Pokemon | null>(null)

const pokemon1Stats = ref({
  currentHP: 0,
  maxHP: 0,
  attack: 0,
  defense: 0,
  speed: 0,
})

const pokemon2Stats = ref({
  currentHP: 0,
  maxHP: 0,
  attack: 0,
  defense: 0,
  speed: 0,
})

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

const handlePokemon1Select = async (pokemonName: string) => {
  try {
    const pokemonData = await loadPokemonData(pokemonName)
    pokemon1.value = pokemonData
  } catch (error) {
    console.error("Failed to load Pokemon 1:", error)
  }
}

const handlePokemon2Select = async (pokemonName: string) => {
  try {
    const pokemonData = await loadPokemonData(pokemonName)
    pokemon2.value = pokemonData
  } catch (error) {
    console.error("Failed to load Pokemon 2:", error)
  }
}

const initializeBattle = () => {
  if (!pokemon1.value || !pokemon2.value) return

  const p1 = pokemon1.value
  const p2 = pokemon2.value

  pokemon1Stats.value = {
    currentHP: p1.stats.find((s) => s.stat.name === "hp")?.base_stat || 100,
    maxHP: p1.stats.find((s) => s.stat.name === "hp")?.base_stat || 100,
    attack: p1.stats.find((s) => s.stat.name === "attack")?.base_stat || 50,
    defense: p1.stats.find((s) => s.stat.name === "defense")?.base_stat || 50,
    speed: p1.stats.find((s) => s.stat.name === "speed")?.base_stat || 50,
  }

  pokemon2Stats.value = {
    currentHP: p2.stats.find((s) => s.stat.name === "hp")?.base_stat || 100,
    maxHP: p2.stats.find((s) => s.stat.name === "hp")?.base_stat || 100,
    attack: p2.stats.find((s) => s.stat.name === "attack")?.base_stat || 50,
    defense: p2.stats.find((s) => s.stat.name === "defense")?.base_stat || 50,
    speed: p2.stats.find((s) => s.stat.name === "speed")?.base_stat || 50,
  }

  currentTurn.value = 1
  winner.value = null
  battleLog.value = [`Battle started! ${p1.name} vs ${p2.name}`]
}

const executeTurn = () => {
  if (!pokemon1.value || !pokemon2.value || winner.value) return

  const p1First = pokemon1Stats.value.speed >= pokemon2Stats.value.speed

  if (p1First) {
    const attack1 = calculateDamage(
      pokemon1.value,
      pokemon2.value,
      pokemon1Stats.value,
      pokemon2Stats.value
    )
    pokemon2Stats.value.currentHP = Math.max(0, pokemon2Stats.value.currentHP - attack1.damage)

    battleLog.value.push(
      `Turn ${currentTurn.value}: ${pokemon1.value.name} attacks ${pokemon2.value.name} for ${attack1.damage} damage! ${attack1.effectivenessText}`
    )

    if (pokemon2Stats.value.currentHP <= 0) {
      winner.value = pokemon1.value
      battleLog.value.push(`${pokemon1.value.name} wins the battle!`)
      return
    }

    const attack2 = calculateDamage(
      pokemon2.value,
      pokemon1.value,
      pokemon2Stats.value,
      pokemon1Stats.value
    )
    pokemon1Stats.value.currentHP = Math.max(0, pokemon1Stats.value.currentHP - attack2.damage)

    battleLog.value.push(
      `${pokemon2.value.name} attacks ${pokemon1.value.name} for ${attack2.damage} damage! ${attack2.effectivenessText}`
    )

    if (pokemon1Stats.value.currentHP <= 0) {
      winner.value = pokemon2.value
      battleLog.value.push(`${pokemon2.value.name} wins the battle!`)
      return
    }
  } else {
    const attack2 = calculateDamage(
      pokemon2.value,
      pokemon1.value,
      pokemon2Stats.value,
      pokemon1Stats.value
    )
    pokemon1Stats.value.currentHP = Math.max(0, pokemon1Stats.value.currentHP - attack2.damage)

    battleLog.value.push(
      `Turn ${currentTurn.value}: ${pokemon2.value.name} attacks ${pokemon1.value.name} for ${attack2.damage} damage! ${attack2.effectivenessText}`
    )

    if (pokemon1Stats.value.currentHP <= 0) {
      winner.value = pokemon2.value
      battleLog.value.push(`${pokemon2.value.name} wins the battle!`)
      return
    }

    const attack1 = calculateDamage(
      pokemon1.value,
      pokemon2.value,
      pokemon1Stats.value,
      pokemon2Stats.value
    )
    pokemon2Stats.value.currentHP = Math.max(0, pokemon2Stats.value.currentHP - attack1.damage)

    battleLog.value.push(
      `${pokemon1.value.name} attacks ${pokemon2.value.name} for ${attack1.damage} damage! ${attack1.effectivenessText}`
    )

    if (pokemon2Stats.value.currentHP <= 0) {
      winner.value = pokemon1.value
      battleLog.value.push(`${pokemon1.value.name} wins the battle!`)
      return
    }
  }

  currentTurn.value++
}

// Start battle
const startBattle = () => {
  if (!pokemon1.value || !pokemon2.value) return

  initializeBattle()
  isBattleInProgress.value = true

  const battleInterval = setInterval(() => {
    if (winner.value) {
      clearInterval(battleInterval)
      isBattleInProgress.value = false
      return
    }
    executeTurn()
  }, 1000)
}

const resetBattle = () => {
  isBattleInProgress.value = false
  winner.value = null
  battleLog.value = []
  currentTurn.value = 1
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
          class="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-3xl"
        ></div>
        <h1
          class="relative text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent"
        >
          Pokemon Battle Simulator
        </h1>
      </div>
      <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Choose two Pokemon and watch them battle it out in epic turn-based combat!
      </p>
      <div class="flex justify-center gap-4">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <Sword class="h-4 w-4 text-red-500" />
          <span>Type Effectiveness</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <Zap class="h-4 w-4 text-yellow-500" />
          <span>Real-time Stats</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <Target class="h-4 w-4 text-blue-500" />
          <span>Battle Log</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <PokemonSelector
        :all-pokemon="allPokemon"
        :is-loading="isLoading"
        :is-battle-in-progress="isBattleInProgress"
        :player-number="1"
        :selected-pokemon="pokemon1"
        :current-stats="pokemon1Stats"
        @select-pokemon="handlePokemon1Select"
      />

      <PokemonSelector
        :all-pokemon="allPokemon"
        :is-loading="isLoading"
        :is-battle-in-progress="isBattleInProgress"
        :player-number="2"
        :selected-pokemon="pokemon2"
        :current-stats="pokemon2Stats"
        @select-pokemon="handlePokemon2Select"
      />
    </div>

    <BattleControls
      :can-start-battle="!!pokemon1 && !!pokemon2"
      :is-battle-in-progress="isBattleInProgress"
      @start-battle="startBattle"
      @reset-battle="resetBattle"
    />

    <BattleLog :battle-log="battleLog" :current-turn="currentTurn" />

    <WinnerDisplay :winner="winner" :current-turn="currentTurn" />

    <div v-if="isLoading" class="text-center py-8">
      <div class="flex items-center justify-center gap-2">
        <Skeleton class="h-8 w-8 rounded-full animate-spin" />
        <span class="text-gray-600 dark:text-gray-400">Loading Pokemon list...</span>
      </div>
    </div>
  </div>
</template>
