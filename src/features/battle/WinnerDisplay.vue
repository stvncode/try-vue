<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Pokemon } from "@/lib/api"
import { Heart, Star, Zap } from "lucide-vue-next"

interface Props {
  winner: Pokemon | null
  currentTurn: number
}

const props = defineProps<Props>()
</script>

<template>
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
              <Star class="h-3 w-3 mr-1" />
              Victorious
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
