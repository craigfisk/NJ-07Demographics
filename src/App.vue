<template>
  <div id="app">
    <h1>NJ-07 Demographics</h1>
    <NJMap />
  </div>
</template>

<script setup lang="ts">
import NJMap from './components/NJMap.vue'
</script>

<style>
#app {
  padding: 1rem;
}
h1 {
  margin-bottom: 12px;
}
</style>
