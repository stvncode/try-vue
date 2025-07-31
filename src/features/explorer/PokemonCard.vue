<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Pokemon } from "@/lib/api"
import { Heart, Star } from "lucide-vue-next"
import { computed } from "vue"

interface Props {
  pokemon: Pokemon
  isFavorite?: boolean
  onToggleFavorite?: (pokemonId: number) => void
  onClick?: (pokemon: Pokemon) => void
}

const props = withDefaults(defineProps<Props>(), {
  isFavorite: false,
})

const emit = defineEmits<{
  toggleFavorite: [pokemonId: number]
  click: [pokemon: Pokemon]
}>()

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
  return (
    props.pokemon.sprites.other["official-artwork"].front_default ||
    props.pokemon.sprites.front_default ||
    "/pokemon-placeholder.png"
  )
})

const handleToggleFavorite = () => {
  emit("toggleFavorite", props.pokemon.id)
}

const handleClick = () => {
  emit("click", props.pokemon)
}
</script>

<template>
  <Card
    class="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 hover:border-primary/50"
    @click="handleClick"
  >
    <!-- Favorite Button -->
    <Button
      variant="ghost"
      size="icon"
      class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800"
      @click.stop="handleToggleFavorite"
    >
      <Heart
        :class="[
          'h-4 w-4 transition-colors duration-200',
          isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500',
        ]"
      />
    </Button>

    <!-- Pokemon Number -->
    <div class="absolute top-2 left-2 z-10">
      <Badge variant="secondary" class="text-xs font-mono">
        #{{ pokemon.id.toString().padStart(3, "0") }}
      </Badge>
    </div>

    <CardHeader class="pb-2">
      <div class="flex flex-col items-center space-y-2">
        <!-- Pokemon Image -->
        <div class="relative w-32 h-32 mx-auto">
          <img
            :src="pokemonImage"
            :alt="pokemon.name"
            class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <!-- Shiny indicator -->
          <Star
            v-if="pokemon.sprites.front_shiny"
            class="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 fill-yellow-400"
          />
        </div>

        <!-- Pokemon Name -->
        <h3 class="text-lg font-bold text-center capitalize text-gray-800 dark:text-gray-200">
          {{ pokemon.name }}
        </h3>
      </div>
    </CardHeader>

    <CardContent class="pt-0">
      <!-- Types -->
      <div class="flex justify-center gap-2 mb-3">
        <Badge
          v-for="type in pokemon.types"
          :key="type.type.name"
          :class="[
            'text-white font-medium px-2 py-1 text-xs capitalize',
            getTypeColor(type.type.name),
          ]"
        >
          {{ type.type.name }}
        </Badge>
      </div>

      <!-- Stats Preview -->
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="text-center">
          <div class="text-gray-500 dark:text-gray-400">Height</div>
          <div class="font-semibold">{{ (pokemon.height / 10).toFixed(1) }}m</div>
        </div>
        <div class="text-center">
          <div class="text-gray-500 dark:text-gray-400">Weight</div>
          <div class="font-semibold">{{ (pokemon.weight / 10).toFixed(1) }}kg</div>
        </div>
      </div>

      <!-- Top Stats -->
      <div class="mt-3 space-y-1">
        <div
          v-for="stat in pokemon.stats.slice(0, 3)"
          :key="stat.stat.name"
          class="flex items-center justify-between text-xs"
        >
          <span class="text-gray-500 dark:text-gray-400 capitalize">
            {{ stat.stat.name.replace("-", " ") }}
          </span>
          <div class="flex items-center gap-1">
            <div class="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                :style="{ width: `${(stat.base_stat / 255) * 100}%` }"
              ></div>
            </div>
            <span class="font-semibold w-8 text-right">{{ stat.base_stat }}</span>
          </div>
        </div>
      </div>
    </CardContent>

    <!-- Hover overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
    ></div>
  </Card>
</template>
