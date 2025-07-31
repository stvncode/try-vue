<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Pokemon } from "@/lib/api"
import { Trash2, Users } from "lucide-vue-next"
import { getTypeColor } from "./utils"

interface Props {
  team: Pokemon[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  removePokemon: [index: number]
}>()

const handleRemovePokemon = (index: number) => {
  emit("removePokemon", index)
}
</script>

<template>
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
        <p class="text-gray-500">No Pokemon in your team yet. Add some Pokemon to get started!</p>
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
                  @click="handleRemovePokemon(index)"
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
</template>
