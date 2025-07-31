<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Heart, Search, Sword, Users } from "lucide-vue-next"
import { useRouter } from "vue-router"

const router = useRouter()

const features = [
  {
    title: "Pokemon Explorer",
    description:
      "Browse and search through all Pokemon with detailed information, stats, and beautiful artwork.",
    icon: Search,
    route: "/explorer",
    color: "from-blue-500 to-cyan-500",
    badge: "Available",
  },
  {
    title: "Battle Simulator",
    description: "Compare Pokemon stats and simulate epic battles between your favorite Pokemon.",
    icon: Sword,
    route: "/battle",
    color: "from-red-500 to-orange-500",
    badge: "Coming Soon",
  },
  {
    title: "Team Builder",
    description:
      "Create balanced Pokemon teams with type coverage analysis and strategic planning.",
    icon: Users,
    route: "/teambuilder",
    color: "from-green-500 to-emerald-500",
    badge: "Coming Soon",
  },
  {
    title: "Pokemon Quiz",
    description:
      "Test your Pokemon knowledge with trivia questions about Pokemon, moves, and types.",
    icon: Brain,
    route: "/quiz",
    color: "from-purple-500 to-pink-500",
    badge: "Coming Soon",
  },
  {
    title: "Collection Tracker",
    description: "Track your Pokemon collection, mark favorites, and keep a personal Pokedex.",
    icon: Heart,
    route: "/collection",
    color: "from-pink-500 to-rose-500",
    badge: "Coming Soon",
  },
]

const navigateTo = (route: string) => {
  router.push(route)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <div class="text-center space-y-6 py-8">
      <div class="space-y-4">
        <h1
          class="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          Pokemon Hub
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Your ultimate destination for everything Pokemon. Explore, battle, build teams, and test
          your knowledge in one beautiful app.
        </p>
      </div>

      <div class="flex justify-center gap-4">
        <Button
          size="lg"
          class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          @click="navigateTo('/explorer')"
        >
          <Search class="mr-2 h-5 w-5" />
          Start Exploring
        </Button>
        <Button variant="outline" size="lg"> Learn More </Button>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        v-for="feature in features"
        :key="feature.title"
        class="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary/50"
        @click="navigateTo(feature.route)"
      >
        <CardHeader class="space-y-3">
          <div class="flex items-center justify-between">
            <div :class="`p-3 rounded-lg bg-gradient-to-r ${feature.color}`">
              <component :is="feature.icon" class="h-6 w-6 text-white" />
            </div>
            <Badge
              :variant="feature.badge === 'Available' ? 'default' : 'secondary'"
              class="text-xs"
            >
              {{ feature.badge }}
            </Badge>
          </div>
          <CardTitle class="text-xl">{{ feature.title }}</CardTitle>
          <CardDescription class="text-gray-600 dark:text-gray-400">
            {{ feature.description }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            :disabled="feature.badge !== 'Available'"
            class="w-full"
            :variant="feature.badge === 'Available' ? 'default' : 'outline'"
          >
            {{ feature.badge === "Available" ? "Get Started" : "Coming Soon" }}
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Stats Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
      <Card class="text-center p-6">
        <div class="text-3xl font-bold text-blue-600">1000+</div>
        <div class="text-gray-600 dark:text-gray-400">Pokemon Available</div>
      </Card>
      <Card class="text-center p-6">
        <div class="text-3xl font-bold text-purple-600">18</div>
        <div class="text-gray-600 dark:text-gray-400">Pokemon Types</div>
      </Card>
      <Card class="text-center p-6">
        <div class="text-3xl font-bold text-green-600">∞</div>
        <div class="text-gray-600 dark:text-gray-400">Possibilities</div>
      </Card>
    </div>

    <!-- Call to Action -->
    <div
      class="text-center py-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-2xl"
    >
      <h2 class="text-3xl font-bold mb-4">Ready to Start Your Pokemon Journey?</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Join thousands of trainers exploring the world of Pokemon with our comprehensive tools.
      </p>
      <Button
        size="lg"
        class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        @click="navigateTo('/explorer')"
      >
        <Search class="mr-2 h-5 w-5" />
        Explore Pokemon Now
      </Button>
    </div>
  </div>
</template>
