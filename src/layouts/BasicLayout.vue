<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer"
        ><a href="https://www.code-nav.cn" target="_blank">
          编程导航 by 程序员鱼皮
        </a></a-layout-footer
      >
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from "@/components/GlobalHeader.vue";
</script>

<style scoped>
#basicLayout .footer {
  background: #efefef;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}
.content {
  background: linear-gradient(to right, #fefefe, #fff);
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 28px;
  box-sizing: border-box;
}
.header {
  margin-bottom: 16px;
  box-shadow: #eee 1px 1px 5px;
}
</style>
