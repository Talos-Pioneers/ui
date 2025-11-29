<script setup lang="ts">
const lastUpdatedDate = 'November 26, 2025'
const { data: cookiePolicy } = await useAsyncData(() => queryCollection('content').path('/cookie-policy').first())

useHead({
	title: 'Cookie Policy',
	meta: [
		{
			property: 'og:title',
			content: 'Cookie Policy',
		},
		{
			name: 'description',
			content: 'Cookie Policy for Talos Pioneers',
		},
		{
			property: 'og:description',
			content: 'Cookie Policy for Talos Pioneers',
		},
	],
})
</script>

<template>
	<div class="wave-bg bg-cool-gray-10 dark:bg-cool-gray-90 before:bg-size-[400px] min-h-[calc(100vh-var(--header-height))]">
		<div class="container mx-auto px-4 py-6">
			<div class="max-w-4xl mx-auto">
				<div class="bg-white dark:bg-cool-gray-90 rounded-lg border border-cool-gray-20 dark:border-cool-gray-80 p-6 space-y-8">
					<!-- Title -->
					<div>
						<h1 class="font-bold text-3xl text-cool-gray-80 dark:text-cool-gray-20 mb-2">
							COOKIE POLICY
						</h1>
						<p class="text-sm text-cool-gray-60 dark:text-cool-gray-40">
							Last updated {{ lastUpdatedDate }}
						</p>
					</div>

					<!-- Content -->
					<div
						class="prose prose-cool-gray dark:prose-invert max-w-none"
					>
						<ContentRenderer v-if="cookiePolicy" :value="cookiePolicy" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

