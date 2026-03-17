<script setup lang="ts">
import { ConfigProvider } from 'reka-ui'

const useIdFunction = () => useId()
useHead({
	titleTemplate: '%s %separator %siteName',
})
</script>

<template>
	<ConfigProvider :use-id="useIdFunction">
		<NuxtLoadingIndicator :throttle="50" color="var(--primary)" :height="2" />
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</ConfigProvider>
</template>
