<template>
  <div id="noAuth">
    <h1>{{ name }}</h1>
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from "vue";

const name = "无权限";
</script>

<style scoped>
#noAuth {
}
</style>
