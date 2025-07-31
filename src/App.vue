<script setup lang="ts">
import Layout from "@/components/layout/Layout.vue"
import { Toaster } from "@/components/ui/sonner"
import "vue-sonner/style.css"
</script>

<template>
  <Toaster />
  <Layout />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
