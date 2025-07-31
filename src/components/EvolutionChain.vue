<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { EvolutionChain } from "@/lib/api"
import { pokemonApi } from "@/lib/api"
import { ArrowRight, Star, Zap } from "lucide-vue-next"
import { computed, onMounted, ref, watch } from "vue"

interface Props {
  pokemonName: string
  currentPokemonId: number
}

const props = defineProps<Props>()

interface EvolutionNode {
  name: string
  id: number
  image: string
  isCurrent: boolean
}

interface EvolutionStep {
  from: EvolutionNode
  to: EvolutionNode
  requirements: Array<{
    trigger: string
    minLevel?: number
    item?: string
    timeOfDay?: string
    location?: string
    minHappiness?: number
    minAffection?: number
    knownMove?: string
    knownMoveType?: string
    heldItem?: string
    tradeSpecies?: string
    partySpecies?: string
    partyType?: string
    minBeauty?: number
    relativePhysicalStats?: number
    needsOverworldRain?: boolean
    turnUpsideDown?: boolean
    gender?: number
  }>
}

const evolutionChain = ref<EvolutionChain | null>(null)
const evolutionSteps = ref<EvolutionStep[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Get evolution chain data
const fetchEvolutionChain = async () => {
  if (!props.pokemonName) return

  isLoading.value = true
  error.value = null

  try {
    // Get Pokemon species to find evolution chain ID
    const species = await pokemonApi.getPokemonSpecies(props.pokemonName)
    const evolutionChainId = species.evolution_chain.url.split("/").slice(-2)[0]

    // Get evolution chain data
    const chainData = await pokemonApi.getEvolutionChain(evolutionChainId)
    evolutionChain.value = chainData

    // Build evolution steps
    await buildEvolutionSteps(chainData)
  } catch (err) {
    console.error("Failed to fetch evolution chain:", err)
    error.value = "Failed to load evolution chain"
  } finally {
    isLoading.value = false
  }
}

// Build evolution steps from chain data
const buildEvolutionSteps = async (chain: EvolutionChain) => {
  const steps: EvolutionStep[] = []

  // Helper function to process evolution details
  const processEvolutionDetails = (details: any[]) => {
    return details.map((detail) => ({
      trigger: detail.trigger.name,
      minLevel: detail.min_level,
      item: detail.item?.name,
      timeOfDay: detail.time_of_day,
      location: detail.location?.name,
      minHappiness: detail.min_happiness,
      minAffection: detail.min_affection,
      knownMove: detail.known_move?.name,
      knownMoveType: detail.known_move_type?.name,
      heldItem: detail.held_item?.name,
      tradeSpecies: detail.trade_species?.name,
      partySpecies: detail.party_species?.name,
      partyType: detail.party_type?.name,
      minBeauty: detail.min_beauty,
      relativePhysicalStats: detail.relative_physical_stats,
      needsOverworldRain: detail.needs_overworld_rain,
      turnUpsideDown: detail.turn_upside_down,
      gender: detail.gender,
    }))
  }

  // Get base Pokemon
  const basePokemon = await pokemonApi.getPokemon(chain.chain.species.name)
  const baseNode: EvolutionNode = {
    name: chain.chain.species.name,
    id: basePokemon.id,
    image:
      basePokemon.sprites.other["official-artwork"].front_default ||
      basePokemon.sprites.front_default,
    isCurrent: basePokemon.id === props.currentPokemonId,
  }

  // Process first evolution
  for (const evolution of chain.chain.evolves_to) {
    const evolutionPokemon = await pokemonApi.getPokemon(evolution.species.name)
    const evolutionNode: EvolutionNode = {
      name: evolution.species.name,
      id: evolutionPokemon.id,
      image:
        evolutionPokemon.sprites.other["official-artwork"].front_default ||
        evolutionPokemon.sprites.front_default,
      isCurrent: evolutionPokemon.id === props.currentPokemonId,
    }

    // Add step from base to first evolution
    steps.push({
      from: baseNode,
      to: evolutionNode,
      requirements: processEvolutionDetails(evolution.evolution_details),
    })

    // Process second evolution
    for (const secondEvolution of evolution.evolves_to) {
      const secondEvolutionPokemon = await pokemonApi.getPokemon(secondEvolution.species.name)
      const secondEvolutionNode: EvolutionNode = {
        name: secondEvolution.species.name,
        id: secondEvolutionPokemon.id,
        image:
          secondEvolutionPokemon.sprites.other["official-artwork"].front_default ||
          secondEvolutionPokemon.sprites.front_default,
        isCurrent: secondEvolutionPokemon.id === props.currentPokemonId,
      }

      // Add step from first to second evolution
      steps.push({
        from: evolutionNode,
        to: secondEvolutionNode,
        requirements: processEvolutionDetails(secondEvolution.evolution_details),
      })
    }
  }

  evolutionSteps.value = steps
}

// Get all unique Pokemon nodes from steps
const allPokemonNodes = computed(() => {
  const nodes: EvolutionNode[] = []
  const seenIds = new Set<number>()

  evolutionSteps.value.forEach((step) => {
    if (!seenIds.has(step.from.id)) {
      nodes.push(step.from)
      seenIds.add(step.from.id)
    }
    if (!seenIds.has(step.to.id)) {
      nodes.push(step.to)
      seenIds.add(step.to.id)
    }
  })

  return nodes.sort((a, b) => a.id - b.id)
})

// Format evolution requirement text
const formatEvolutionRequirement = (detail: any) => {
  const parts = []

  if (detail.minLevel) {
    parts.push(`Level ${detail.minLevel}`)
  }

  if (detail.item) {
    parts.push(`${detail.item} item`)
  }

  if (detail.timeOfDay && detail.timeOfDay !== "") {
    parts.push(detail.timeOfDay)
  }

  if (detail.location) {
    parts.push(`at ${detail.location}`)
  }

  if (detail.minHappiness) {
    parts.push(`${detail.minHappiness} happiness`)
  }

  if (detail.knownMove) {
    parts.push(`knowing ${detail.knownMove}`)
  }

  if (detail.heldItem) {
    parts.push(`holding ${detail.heldItem}`)
  }

  if (detail.tradeSpecies) {
    parts.push(`trade for ${detail.tradeSpecies}`)
  }

  if (detail.needsOverworldRain) {
    parts.push("during rain")
  }

  if (detail.turnUpsideDown) {
    parts.push("turn upside down")
  }

  return parts.length > 0 ? parts.join(" + ") : detail.trigger
}

// Watch for Pokemon changes
watch(() => props.pokemonName, fetchEvolutionChain, { immediate: true })

onMounted(() => {
  fetchEvolutionChain()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <div class="flex items-center justify-center space-x-4">
        <Skeleton class="h-16 w-16 rounded-lg" />
        <ArrowRight class="h-6 w-6 text-gray-400" />
        <Skeleton class="h-16 w-16 rounded-lg" />
        <ArrowRight class="h-6 w-6 text-gray-400" />
        <Skeleton class="h-16 w-16 rounded-lg" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-500 text-lg font-semibold mb-2">Failed to load evolution chain</div>
      <p class="text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
      <Button @click="fetchEvolutionChain">Try Again</Button>
    </div>

    <!-- Evolution Chain -->
    <div v-else-if="allPokemonNodes.length > 0" class="space-y-6">
      <div class="flex items-center justify-center space-x-4 flex-wrap">
        <div v-for="(node, index) in allPokemonNodes" :key="node.id" class="flex items-center">
          <!-- Pokemon Card -->
          <Card
            :class="[
              'w-32 p-3 transition-all duration-200 hover:scale-105',
              node.isCurrent ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : '',
            ]"
          >
            <CardContent class="p-0 space-y-2">
              <!-- Pokemon Image -->
              <div class="relative">
                <img :src="node.image" :alt="node.name" class="w-full h-20 object-contain" />
                <Star
                  v-if="node.isCurrent"
                  class="absolute -top-1 -right-1 h-4 w-4 text-blue-500 fill-blue-500"
                />
              </div>

              <!-- Pokemon Name -->
              <div class="text-center">
                <div class="text-sm font-semibold capitalize">{{ node.name }}</div>
                <Badge variant="secondary" class="text-xs">
                  #{{ node.id.toString().padStart(3, "0") }}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <!-- Evolution Arrow -->
          <div
            v-if="index < allPokemonNodes.length - 1"
            class="flex flex-col items-center pl-3 mx-2"
          >
            <ArrowRight class="h-6 w-6 text-gray-400" />

            <!-- Evolution Requirements -->
            <div
              v-if="
                evolutionSteps.find(
                  (step) => step.from.id === node.id && step.to.id === allPokemonNodes[index + 1].id
                )?.requirements.length
              "
              class="mt-2"
            >
              <div
                v-for="detail in evolutionSteps.find(
                  (step) => step.from.id === node.id && step.to.id === allPokemonNodes[index + 1].id
                )?.requirements"
                :key="detail.trigger"
                class="text-xs text-gray-500 dark:text-gray-400 text-center max-w-24"
              >
                {{ formatEvolutionRequirement(detail) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Evolution Message -->
      <div v-if="allPokemonNodes.length === 1" class="text-center py-4">
        <p class="text-gray-500 dark:text-gray-400">This Pokemon does not evolve.</p>
      </div>
    </div>

    <!-- No Evolution Chain -->
    <div v-else class="text-center py-8">
      <Zap class="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <p class="text-gray-500 dark:text-gray-400">No evolution chain found for this Pokemon.</p>
    </div>
  </div>
</template>
