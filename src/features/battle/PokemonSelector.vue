<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Pokemon } from "@/lib/api"
import { Shield, Sword } from "lucide-vue-next"
import { computed } from "vue"

interface Props {
  allPokemon: Array<{ name: string; url: string; id: number }>
  isLoading: boolean
  isBattleInProgress: boolean
  playerNumber: 1 | 2
  selectedPokemon: Pokemon | null
  currentStats?: {
    currentHP: number
    maxHP: number
    attack: number
    defense: number
    speed: number
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  selectPokemon: [pokemonName: string]
}>()

const handlePokemonSelect = (pokemonName: string) => {
  emit("selectPokemon", pokemonName)
}

const getPlayerColor = () => {
  return props.playerNumber === 1 ? "red" : "blue"
}

const getPlayerIcon = () => {
  return props.playerNumber === 1 ? Sword : Shield
}

const getPlayerTitle = () => {
  return `Pokemon ${props.playerNumber}`
}

const getCurrentStats = computed(() => {
  if (props.currentStats) {
    return props.currentStats
  }

  if (props.selectedPokemon) {
    return {
      currentHP: props.selectedPokemon.stats.find((s) => s.stat.name === "hp")?.base_stat || 100,
      maxHP: props.selectedPokemon.stats.find((s) => s.stat.name === "hp")?.base_stat || 100,
      attack: props.selectedPokemon.stats.find((s) => s.stat.name === "attack")?.base_stat || 50,
      defense: props.selectedPokemon.stats.find((s) => s.stat.name === "defense")?.base_stat || 50,
      speed: props.selectedPokemon.stats.find((s) => s.stat.name === "speed")?.base_stat || 50,
    }
  }

  return {
    currentHP: 0,
    maxHP: 0,
    attack: 0,
    defense: 0,
    speed: 0,
  }
})
</script>

<template>
  <Card
    :class="`border-2 border-${getPlayerColor()}-200 dark:border-${getPlayerColor()}-800 hover:border-${getPlayerColor()}-300 dark:hover:border-${getPlayerColor()}-700 transition-all duration-300 hover:shadow-lg`"
  >
    <CardHeader
      :class="`bg-gradient-to-r from-${getPlayerColor()}-50 to-${
        getPlayerColor() === 'red' ? 'orange' : 'cyan'
      }-50 dark:from-${getPlayerColor()}-950 dark:to-${
        getPlayerColor() === 'red' ? 'orange' : 'cyan'
      }-950`"
    >
      <CardTitle
        :class="`flex items-center gap-2 text-${getPlayerColor()}-700 dark:text-${getPlayerColor()}-300`"
      >
        <component :is="getPlayerIcon()" :class="`h-6 w-6 text-${getPlayerColor()}-500`" />
        {{ getPlayerTitle() }}
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <Select @update:model-value="handlePokemonSelect" :disabled="isBattleInProgress">
        <SelectTrigger
          :class="`bg-white dark:bg-gray-800 border-2 border-${getPlayerColor()}-200 dark:border-${getPlayerColor()}-800 hover:border-${getPlayerColor()}-300 dark:hover:border-${getPlayerColor()}-700`"
        >
          <SelectValue :placeholder="`Choose ${getPlayerTitle()}`" />
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

      <div v-if="selectedPokemon" class="space-y-4">
        <div
          :class="`flex items-center gap-4 p-4 bg-gradient-to-r from-${getPlayerColor()}-50 to-${
            getPlayerColor() === 'red' ? 'orange' : 'cyan'
          }-50 dark:from-${getPlayerColor()}-950 dark:to-${
            getPlayerColor() === 'red' ? 'orange' : 'cyan'
          }-950 rounded-lg border border-${getPlayerColor()}-200 dark:border-${getPlayerColor()}-800`"
        >
          <div class="relative">
            <img
              :src="
                selectedPokemon.sprites.other['official-artwork'].front_default ||
                selectedPokemon.sprites.front_default
              "
              :alt="selectedPokemon.name"
              class="w-24 h-24 object-contain drop-shadow-lg"
            />
            <div
              :class="`absolute -top-2 -right-2 bg-${getPlayerColor()}-500 text-white text-xs px-2 py-1 rounded-full font-bold`"
            >
              #{{ selectedPokemon.id.toString().padStart(3, "0") }}
            </div>
          </div>
          <div class="space-y-2">
            <h3
              :class="`text-xl font-bold capitalize text-${getPlayerColor()}-700 dark:text-${getPlayerColor()}-300`"
            >
              {{ selectedPokemon.name }}
            </h3>
            <div class="flex gap-2">
              <Badge
                v-for="type in selectedPokemon.types"
                :key="type.type.name"
                class="text-xs capitalize font-semibold px-3 py-1"
              >
                {{ type.type.name }}
              </Badge>
            </div>
          </div>
        </div>

        <div
          v-if="getCurrentStats.maxHP > 0"
          :class="`space-y-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-${getPlayerColor()}-200 dark:border-${getPlayerColor()}-800`"
        >
          <div class="flex items-center gap-2 mb-2">
            <Sword :class="`h-4 w-4 text-${getPlayerColor()}-500`" />
            <span
              :class="`font-semibold text-${getPlayerColor()}-700 dark:text-${getPlayerColor()}-300`"
              >Battle Stats</span
            >
          </div>
          <div class="space-y-3">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="font-medium">HP</span>
                <span class="font-bold"
                  >{{ getCurrentStats.currentHP }}/{{ getCurrentStats.maxHP }}</span
                >
              </div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  :class="`h-full ${
                    getCurrentStats.currentHP <= getCurrentStats.maxHP * 0.25
                      ? 'bg-red-500'
                      : getCurrentStats.currentHP <= getCurrentStats.maxHP * 0.5
                      ? 'bg-yellow-500'
                      : `bg-${getPlayerColor()}-500`
                  }`"
                  :style="{
                    width: `${Math.max(
                      0,
                      (getCurrentStats.currentHP / getCurrentStats.maxHP) * 100
                    )}%`,
                  }"
                ></div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4 text-xs">
              <div class="text-center">
                <div :class="`font-bold text-${getPlayerColor()}-600`">
                  {{ getCurrentStats.attack }}
                </div>
                <div class="text-gray-500">Attack</div>
              </div>
              <div class="text-center">
                <div class="font-bold text-blue-600">{{ getCurrentStats.defense }}</div>
                <div class="text-gray-500">Defense</div>
              </div>
              <div class="text-center">
                <div class="font-bold text-green-600">{{ getCurrentStats.speed }}</div>
                <div class="text-gray-500">Speed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
