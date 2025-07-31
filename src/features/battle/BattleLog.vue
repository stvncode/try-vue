<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-vue-next"

interface Props {
  battleLog: string[]
  currentTurn: number
}

const props = defineProps<Props>()
</script>

<template>
  <Card v-if="battleLog.length > 0" class="border-2 border-purple-200 dark:border-purple-800">
    <CardHeader
      class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950"
    >
      <CardTitle class="flex items-center gap-2 text-purple-700 dark:text-purple-300">
        <Target class="h-6 w-6 text-purple-500" />
        Battle Log
        <Badge
          v-if="currentTurn > 1"
          variant="secondary"
          class="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
        >
          Turn {{ currentTurn - 1 }}
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent class="p-0">
      <div class="max-h-64 overflow-y-auto space-y-1 p-4">
        <div
          v-for="(log, index) in battleLog"
          :key="index"
          class="text-sm p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 border border-purple-200 dark:border-purple-800 shadow-sm"
        >
          <span class="font-medium text-purple-700 dark:text-purple-300">{{ log }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
