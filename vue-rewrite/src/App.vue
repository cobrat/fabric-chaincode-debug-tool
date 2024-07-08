<template>
  <div>
    <a-space direction="vertical" size="large">
      <a-typography-title :heading="1">
        Welcome to Vue 3 + Vite + Arco Design + TypeScript
      </a-typography-title>
      <a-button type="primary" @click="showMessage">
        Click me!
      </a-button>
    </a-space>
  </div>
  <div :style="{ display: 'flex' }">
    <a-card :style="{ width: '360px' }" title="Arco Card">
      <template #extra>
        <a-link>More</a-link>
      </template>
      ByteDance's core product, Toutiao ("Headlines"), is a content platform in
      China and around the world. Toutiao started out as a news recommendation
      engine and gradually evolved into a platform delivering content in various
      formats.
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { Message } from '@arco-design/web-vue';

const showMessage = (): void => {
  Message.success('Hello from Arco Design with TypeScript!');
};
</script>

<style scoped>
.a-space {
  margin: 20px;
}
</style>