<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import type { Pokemon } from "@/lib/api"
import { pokemonApi } from "@/lib/api"
import { usePokemonStore } from "@/stores/pokemon"
import { Play, RefreshCw, Shield, Sword, Target, Zap } from "lucide-vue-next"
import { onMounted, ref } from "vue"

const store = usePokemonStore()

// Battle state
const pokemon1 = ref<Pokemon | null>(null)
const pokemon2 = ref<Pokemon | null>(null)
const allPokemon = ref<Array<{ name: string; url: string; id: number }>>([])
const isLoading = ref(false)
const isLoadingPokemon1 = ref(false)
const isLoadingPokemon2 = ref(false)
const isBattleInProgress = ref(false)
const battleLog = ref<string[]>([])
const currentTurn = ref(1)
const winner = ref<Pokemon | null>(null)

// Pokemon stats for battle
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

// Load Pokemon list (just names and IDs)
const loadPokemon = async () => {
  isLoading.value = true
  try {
    const response = await pokemonApi.getPokemonList(151, 0) // First 151 Pokemon
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

// Type effectiveness chart
const typeEffectiveness = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    steel: 2,
    fairy: 0.5,
  },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

// Calculate type effectiveness
const calculateTypeEffectiveness = (attackerType: string, defenderTypes: string[]) => {
  let effectiveness = 1

  defenderTypes.forEach((defenderType) => {
    const typeChart = typeEffectiveness[attackerType as keyof typeof typeEffectiveness]
    if (typeChart && typeChart[defenderType as keyof typeof typeChart]) {
      effectiveness *= typeChart[defenderType as keyof typeof typeChart]
    }
  })

  return effectiveness
}

// Get effectiveness text
const getEffectivenessText = (effectiveness: number) => {
  if (effectiveness >= 2) return "Super effective!"
  if (effectiveness === 1) return "Normal effectiveness"
  if (effectiveness === 0) return "No effect!"
  return "Not very effective..."
}

// Get effectiveness color
const getEffectivenessColor = (effectiveness: number) => {
  if (effectiveness >= 2) return "text-green-600"
  if (effectiveness === 1) return "text-gray-600"
  if (effectiveness === 0) return "text-red-600"
  return "text-orange-600"
}

// Initialize battle
const initializeBattle = () => {
  if (!pokemon1.value || !pokemon2.value) return

  // Set initial stats
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

// Calculate damage
const calculateDamage = (
  attacker: Pokemon,
  defender: Pokemon,
  attackerStats: any,
  defenderStats: any
) => {
  const baseDamage = (((2 * 50) / 5 + 2) * attackerStats.attack) / defenderStats.defense / 50 + 2
  const randomFactor = 0.85 + Math.random() * 0.15 // 85-100% random factor

  // Calculate type effectiveness
  const attackerType = attacker.types[0].type.name
  const defenderTypes = defender.types.map((t) => t.type.name)
  const effectiveness = calculateTypeEffectiveness(attackerType, defenderTypes)

  const finalDamage = Math.floor(baseDamage * randomFactor * effectiveness)

  return {
    damage: finalDamage,
    effectiveness,
    effectivenessText: getEffectivenessText(effectiveness),
    effectivenessColor: getEffectivenessColor(effectiveness),
  }
}

// Execute battle turn
const executeTurn = () => {
  if (!pokemon1.value || !pokemon2.value || winner.value) return

  // Determine who goes first based on speed
  const p1First = pokemon1Stats.value.speed >= pokemon2Stats.value.speed

  if (p1First) {
    // Pokemon 1 attacks first
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

    // Pokemon 2 attacks back
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
    // Pokemon 2 attacks first
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

    // Pokemon 1 attacks back
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

  // Auto-battle until someone wins
  const battleInterval = setInterval(() => {
    if (winner.value) {
      clearInterval(battleInterval)
      isBattleInProgress.value = false
      return
    }
    executeTurn()
  }, 1000)
}

// Load individual Pokemon data
const loadPokemonData = async (pokemonName: string): Promise<Pokemon> => {
  try {
    return await pokemonApi.getPokemon(pokemonName)
  } catch (error) {
    console.error(`Failed to load Pokemon ${pokemonName}:`, error)
    throw error
  }
}

// Handle Pokemon selection
const handlePokemon1Select = async (pokemonName: string) => {
  isLoadingPokemon1.value = true
  try {
    const pokemonData = await loadPokemonData(pokemonName)
    pokemon1.value = pokemonData
  } catch (error) {
    console.error("Failed to load Pokemon 1:", error)
  } finally {
    isLoadingPokemon1.value = false
  }
}

const handlePokemon2Select = async (pokemonName: string) => {
  isLoadingPokemon2.value = true
  try {
    const pokemonData = await loadPokemonData(pokemonName)
    pokemon2.value = pokemonData
  } catch (error) {
    console.error("Failed to load Pokemon 2:", error)
  } finally {
    isLoadingPokemon2.value = false
  }
}

// Reset battle
const resetBattle = () => {
  isBattleInProgress.value = false
  winner.value = null
  battleLog.value = []
  currentTurn.value = 1
}

// Load Pokemon on mount
onMounted(() => {
  loadPokemon()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
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

    <!-- Pokemon Selection -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Pokemon 1 Selection -->
      <Card
        class="border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300 hover:shadow-lg"
      >
        <CardHeader
          class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950"
        >
          <CardTitle class="flex items-center gap-2 text-red-700 dark:text-red-300">
            <Sword class="h-6 w-6 text-red-500" />
            Pokemon 1
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <Select @update:model-value="handlePokemon1Select" :disabled="isBattleInProgress">
            <SelectTrigger
              class="bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
            >
              <SelectValue placeholder="Choose Pokemon 1" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="pokemon in allPokemon"
                :key="pokemon.id"
                :value="pokemon.name"
                class="flex items-center gap-2"
              >
                <span class="capitalize">{{ pokemon.name }}</span>
                <Badge variant="secondary" class="text-xs">
                  #{{ pokemon.id.toString().padStart(3, "0") }}
                </Badge>
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- Pokemon 1 Display -->
          <div v-if="isLoadingPokemon1" class="space-y-3">
            <div class="flex items-center gap-3">
              <Skeleton class="w-20 h-20 rounded-lg" />
              <div class="space-y-2">
                <Skeleton class="h-6 w-24" />
                <div class="flex gap-1">
                  <Skeleton class="h-5 w-12" />
                  <Skeleton class="h-5 w-12" />
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="pokemon1" class="space-y-4">
            <div
              class="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-lg border border-red-200 dark:border-red-800"
            >
              <div class="relative">
                <img
                  :src="
                    pokemon1.sprites.other['official-artwork'].front_default ||
                    pokemon1.sprites.front_default
                  "
                  :alt="pokemon1.name"
                  class="w-24 h-24 object-contain drop-shadow-lg"
                />
                <div
                  class="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                >
                  #{{ pokemon1.id.toString().padStart(3, "0") }}
                </div>
              </div>
              <div class="space-y-2">
                <h3 class="text-xl font-bold capitalize text-red-700 dark:text-red-300">
                  {{ pokemon1.name }}
                </h3>
                <div class="flex gap-2">
                  <Badge
                    v-for="type in pokemon1.types"
                    :key="type.type.name"
                    class="text-xs capitalize font-semibold px-3 py-1"
                  >
                    {{ type.type.name }}
                  </Badge>
                </div>
              </div>
            </div>

            <!-- Battle Stats -->
            <div
              v-if="pokemon1Stats.maxHP > 0"
              class="space-y-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800"
            >
              <div class="flex items-center gap-2 mb-2">
                <Heart class="h-4 w-4 text-red-500" />
                <span class="font-semibold text-red-700 dark:text-red-300">Battle Stats</span>
              </div>
              <div class="space-y-3">
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="font-medium">HP</span>
                    <span class="font-bold"
                      >{{ pokemon1Stats.currentHP }}/{{ pokemon1Stats.maxHP }}</span
                    >
                  </div>
                  <Progress
                    :value="(pokemon1Stats.currentHP / pokemon1Stats.maxHP) * 100"
                    class="h-3 bg-red-100 dark:bg-red-900"
                  />
                </div>
                <div class="grid grid-cols-3 gap-4 text-xs">
                  <div class="text-center">
                    <div class="font-bold text-red-600">{{ pokemon1Stats.attack }}</div>
                    <div class="text-gray-500">Attack</div>
                  </div>
                  <div class="text-center">
                    <div class="font-bold text-blue-600">{{ pokemon1Stats.defense }}</div>
                    <div class="text-gray-500">Defense</div>
                  </div>
                  <div class="text-center">
                    <div class="font-bold text-green-600">{{ pokemon1Stats.speed }}</div>
                    <div class="text-gray-500">Speed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Pokemon 2 Selection -->
      <Card
        class="border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-lg"
      >
        <CardHeader
          class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950"
        >
          <CardTitle class="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Shield class="h-6 w-6 text-blue-500" />
            Pokemon 2
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <Select @update:model-value="handlePokemon2Select" :disabled="isBattleInProgress">
            <SelectTrigger
              class="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
            >
              <SelectValue placeholder="Choose Pokemon 2" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="pokemon in allPokemon"
                :key="pokemon.id"
                :value="pokemon.name"
                class="flex items-center gap-2"
              >
                <span class="capitalize">{{ pokemon.name }}</span>
                <Badge variant="secondary" class="text-xs">
                  #{{ pokemon.id.toString().padStart(3, "0") }}
                </Badge>
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- Pokemon 2 Display -->
          <div v-if="isLoadingPokemon2" class="space-y-3">
            <div class="flex items-center gap-3">
              <Skeleton class="w-20 h-20 rounded-lg" />
              <div class="space-y-2">
                <Skeleton class="h-6 w-24" />
                <div class="flex gap-1">
                  <Skeleton class="h-5 w-12" />
                  <Skeleton class="h-5 w-12" />
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="pokemon2" class="space-y-4">
            <div
              class="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div class="relative">
                <img
                  :src="
                    pokemon2.sprites.other['official-artwork'].front_default ||
                    pokemon2.sprites.front_default
                  "
                  :alt="pokemon2.name"
                  class="w-24 h-24 object-contain drop-shadow-lg"
                />
                <div
                  class="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                >
                  #{{ pokemon2.id.toString().padStart(3, "0") }}
                </div>
              </div>
              <div class="space-y-2">
                <h3 class="text-xl font-bold capitalize text-blue-700 dark:text-blue-300">
                  {{ pokemon2.name }}
                </h3>
                <div class="flex gap-2">
                  <Badge
                    v-for="type in pokemon2.types"
                    :key="type.type.name"
                    class="text-xs capitalize font-semibold px-3 py-1"
                  >
                    {{ type.type.name }}
                  </Badge>
                </div>
              </div>
            </div>

            <!-- Battle Stats -->
            <div
              v-if="pokemon2Stats.maxHP > 0"
              class="space-y-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div class="flex items-center gap-2 mb-2">
                <Heart class="h-4 w-4 text-blue-500" />
                <span class="font-semibold text-blue-700 dark:text-blue-300">Battle Stats</span>
              </div>
              <div class="space-y-3">
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="font-medium">HP</span>
                    <span class="font-bold"
                      >{{ pokemon2Stats.currentHP }}/{{ pokemon2Stats.maxHP }}</span
                    >
                  </div>
                  <Progress
                    :value="(pokemon2Stats.currentHP / pokemon2Stats.maxHP) * 100"
                    class="h-3 bg-blue-100 dark:bg-blue-900"
                  />
                </div>
                <div class="grid grid-cols-3 gap-4 text-xs">
                  <div class="text-center">
                    <div class="font-bold text-red-600">{{ pokemon2Stats.attack }}</div>
                    <div class="text-gray-500">Attack</div>
                  </div>
                  <div class="text-center">
                    <div class="font-bold text-blue-600">{{ pokemon2Stats.defense }}</div>
                    <div class="text-gray-500">Defense</div>
                  </div>
                  <div class="text-center">
                    <div class="font-bold text-green-600">{{ pokemon2Stats.speed }}</div>
                    <div class="text-gray-500">Speed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Battle Controls -->
    <div class="flex justify-center gap-6">
      <Button
        @click="startBattle"
        :disabled="!pokemon1 || !pokemon2 || isBattleInProgress"
        class="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <Play class="h-5 w-5 mr-2" />
        Start Battle
      </Button>
      <Button
        @click="resetBattle"
        variant="outline"
        class="border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 font-bold px-6 py-3 text-lg transition-all duration-300"
      >
        <RefreshCw class="h-5 w-5 mr-2" />
        Reset
      </Button>
    </div>

    <!-- Battle Log -->
    <Card v-if="battleLog.length > 0" class="border-2 border-purple-200 dark:border-purple-800">
      <CardHeader
        class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950"
      >
        <CardTitle class="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <Target class="h-6 w-6 text-purple-500" />
          Battle Log
          <Badge
            v-if="currentTurn > 1"
            variant="secondary"
            class="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
          >
            Turn {{ currentTurn - 1 }}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent class="p-0">
        <div class="max-h-64 overflow-y-auto space-y-1 p-4">
          <div
            v-for="(log, index) in battleLog"
            :key="index"
            class="text-sm p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 border border-purple-200 dark:border-purple-800 shadow-sm"
          >
            <span class="font-medium text-purple-700 dark:text-purple-300">{{ log }}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Winner Display -->
    <div v-if="winner" class="text-center">
      <Card class="max-w-lg mx-auto border-2 border-green-200 dark:border-green-800">
        <CardContent class="pt-8 pb-8">
          <div class="space-y-6">
            <div class="relative">
              <div
                class="absolute inset-0 bg-gradient-to-r from-green-500/20 to-yellow-500/20 blur-3xl"
              ></div>
              <Zap class="relative h-16 w-16 mx-auto text-yellow-500 animate-pulse" />
            </div>
            <div class="space-y-2">
              <h2
                class="text-3xl font-bold bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent"
              >
                {{ winner.name.toUpperCase() }} WINS!
              </h2>
              <p class="text-lg text-gray-600 dark:text-gray-400">
                The battle has ended after {{ currentTurn - 1 }} turns!
              </p>
            </div>
            <div class="relative">
              <img
                :src="
                  winner.sprites.other['official-artwork'].front_default ||
                  winner.sprites.front_default
                "
                :alt="winner.name"
                class="w-40 h-40 mx-auto object-contain drop-shadow-2xl animate-bounce"
              />
              <div
                class="absolute -top-4 -right-4 bg-green-500 text-white text-sm px-3 py-1 rounded-full font-bold animate-pulse"
              >
                WINNER
              </div>
            </div>
            <div class="flex justify-center gap-4">
              <Badge class="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Heart class="h-3 w-3 mr-1" />
                Champion
              </Badge>
              <Badge class="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                <Zap class="h-3 w-3 mr-1" />
                Victorious
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="flex items-center justify-center gap-2">
        <Skeleton class="h-8 w-8 rounded-full animate-spin" />
        <span class="text-gray-600 dark:text-gray-400">Loading Pokemon list...</span>
      </div>
    </div>
  </div>
</template>
