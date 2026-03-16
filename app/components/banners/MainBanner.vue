<script setup lang="ts">
import { Button } from '~/components/ui/button'
import BannerDivider from './BannerDivider.vue'
import InfoIcon from '../icons/InfoIcon.vue'
import AddBlueprintIcon from '../icons/AddBlueprintIcon.vue'
import ChevronRightIcon from '../icons/ChevronRightIcon.vue'
const { t } = useI18n()

const { isAuthenticated } = useSanctumAuth()

const { imageUrl, videoUrl, showVideo, shouldLoadVideo, videoRef, isResuming } =
	useHeroMedia()

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
		id="main-hero"
		ref="parallaxContainer"
		class="relative block w-full h-[600px] md:h-[42rem] overflow-hidden border-b border-border"
	>
		<!-- Parallax background layer -->
		<div
			class="absolute inset-0 w-full h-[calc(100%+200px)] will-change-transform"
			:style="{
				transform: parallaxStyle.transform || 'translate3d(0, 0, 0)',
			}"
		>
			<!-- Animated video (B variant) - loads in background, sits behind image -->
			<video
				v-if="shouldLoadVideo"
				ref="videoRef"
				class="absolute inset-0 z-[1] w-full h-full object-cover object-[80%] md:object-center 2xl:object-[center_35%] scale-125 -translate-y-[15%] md:scale-100 md:-translate-y-[10%]"
				:class="[
					showVideo ? 'opacity-100' : 'opacity-0',
					isResuming ? '' : 'transition-opacity duration-500',
				]"
				muted
				loop
				playsinline
				preload="auto"
			>
				<source :src="videoUrl" type="video/webm" />
			</video>
			<!-- Static image (A variant) - shown immediately, fades out when video is ready -->
			<img
				:src="imageUrl"
				alt=""
				class="absolute inset-0 z-[2] w-full h-full object-cover object-[80%] md:object-center 2xl:object-[center_35%] scale-125 -translate-y-[15%] md:scale-100 md:-translate-y-[10%]"
				:class="[
					showVideo ? 'opacity-0' : 'opacity-100',
					isResuming ? '' : 'transition-opacity duration-500',
				]"
			/>
			<!-- Gradient overlay (image) — lighter vignette for static content -->
			<div
				class="absolute inset-0 z-[3] pointer-events-none"
				:class="[
					showVideo ? 'opacity-0' : 'opacity-100',
					isResuming ? '' : 'transition-opacity duration-500',
				]"
				style="background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.7) 100%)"
			/>
			<!-- Gradient overlay (video) — stronger to compensate for brightness/motion -->
			<div
				class="absolute inset-0 z-[3] pointer-events-none"
				:class="[
					showVideo ? 'opacity-100' : 'opacity-0',
					isResuming ? '' : 'transition-opacity duration-500',
				]"
				style="background: linear-gradient(180deg, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 0.45) 50%, rgba(0, 0, 0, 0.92) 100%)"
			/>
		</div>
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
							class="size-4 sm:size-6 text-(--hero-btn-icon)"
						/>
						<span
							class="flex gap-3 items-center text-(--hero-btn-text)"
						>
							<span
								class="leading-none text-sm sm:text-xl tracking-[0.5px]"
								>{{ t('mainBanner.createBlueprint') }}</span
							>
							<ChevronRightIcon class="w-2 h-3 text-(--hero-btn-chevron)" />
						</span>
					</NuxtLinkLocale>
				</Button>
				<Button
					as-child
					class="flex-1 sm:flex-none sm:min-w-56 justify-between border-none items-center bg-(--about-btn-bg)"
					variant="outline"
					size="responsive-lg"
					rounded="base"
				>
					<NuxtLinkLocale to="/about">
						<InfoIcon class="size-4 sm:size-6 text-(--about-btn-icon)" />
						<span
							class="flex gap-3 items-center text-(--about-btn-text)"
						>
							<span
								class="leading-none text-sm sm:text-xl tracking-[0.5px]"
								>{{ t('mainBanner.about') }}</span
							>
							<ChevronRightIcon class="w-2 h-3 text-(--about-btn-chevron)" />
						</span>
					</NuxtLinkLocale>
				</Button>
			</div>
		</div>
	</div>
</template>
