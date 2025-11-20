<script setup lang="ts">
import { ConfigProvider } from 'reka-ui';

const useIdFunction = () => useId()
</script>

<template>
  <ConfigProvider :use-id="useIdFunction">
    <NuxtLayout>
      <!-- <NuxtLoadingIndicator /> -->
      <NuxtPage />
    </NuxtLayout>
  </ConfigProvider>
</template>
