<script setup lang="ts">
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { type LucideIcon } from "lucide-vue-next"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

const props = defineProps<{
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}>()

const isItemActive = (itemUrl: string) => {
  if (itemUrl === "/") {
    return route.path === "/"
  }
  return route.path.startsWith(itemUrl)
}

const handleNavigation = (url: string) => {
  router.push(url)
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>Pokedex</SidebarGroupLabel>
    <SidebarMenu>
      <Collapsible
        v-for="item in items"
        :key="item.title"
        as-child
        :default-open="isItemActive(item.url)"
        class="group/collapsible"
      >
        <SidebarMenuItem>
          <SidebarMenuButton
            :tooltip="item.title"
            :class="{ 'bg-accent': isItemActive(item.url) }"
            @click="handleNavigation(item.url)"
          >
            <component :is="item.icon" v-if="item.icon" />
            <span>{{ item.title }}</span>
          </SidebarMenuButton>
          <CollapsibleContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title">
                <SidebarMenuSubButton as-child @click="handleNavigation(subItem.url)">
                  <span>{{ subItem.title }}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  </SidebarGroup>
</template>
