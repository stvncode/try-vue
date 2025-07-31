<script setup lang="ts">
import { BookOpen, Brain, Gamepad2, Home, Map, Users } from "lucide-vue-next"
import NavMain from "./NavMain.vue"

import type { SidebarProps } from "@/components/ui/sidebar"
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
})

const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Explorer",
      url: "/explorer",
      icon: Map,
    },
    {
      title: "Battle Simulator",
      url: "/battle",
      icon: Gamepad2,
    },
    {
      title: "Team Builder",
      url: "/teambuilder",
      icon: Users,
    },
    {
      title: "Quiz",
      url: "/quiz",
      icon: Brain,
    },
    {
      title: "Collection",
      url: "/collection",
      icon: BookOpen,
    },
  ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader class="border-b border-border/5 bg-muted/40">
      <div class="flex h-[60px] items-center">
        <div class="flex items-center gap-2 px-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span class="text-sm font-semibold text-primary-foreground">P</span>
          </div>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold">Pokemon Hub</span>
            <span class="truncate text-xs">Your Pokemon Companion</span>
          </div>
        </div>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
</template>
