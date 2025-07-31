<script setup lang="ts">
import { Gamepad2, Home, Map } from "lucide-vue-next"
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
      url: "/battle-simulator",
      icon: Gamepad2,
    },
    {
      title: "Team Builder",
      url: "/team-builder",
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
      icon: Collection,
    },
  ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader> Pokemon Explorer </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
</template>
