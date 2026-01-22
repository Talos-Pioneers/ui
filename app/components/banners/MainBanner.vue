<script setup lang="ts">
import { Button } from '~/components/ui/button'
import BannerDivider from './BannerDivider.vue'
import InfoIcon from '../icons/InfoIcon.vue'
import AddBlueprintIcon from '../icons/AddBlueprintIcon.vue'
const { t } = useI18n()

const { isAuthenticated } = useSanctumAuth()

const backgroundImages = [
	'https://assets.talospioneers.com/media/talos_pioneerbannerIllust_FENDMIN.webp',
	'https://assets.talospioneers.com/media/talos_pioneerbannerIllust_MENDMIN.webp',
]

// SSR-safe random image selection using useState to prevent hydration mismatch
// useState ensures the random value is computed once on server and rehydrated on client
const randomBackgroundImage = useState('mainBannerImage', () =>
	backgroundImages[Math.floor(Math.random() * backgroundImages.length)]
)

// Parallax scroll effect - background moves at 30% of scroll speed
// maxOffset prevents background from revealing edges at extreme scroll
const { parallaxStyle, registerElement } = useParallaxScroll(0.3, {
	maxOffset: 180, // 600px * 0.3 = 180px max travel
})

// Reference to the parallax container for IntersectionObserver
const parallaxContainer = ref<HTMLElement | null>(null)

// Single onMounted hook for all client-side initialization
onMounted(() => {
	if (parallaxContainer.value) {
		registerElement(parallaxContainer.value)
	}
})
</script>
<template>
	<div
		ref="parallaxContainer"
		class="relative block w-full h-[600px] md:h-[42rem] overflow-hidden"
	>
		<!-- Parallax background layer with gradient overlay -->
		<!-- will-change hints browser to pre-composite this layer for GPU acceleration -->
		<div
			class="absolute inset-0 w-full h-[calc(100%+200px)] md:bg-cover md:bg-center md:bg-no-repeat bg-cover bg-bottom-right bg-no-repeat 2xl:bg-position-[center_top_35%] will-change-transform"
			:style="{
				backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.7) 100%), url(${randomBackgroundImage})`,
				transform: parallaxStyle.transform || 'translate3d(0, 0, 0)',
			}"
		/>
		<!-- Content layer (stays fixed) -->
		<div
			class="relative z-10 container mx-auto px-6 sm:px-4 py-6 flex flex-col h-full justify-end md:justify-center"
		>
			<h1
				class="text-3xl md:text-[3.375rem]/[3.75rem] font-medium text-white mb-2 text-shadow-lg"
			>
				{{ t('mainBanner.title') }}
			</h1>
			<BannerDivider />

			<p class="text-white md:text-lg max-w-2xl text-shadow-lg">
				{{ t('mainBanner.description') }}
			</p>
			<div class="flex gap-3 mt-8 items-center">
				<Button
					as-child
					class="flex-1 sm:flex-none sm:min-w-56 justify-between before:absolute items-center"
					variant="default"
					size="responsive-lg"
					rounded="base"
				>
					<NuxtLinkLocale
						:to="isAuthenticated ? '/blueprints/create' : '/login'"
					>
						<AddBlueprintIcon
							class="size-4 sm:size-6 text-cool-gray-100"
						/>
						<span
							class="flex gap-3 items-center text-cool-gray-100"
						>
							<span
								class="leading-none text-sm sm:text-xl text-cool-gray-100"
								>{{ t('mainBanner.createBlueprint') }}</span
							>
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
				<Button
					as-child
					class="flex-1 sm:flex-none sm:min-w-56 justify-between border-none items-center"
					variant="outline"
					size="responsive-lg"
					rounded="base"
				>
					<NuxtLinkLocale to="/about">
						<InfoIcon class="size-4 sm:size-6" />
						<span class="flex gap-3 items-center text-cool-gray-70">
							<span
								class="text-cool-gray-70 text-sm sm:text-xl leading-none"
								>{{ t('mainBanner.about') }}</span
							>
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
