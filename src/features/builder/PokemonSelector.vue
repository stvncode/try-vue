<script setup lang="ts">
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
import { Plus, Search } from "lucide-vue-next"
import { computed, ref } from "vue"

interface Props {
  allPokemon: Array<{ name: string; url: string; id: number }>
  isLoading: boolean
  isLoadingPokemon: boolean
  teamLength: number
  pokemonTypes: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  addPokemon: [pokemonName: string]
}>()

const searchQuery = ref("")
const selectedType = ref("")

const filteredPokemon = computed(() => {
  let filtered = props.allPokemon

  if (searchQuery.value) {
    filtered = filtered.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedType.value) {
    filtered = filtered.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(selectedType.value.toLowerCase())
    )
  }

  return filtered.slice(0, 50)
})

const clearFilters = () => {
  searchQuery.value = ""
  selectedType.value = ""
}

const handleAddPokemon = (pokemonName: string) => {
  if (props.teamLength >= 6) return
  emit("addPokemon", pokemonName)
}
</script>

<template>
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
            <SelectItem v-for="type in pokemonTypes" :key="type" :value="type" class="capitalize">
              {{ type }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="max-h-96 overflow-y-auto space-y-2">
        <div class="text-xs text-gray-500 mb-2">
          Total Pokemon loaded: {{ allPokemon.length }}
          <span v-if="searchQuery || selectedType">
            | Showing {{ filteredPokemon.length }} results
            <span v-if="searchQuery">for "{{ searchQuery }}"</span>
            <span v-if="selectedType">filtered by {{ selectedType }}</span>
          </span>
        </div>

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

        <div
          v-for="pokemon in filteredPokemon"
          :key="pokemon.id"
          @click="handleAddPokemon(pokemon.name)"
          class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          :class="{ 'opacity-50 cursor-not-allowed': teamLength >= 6 }"
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

        <div v-if="isLoadingPokemon" class="text-center py-4">
          <Skeleton class="h-4 w-4 mx-auto rounded-full animate-spin" />
          <p class="text-xs text-gray-500 mt-1">Loading Pokemon...</p>
        </div>

        <div v-if="isLoading" class="text-center py-8">
          <Skeleton class="h-8 w-8 mx-auto rounded-full animate-spin" />
          <p class="text-sm text-gray-500 mt-2">Loading Pokemon list...</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
