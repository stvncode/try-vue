import router from "@/lib/router"
import { VueQueryPlugin } from "@tanstack/vue-query"
import { createPinia } from "pinia"
import { createApp } from "vue"
import App from "./App.vue"
import "./style.css"

const pinia = createPinia()

createApp(App).use(router).use(VueQueryPlugin).use(pinia).mount("#app")
