<script setup lang="ts">
import BannerDivider from './BannerDivider.vue'

defineProps<{
	title: string
	description: string | null
}>()
</script>

<template>
	<div class="relative block w-full h-48 md:h-64 bg-profile-banner-bg">
		<div
			class="relative z-10 container mx-auto px-4 py-6 flex flex-col h-full justify-center"
		>
			<h1 class="text-3xl md:text-4xl font-medium text-profile-banner-text mb-2">
				{{ title }}
			</h1>
			<BannerDivider />
			<p v-if="description" class="text-profile-banner-muted md:text-lg max-w-2xl">
				{{ description }}
			</p>
		</div>
	</div>
</template>
