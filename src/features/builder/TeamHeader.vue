<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Save } from "lucide-vue-next"

const emit = defineEmits<{
  "update:teamName": [value: string]
  saveTeam: []
  exportTeam: []
}>()

const handleTeamNameChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit("update:teamName", target.value)
}

const handleSaveTeam = () => {
  emit("saveTeam")
}

const handleExportTeam = () => {
  emit("exportTeam")
}
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
    <div class="flex items-center gap-4">
      <Input
        :value="teamName"
        @input="handleTeamNameChange"
        placeholder="Team Name"
        class="w-64 text-lg font-semibold"
      />
      <Badge variant="secondary" class="text-sm"> {{ teamLength }}/6 Pokemon </Badge>
    </div>
    <div class="flex gap-2">
      <Button
        @click="handleSaveTeam"
        variant="outline"
        class="border-green-200 text-green-700 hover:bg-green-50"
      >
        <Save class="h-4 w-4 mr-2" />
        Save Team
      </Button>
      <Button
        @click="handleExportTeam"
        variant="outline"
        class="border-blue-200 text-blue-700 hover:bg-blue-50"
      >
        <Download class="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  </div>
</template>
