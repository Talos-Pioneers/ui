<script setup lang="ts">
import { Button } from '~/components/ui/button'

const { t } = useI18n()
</script>

<template>
	<div class="relative block w-full h-48 md:h-64 bg-cool-gray-90">
		<div
			class="relative z-10 container mx-auto px-4 py-6 flex flex-col h-full justify-center"
		>
			<h1 class="text-3xl md:text-4xl font-medium text-white mb-2">
				{{ t('components.banners.blueprintProfileBanner.title') }}
			</h1>
			<p class="text-white/80 md:text-lg max-w-2xl mb-6">
				{{ t('components.banners.blueprintProfileBanner.description') }}
			</p>
			<div class="flex gap-3">
				<Button
					as-child
					class="min-w-56 justify-between"
					variant="default"
					size="responsive-lg"
					rounded="base"
				>
					<NuxtLinkLocale to="/blueprints/create">
						<svg
							class="size-6"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M12 5V19M5 12H19"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						<span
							class="flex gap-3 text-sm sm:text-xl items-center text-cool-gray-100"
						>
							<span>{{
								t(
									'components.banners.blueprintProfileBanner.createButton'
								)
							}}</span>
							<svg
								width="8"
								height="12"
								viewBox="0 0 8 12"
								fill="none"
								class="fill-cool-gray-40"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M0 10.59L4.58 6L0 1.41L1.41 0L7.41 6L1.41 12L0 10.59Z"
								/>
							</svg>
						</span>
					</NuxtLinkLocale>
				</Button>
			</div>
		</div>
	</div>
</template>

