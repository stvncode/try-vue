<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Pokemon } from "@/lib/api"
import { pokemonApi } from "@/lib/api"
import { usePokemonStore } from "@/stores/pokemon"
import {
  AlertCircle,
  CheckCircle,
  Download,
  Heart,
  Plus,
  Save,
  Search,
  Shield,
  Sword,
  Target,
  Trash2,
  Users,
  Zap,
} from "lucide-vue-next"
import { computed, onMounted, ref } from "vue"

const store = usePokemonStore()

// Team state
const teamName = ref("My Pokemon Team")
const team = ref<Pokemon[]>([])
const allPokemon = ref<Array<{ name: string; url: string; id: number }>>([])
const isLoading = ref(false)
const isLoadingPokemon = ref(false)
const searchQuery = ref("")
const selectedType = ref("")

// Pokemon types for filtering
const pokemonTypes = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
]

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

// Load Pokemon list
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

// Load individual Pokemon data
const loadPokemonData = async (pokemonName: string): Promise<Pokemon> => {
  try {
    return await pokemonApi.getPokemon(pokemonName)
  } catch (error) {
    console.error(`Failed to load Pokemon ${pokemonName}:`, error)
    throw error
  }
}

// Add Pokemon to team
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

// Remove Pokemon from team
const removePokemonFromTeam = (index: number) => {
  team.value.splice(index, 1)
}

// Move Pokemon in team
const movePokemon = (fromIndex: number, toIndex: number) => {
  const pokemon = team.value[fromIndex]
  team.value.splice(fromIndex, 1)
  team.value.splice(toIndex, 0, pokemon)
}

// Filter Pokemon
const filteredPokemon = computed(() => {
  let filtered = allPokemon.value

  if (searchQuery.value) {
    filtered = filtered.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedType.value) {
    // For now, we'll filter by name containing the type
    // In a real implementation, you'd want to load Pokemon data to filter by actual types
    filtered = filtered.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(selectedType.value.toLowerCase())
    )
  }

  return filtered.slice(0, 50) // Limit to first 50 results for performance
})

// Team analysis
const teamAnalysis = computed(() => {
  if (team.value.length === 0) return null

  const allTypes = team.value.flatMap((pokemon) => pokemon.types.map((type) => type.type.name))

  const typeCounts = allTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate type coverage
  const coverage = pokemonTypes.map((type) => {
    const effectiveness = pokemonTypes.map((defenderType) => {
      const typeChart = typeEffectiveness[type as keyof typeof typeEffectiveness]
      return typeChart && typeChart[defenderType as keyof typeof typeChart]
        ? typeChart[defenderType as keyof typeof typeChart]
        : 1
    })

    const superEffective = effectiveness.filter((eff) => eff >= 2).length
    const notVeryEffective = effectiveness.filter((eff) => eff <= 0.5).length

    return {
      type,
      superEffective,
      notVeryEffective,
      coverage: (superEffective / pokemonTypes.length) * 100,
    }
  })

  // Calculate team weaknesses
  const weaknesses = pokemonTypes
    .map((type) => {
      let weaknessCount = 0
      team.value.forEach((pokemon) => {
        pokemon.types.forEach((pokemonType) => {
          const typeChart = typeEffectiveness[type as keyof typeof typeEffectiveness]
          if (typeChart && typeChart[pokemonType.type.name as keyof typeof typeChart] === 2) {
            weaknessCount++
          }
        })
      })
      return { type, count: weaknessCount }
    })
    .filter((w) => w.count > 0)
    .sort((a, b) => b.count - a.count)

  return {
    typeCounts,
    coverage,
    weaknesses,
    totalPokemon: team.value.length,
    averageStats:
      team.value.length > 0
        ? {
            hp: Math.round(
              team.value.reduce(
                (sum, p) => sum + (p.stats.find((s) => s.stat.name === "hp")?.base_stat || 0),
                0
              ) / team.value.length
            ),
            attack: Math.round(
              team.value.reduce(
                (sum, p) => sum + (p.stats.find((s) => s.stat.name === "attack")?.base_stat || 0),
                0
              ) / team.value.length
            ),
            defense: Math.round(
              team.value.reduce(
                (sum, p) => sum + (p.stats.find((s) => s.stat.name === "defense")?.base_stat || 0),
                0
              ) / team.value.length
            ),
            speed: Math.round(
              team.value.reduce(
                (sum, p) => sum + (p.stats.find((s) => s.stat.name === "speed")?.base_stat || 0),
                0
              ) / team.value.length
            ),
          }
        : null,
  }
})

// Save team
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

// Load team
const loadTeam = (teamData: any) => {
  teamName.value = teamData.name
  // In a real implementation, you'd load the full Pokemon data
  // For now, we'll just show the names
}

// Clear filters
const clearFilters = () => {
  searchQuery.value = ""
  selectedType.value = ""
}

// Get type color
const getTypeColor = (typeName: string) => {
  const colors: Record<string, string> = {
    normal: "bg-gray-500",
    fire: "bg-red-500",
    water: "bg-blue-500",
    electric: "bg-yellow-500",
    grass: "bg-green-500",
    ice: "bg-cyan-500",
    fighting: "bg-orange-500",
    poison: "bg-purple-500",
    ground: "bg-yellow-600",
    flying: "bg-indigo-500",
    psychic: "bg-pink-500",
    bug: "bg-lime-500",
    rock: "bg-yellow-700",
    ghost: "bg-purple-600",
    dragon: "bg-indigo-600",
    dark: "bg-gray-700",
    steel: "bg-gray-400",
    fairy: "bg-pink-400",
  }
  return colors[typeName] || "bg-gray-500"
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

    <!-- Team Name and Actions -->
    <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div class="flex items-center gap-4">
        <Input v-model="teamName" placeholder="Team Name" class="w-64 text-lg font-semibold" />
        <Badge variant="secondary" class="text-sm"> {{ team.length }}/6 Pokemon </Badge>
      </div>
      <div class="flex gap-2">
        <Button
          @click="saveTeam"
          variant="outline"
          class="border-green-200 text-green-700 hover:bg-green-50"
        >
          <Save class="h-4 w-4 mr-2" />
          Save Team
        </Button>
        <Button variant="outline" class="border-blue-200 text-blue-700 hover:bg-blue-50">
          <Download class="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Pokemon Selection -->
      <div class="lg:col-span-1 space-y-4">
        <Card class="border-2 border-green-200 dark:border-green-800">
          <CardHeader
            class="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950"
          >
            <CardTitle class="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Plus class="h-5 w-5 text-green-500" />
              Add Pokemon
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- Search and Filter -->
            <div class="space-y-3">
              <div class="relative">
                <Search
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                />
                <Input v-model="searchQuery" placeholder="Search Pokemon..." class="pl-10" />
              </div>
              <Select v-model="selectedType">
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem
                    v-for="type in pokemonTypes"
                    :key="type"
                    :value="type"
                    class="capitalize"
                  >
                    {{ type }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Pokemon List -->
            <div class="max-h-96 overflow-y-auto space-y-2">
              <!-- Debug info -->
              <div class="text-xs text-gray-500 mb-2">
                Total Pokemon loaded: {{ allPokemon.length }}
                <span v-if="searchQuery || selectedType">
                  | Showing {{ filteredPokemon.length }} results
                  <span v-if="searchQuery">for "{{ searchQuery }}"</span>
                  <span v-if="selectedType">filtered by {{ selectedType }}</span>
                </span>
              </div>

              <!-- No results message -->
              <div
                v-if="filteredPokemon.length === 0 && (searchQuery || selectedType)"
                class="text-center py-8"
              >
                <Search class="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p class="text-gray-500 text-sm">No Pokemon found</p>
                <Button @click="clearFilters" variant="ghost" size="sm" class="mt-2">
                  Clear filters
                </Button>
              </div>

              <!-- Pokemon list -->
              <div
                v-for="pokemon in filteredPokemon"
                :key="pokemon.id"
                @click="addPokemonToTeam(pokemon.name)"
                class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                :class="{ 'opacity-50 cursor-not-allowed': team.length >= 6 }"
              >
                <div
                  class="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
                >
                  <span class="text-xs font-bold text-gray-500"
                    >#{{ pokemon.id.toString().padStart(3, "0") }}</span
                  >
                </div>
                <div class="flex-1">
                  <div class="font-semibold capitalize">{{ pokemon.name }}</div>
                </div>
                <Plus class="h-4 w-4 text-green-500" />
              </div>

              <!-- Loading more indicator -->
              <div v-if="isLoadingPokemon" class="text-center py-4">
                <Skeleton class="h-4 w-4 mx-auto rounded-full animate-spin" />
                <p class="text-xs text-gray-500 mt-1">Loading Pokemon...</p>
              </div>

              <!-- Initial loading state -->
              <div v-if="isLoading" class="text-center py-8">
                <Skeleton class="h-8 w-8 mx-auto rounded-full animate-spin" />
                <p class="text-sm text-gray-500 mt-2">Loading Pokemon list...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Team Display -->
      <div class="lg:col-span-2 space-y-4">
        <Card class="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader
            class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950"
          >
            <CardTitle class="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Users class="h-5 w-5 text-blue-500" />
              Your Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="team.length === 0" class="text-center py-12">
              <Users class="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p class="text-gray-500">
                No Pokemon in your team yet. Add some Pokemon to get started!
              </p>
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="(pokemon, index) in team" :key="pokemon.id" class="relative group">
                <Card
                  class="border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
                >
                  <CardContent class="p-4">
                    <div class="flex items-center gap-3">
                      <div class="relative">
                        <img
                          :src="
                            pokemon.sprites.other['official-artwork'].front_default ||
                            pokemon.sprites.front_default
                          "
                          :alt="pokemon.name"
                          class="w-16 h-16 object-contain"
                        />
                        <div
                          class="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-full font-bold"
                        >
                          {{ index + 1 }}
                        </div>
                      </div>
                      <div class="flex-1">
                        <h3 class="font-semibold capitalize text-blue-700 dark:text-blue-300">
                          {{ pokemon.name }}
                        </h3>
                        <div class="flex gap-1 mt-1">
                          <Badge
                            v-for="type in pokemon.types"
                            :key="type.type.name"
                            :class="getTypeColor(type.type.name)"
                            class="text-xs capitalize text-white"
                          >
                            {{ type.type.name }}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        @click="removePokemonFromTeam(index)"
                        variant="ghost"
                        size="sm"
                        class="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 class="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Team Analysis -->
        <Card v-if="teamAnalysis" class="border-2 border-purple-200 dark:border-purple-800">
          <CardHeader
            class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950"
          >
            <CardTitle class="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Target class="h-5 w-5 text-purple-500" />
              Team Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs default-value="coverage" class="w-full">
              <TabsList class="grid w-full grid-cols-3">
                <TabsTrigger value="coverage">Type Coverage</TabsTrigger>
                <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
                <TabsTrigger value="stats">Team Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="coverage" class="space-y-4">
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  <div
                    v-for="type in pokemonTypes"
                    :key="type"
                    class="p-3 rounded-lg border text-center"
                    :class="
                      teamAnalysis.typeCounts[type]
                        ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800'
                    "
                  >
                    <Badge :class="getTypeColor(type)" class="text-white text-xs mb-2">
                      {{ type }}
                    </Badge>
                    <div class="text-sm font-semibold">
                      {{ teamAnalysis.typeCounts[type] || 0 }} Pokemon
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="weaknesses" class="space-y-4">
                <div v-if="teamAnalysis.weaknesses.length === 0" class="text-center py-8">
                  <CheckCircle class="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p class="text-green-600 font-semibold">Great! No major weaknesses detected.</p>
                </div>
                <div v-else class="space-y-3">
                  <div
                    v-for="weakness in teamAnalysis.weaknesses.slice(0, 5)"
                    :key="weakness.type"
                    class="flex items-center justify-between p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"
                  >
                    <div class="flex items-center gap-2">
                      <Badge :class="getTypeColor(weakness.type)" class="text-white text-xs">
                        {{ weakness.type }}
                      </Badge>
                      <span class="text-sm font-medium"
                        >Super Effective vs {{ weakness.count }} Pokemon</span
                      >
                    </div>
                    <AlertCircle class="h-4 w-4 text-red-500" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stats" class="space-y-4">
                <div v-if="teamAnalysis.averageStats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    class="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
                  >
                    <Heart class="h-6 w-6 mx-auto text-red-500 mb-2" />
                    <div class="text-2xl font-bold text-red-600">
                      {{ teamAnalysis.averageStats.hp }}
                    </div>
                    <div class="text-sm text-gray-600">Avg HP</div>
                  </div>
                  <div
                    class="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800"
                  >
                    <Sword class="h-6 w-6 mx-auto text-orange-500 mb-2" />
                    <div class="text-2xl font-bold text-orange-600">
                      {{ teamAnalysis.averageStats.attack }}
                    </div>
                    <div class="text-sm text-gray-600">Avg Attack</div>
                  </div>
                  <div
                    class="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
                  >
                    <Shield class="h-6 w-6 mx-auto text-blue-500 mb-2" />
                    <div class="text-2xl font-bold text-blue-600">
                      {{ teamAnalysis.averageStats.defense }}
                    </div>
                    <div class="text-sm text-gray-600">Avg Defense</div>
                  </div>
                  <div
                    class="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                  >
                    <Zap class="h-6 w-6 mx-auto text-green-500 mb-2" />
                    <div class="text-2xl font-bold text-green-600">
                      {{ teamAnalysis.averageStats.speed }}
                    </div>
                    <div class="text-sm text-gray-600">Avg Speed</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="flex items-center justify-center gap-2">
        <Skeleton class="h-8 w-8 rounded-full animate-spin" />
        <span class="text-gray-600 dark:text-gray-400">Loading Pokemon...</span>
      </div>
    </div>
  </div>
</template>
