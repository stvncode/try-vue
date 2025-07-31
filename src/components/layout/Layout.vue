<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { computed } from "vue"
import { RouterView, useRoute } from "vue-router"
import AppSidebar from "./AppSidebar.vue"

const route = useRoute()

// Generate breadcrumb based on current route
const currentPage = computed(() => {
  const pathSegments = route.path.split("/").filter((segment) => segment !== "")

  if (pathSegments.length === 0) {
    return "Home"
  }

  // Convert segment to readable name
  const segment = pathSegments[0]
  return segment.charAt(0).toUpperCase() + segment.slice(1)
})
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header
        class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Breadcrumb class="mt-0.5">
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbPage class="text-lg ml-3">
                  {{ currentPage }}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <RouterView />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
