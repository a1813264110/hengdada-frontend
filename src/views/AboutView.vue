<template>
  <div id="about">
    <h1>About page</h1>
    {{ JSON.stringify(loginUserStore.loginUser) }}
  </div>
</template>

<script setup lang="ts">
import { useLoginUserStore } from "@/store/userStore";
const loginUserStore = useLoginUserStore();
</script>
