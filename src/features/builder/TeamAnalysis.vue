<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Pokemon } from "@/lib/api"
import { AlertCircle, CheckCircle, Heart, Shield, Sword, Target, Zap } from "lucide-vue-next"
import { computed } from "vue"
import { getTypeColor, pokemonTypes, typeEffectiveness } from "./utils"

interface Props {
  team: Pokemon[]
}

const props = defineProps<Props>()

const teamAnalysis = computed(() => {
  if (props.team.length === 0) return null

  const allTypes = props.team.flatMap((pokemon) => pokemon.types.map((type) => type.type.name))

  const typeCounts = allTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

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

  const weaknesses = pokemonTypes
    .map((type) => {
      let weaknessCount = 0
      props.team.forEach((pokemon) => {
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
    totalPokemon: props.team.length,
    averageStats:
      props.team.length > 0
        ? {
            hp: Math.round(
              props.team.reduce(
                (sum, p) => sum + (p.stats.find((s) => s.stat.name === "hp")?.base_stat || 0),
                0
              ) / props.team.length
            ),
            attack: Math.round(
              props.team.reduce(
                (sum, p) => sum + (p.stats.find((s) => s.stat.name === "attack")?.base_stat || 0),
                0
              ) / props.team.length
            ),
            defense: Math.round(
              props.team.reduce(
                (sum, p) => sum + (p.stats.find((s) => s.stat.name === "defense")?.base_stat || 0),
                0
              ) / props.team.length
            ),
            speed: Math.round(
              props.team.reduce(
                (sum, p) => sum + (p.stats.find((s) => s.stat.name === "speed")?.base_stat || 0),
                0
              ) / props.team.length
            ),
          }
        : null,
  }
})
</script>

<template>
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
              <div class="text-2xl font-bold text-red-600">{{ teamAnalysis.averageStats.hp }}</div>
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
</template>
