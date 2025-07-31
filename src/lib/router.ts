import { createMemoryHistory, createRouter } from "vue-router"

import { Explorer, Home } from "@/pages"

const routes = [
  { path: "/", component: Home },
  { path: "/explorer", component: Explorer },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router
