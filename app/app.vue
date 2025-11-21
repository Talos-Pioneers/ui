<script setup lang="ts">
import { ConfigProvider } from 'reka-ui';
import { Toaster } from '~/components/ui/sonner';

const useIdFunction = () => useId()
</script>

<template>
  <ConfigProvider :use-id="useIdFunction">
    <NuxtLayout>
      <!-- <NuxtLoadingIndicator /> -->
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
  </ConfigProvider>
</template>
