<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Pokemon } from "@/lib/api"
import { ArrowRight, Heart, Star, Target, Zap } from "lucide-vue-next"
import { computed } from "vue"
import EvolutionChain from "../features/explorer/EvolutionChain.vue"

interface Props {
  pokemon: Pokemon | null
  isOpen: boolean
  isFavorite: boolean
  onClose: () => void
  onToggleFavorite: (pokemonId: number) => void
}

const props = defineProps<Props>()

const typeColors = {
  normal: "bg-gray-400",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-cyan-300",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-green-400",
  rock: "bg-yellow-700",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-700",
  dark: "bg-gray-700",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
}

const getTypeColor = (typeName: string) => {
  return typeColors[typeName as keyof typeof typeColors] || "bg-gray-400"
}

const pokemonImage = computed(() => {
  if (!props.pokemon) return ""
  return (
    props.pokemon.sprites.other["official-artwork"].front_default ||
    props.pokemon.sprites.front_default ||
    "/pokemon-placeholder.png"
  )
})

const shinyImage = computed(() => {
  if (!props.pokemon) return ""
  return props.pokemon.sprites.front_shiny || ""
})

const totalStats = computed(() => {
  if (!props.pokemon) return 0
  return props.pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)
})

const averageStats = computed(() => {
  if (!props.pokemon) return 0
  return Math.round(totalStats.value / props.pokemon.stats.length)
})

const handleToggleFavorite = () => {
  if (props.pokemon) {
    props.onToggleFavorite(props.pokemon.id)
  }
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="onClose">
    <DialogContent class="min-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl font-bold capitalize">{{ pokemon?.name }}</span>
            <Badge variant="secondary" class="text-sm font-mono">
              #{{ pokemon?.id.toString().padStart(3, "0") }}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" @click="handleToggleFavorite" class="h-8 w-8">
            <Heart
              :class="[
                'h-5 w-5 transition-colors duration-200',
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500',
              ]"
            />
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div v-if="pokemon" class="space-y-6">
        <!-- Pokemon Image and Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Image Section -->
          <div class="space-y-4">
            <div class="relative">
              <img
                :src="pokemonImage"
                :alt="pokemon.name"
                class="w-full h-64 object-contain bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg"
              />
              <Star
                v-if="shinyImage"
                class="absolute top-2 right-2 h-6 w-6 text-yellow-400 fill-yellow-400"
              />
            </div>

            <!-- Types -->
            <div class="flex justify-center gap-2">
              <Badge
                v-for="type in pokemon.types"
                :key="type.type.name"
                :class="[
                  'text-white font-medium px-3 py-1 text-sm capitalize',
                  getTypeColor(type.type.name),
                ]"
              >
                {{ type.type.name }}
              </Badge>
            </div>
          </div>

          <!-- Basic Info -->
          <div class="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Height</div>
                    <div class="font-semibold">{{ (pokemon.height / 10).toFixed(1) }}m</div>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Weight</div>
                    <div class="font-semibold">{{ (pokemon.weight / 10).toFixed(1) }}kg</div>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Base Experience</div>
                    <div class="font-semibold">{{ pokemon.base_experience }}</div>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Total Stats</div>
                    <div class="font-semibold">{{ totalStats }}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Abilities -->
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">Abilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-2">
                  <div
                    v-for="ability in pokemon.abilities"
                    :key="ability.ability.name"
                    class="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <span class="capitalize font-medium">{{
                      ability.ability.name.replace("-", " ")
                    }}</span>
                    <Badge v-if="ability.is_hidden" variant="secondary" class="text-xs">
                      Hidden
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- Tabs for Detailed Info -->
        <Tabs default-value="stats" class="w-full">
          <TabsList class="grid w-full grid-cols-3">
            <TabsTrigger value="stats" class="flex items-center gap-2">
              <Zap class="h-4 w-4" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="moves" class="flex items-center gap-2">
              <Target class="h-4 w-4" />
              Moves
            </TabsTrigger>
            <TabsTrigger value="evolution" class="flex items-center gap-2">
              <ArrowRight class="h-4 w-4" />
              Evolution
            </TabsTrigger>
          </TabsList>

          <!-- Stats Tab -->
          <TabsContent value="stats" class="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">Base Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-4">
                  <div v-for="stat in pokemon.stats" :key="stat.stat.name" class="space-y-2">
                    <div class="flex justify-between items-center">
                      <span class="capitalize font-medium text-sm">
                        {{ stat.stat.name.replace("-", " ") }}
                      </span>
                      <span class="text-sm font-semibold">{{ stat.base_stat }}</span>
                    </div>
                    <Progress :value="(stat.base_stat / 255) * 100" class="h-2" />
                  </div>

                  <Separator />

                  <div class="grid grid-cols-2 gap-4 pt-2">
                    <div class="text-center">
                      <div class="text-2xl font-bold text-blue-600">{{ totalStats }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">Total</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-green-600">{{ averageStats }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">Average</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <!-- Moves Tab -->
          <TabsContent value="moves" class="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">Available Moves</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  <div
                    v-for="move in pokemon.moves?.slice(0, 20)"
                    :key="move.move.name"
                    class="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm capitalize"
                  >
                    {{ move.move.name.replace("-", " ") }}
                  </div>
                </div>
                <div v-if="pokemon.moves && pokemon.moves.length > 20" class="text-center pt-2">
                  <p class="text-sm text-gray-500">
                    And {{ pokemon.moves.length - 20 }} more moves...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <!-- Evolution Tab -->
          <TabsContent value="evolution" class="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">Evolution Chain</CardTitle>
              </CardHeader>
              <CardContent>
                <EvolutionChain :pokemon-name="pokemon.name" :current-pokemon-id="pokemon.id" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DialogContent>
  </Dialog>
</template>
