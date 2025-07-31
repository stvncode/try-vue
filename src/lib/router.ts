import { createRouter, createWebHistory } from "vue-router"

import { Battle, Explorer, Home, TeamBuilder } from "@/pages"

const routes = [
  { path: "/", component: Home },
  { path: "/explorer", component: Explorer },
  { path: "/battle", component: Battle },
  { path: "/teambuilder", component: TeamBuilder },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
