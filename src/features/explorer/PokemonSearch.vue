<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { pokemonTypes, typeColors } from "@/features/explorer/utils"
import { Filter, Search, X } from "lucide-vue-next"
import { ref, watch } from "vue"

interface Props {
  searchQuery: string
  selectedTypes: string[]
  onSearchChange: (query: string) => void
  onTypeChange: (types: string[]) => void
  onClearFilters: () => void
}

const props = defineProps<Props>()

const localSearchQuery = ref(props.searchQuery)

const getTypeColor = (typeName: string) => {
  return typeColors[typeName as keyof typeof typeColors] || "bg-gray-400"
}

const handleSearchChange = (value: string) => {
  props.onSearchChange(value)
}

const handleTypeToggle = (type: string) => {
  const newTypes = props.selectedTypes.includes(type)
    ? props.selectedTypes.filter((t) => t !== type)
    : [...props.selectedTypes, type]
  props.onTypeChange(newTypes)
}

const handleClearFilters = () => {
  localSearchQuery.value = ""
  props.onClearFilters()
}

let searchTimeout: ReturnType<typeof setTimeout>
watch(localSearchQuery, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearchChange(newValue)
  }, 300)
})
</script>

<template>
  <Card class="mb-6">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Search class="h-5 w-5" />
        Search & Filter Pokemon
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          v-model="localSearchQuery"
          placeholder="Search Pokemon by name..."
          class="pl-10 pr-10"
        />
        <Button
          v-if="localSearchQuery"
          variant="ghost"
          size="icon"
          class="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
          @click="localSearchQuery = ''"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>

      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <Filter class="h-4 w-4" />
          <span class="text-sm font-medium">Filter by Type:</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <Badge
            v-for="type in pokemonTypes"
            :key="type"
            :class="[
              'cursor-pointer transition-all duration-200 hover:scale-105',
              selectedTypes.includes(type)
                ? `${getTypeColor(type)} text-white`
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
            ]"
            @click="handleTypeToggle(type)"
          >
            {{ type.charAt(0).toUpperCase() + type.slice(1) }}
          </Badge>
        </div>
      </div>

      <div v-if="searchQuery || selectedTypes.length > 0" class="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          @click="handleClearFilters"
          class="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <X class="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
