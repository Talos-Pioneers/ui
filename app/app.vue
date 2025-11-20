<script setup lang="ts">
import LoginDialog from '~/components/auth/LoginDialog.vue'
</script>

<template>
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <LoginDialog />
</template>
