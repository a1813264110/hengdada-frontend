<template>
  <Editor :value="value" :plugins="plugins" @change="handleChange" />
</template>

<script setup lang="ts">
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight";
import { Editor, Viewer } from "@bytemd/vue-next";
import { ref } from "vue";

const plugins = [
  gfm(),
  highlight(),
  // Add more plugins here
];

const value = ref("");

const handleChange = (v: string) => {
  value.value = v;
};

/**
 * 定义组件属性类型
 */
interface Props {
  value: string;
  mode?: string;
  handleChange: (v: string) => void;
}

/**
 * 给组件指定初始值
 */
const props = withDefaults(defineProps<Props>(), {
  value: () => "",
  mode: () => "split",
  handleChange: (v: string) => {
    console.log(v);
  },
});
</script>

<style scoped>
.bytemd-toolbar-icon.bytemd-tippy.bytemd-tippy-right:last-child {
  display: none;
}
</style>
