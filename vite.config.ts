import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import path from "node:path"
import { defineConfig } from "vite"
import checker from "vite-plugin-checker"

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    checker({
      typescript: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
