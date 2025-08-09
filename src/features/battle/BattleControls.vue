<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Play, RefreshCw } from "lucide-vue-next"

interface Props {
  canStartBattle: boolean
  isBattleInProgress: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  startBattle: []
  resetBattle: []
}>()

const handleStartBattle = () => {
  emit("startBattle")
}

const handleResetBattle = () => {
  emit("resetBattle")
}
</script>

<template>
  <div class="flex justify-center gap-6">
    <Button
      @click="handleStartBattle"
      :disabled="!canStartBattle || isBattleInProgress"
      class="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      <Play class="h-5 w-5 mr-2" />
      Start Battle
    </Button>
    <Button
      @click="handleResetBattle"
      variant="outline"
      class="border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 font-bold px-6 py-3 text-lg transition-all duration-300"
    >
      <RefreshCw class="h-5 w-5 mr-2" />
      Reset
    </Button>
  </div>
</template>
