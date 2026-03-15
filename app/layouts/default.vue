<script setup lang="ts">
import 'vue-sonner/style.css'
import Header from '~/components/navigation/Header.vue'
import Footer from '~/components/navigation/Footer.vue'
import LoginDialog from '~/components/auth/LoginDialog.vue'
import RegisterDialog from '~/components/auth/RegisterDialog.vue'
import { TooltipProvider } from '~/components/ui/tooltip'
import { Toaster } from '~/components/ui/sonner'
import { SidebarProvider, SidebarInset } from '~/components/ui/sidebar'
import { THEME_META, type ThemeId } from '~/composables/useTheme'

const head = useLocaleHead()
const { resolved } = useTheme()

useHead(() => ({
	htmlAttrs: resolved.value ? { 'data-theme': resolved.value } : {},
	meta: resolved.value
		? [{ name: 'theme-color', content: THEME_META[resolved.value as ThemeId]?.themeColor ?? '#ffffff' }]
		: [],
}))

// Intro animation config
const INTRO_VERSION = 'v1' // Bump to force re-show after intro changes
const INTRO_TIMEOUT_MS = 10000
const INTRO_VIDEOS: Record<string, string> = {
	light: 'https://assets.talospioneers.com/intro.webm',
	dark: 'https://assets.talospioneers.com/intro.webm', // TODO: replace with dark mode variant
}
const introSrc = computed(() => {
	const video = INTRO_VIDEOS[resolved.value ?? 'light'] ?? INTRO_VIDEOS.light
	return `${video}#t=2.9`
})

// Cookie expires at midnight (rolling calendar day)
const getSecondsUntilMidnight = (): number => {
	const now = new Date()
	const midnight = new Date(now)
	midnight.setDate(midnight.getDate() + 1)
	midnight.setHours(0, 0, 0, 0)
	return Math.floor((midnight.getTime() - now.getTime()) / 1000)
}

const introSeen = useCookie('talos_intro_seen', {
	maxAge: getSecondsUntilMidnight(),
	default: () => '',
})

// Determine initial state from cookie (SSR-safe: cookie available on both server & client)
const showIntro = ref(introSeen.value !== INTRO_VERSION)
const videoRef = ref<HTMLVideoElement | null>(null)
const autoplayBlocked = ref(false)
let timeoutId: ReturnType<typeof setTimeout> | null = null

const dismissIntro = () => {
	showIntro.value = false
	introSeen.value = INTRO_VERSION
}

const handleIntroTap = () => {
	if (!videoRef.value) return
	autoplayBlocked.value = false
	videoRef.value.currentTime = 0
	videoRef.value.play().catch(() => {})
}

// Fallback timeout + explicit autoplay for mobile
onMounted(() => {
	if (!showIntro.value) return

	// Respect prefers-reduced-motion accessibility setting
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		dismissIntro()
		return
	}

	timeoutId = setTimeout(dismissIntro, INTRO_TIMEOUT_MS)

	nextTick(async () => {
		if (!videoRef.value) return
		try {
			await videoRef.value.play()
		} catch {
			// Autoplay blocked (e.g. Brave) — keep overlay visible so the
			// user can tap to play. The fallback timeout will dismiss it
			// if they don't interact.
			autoplayBlocked.value = true
		}
	})
})

onUnmounted(() => {
	if (timeoutId) clearTimeout(timeoutId)
})
</script>

<template>
	<div>
		<Html :lang="head.htmlAttrs.lang" :dir="head.htmlAttrs.dir">
			<Head>
				<template v-for="link in head.link" :key="link.key">
					<Link
						:id="link.key"
						:rel="link.rel"
						:href="link.href"
						:hreflang="link.hreflang"
					/>
				</template>
				<template v-for="meta in head.meta" :key="meta.key">
					<Meta
						:id="meta.key"
						:property="meta.property"
						:content="meta.content"
					/>
				</template>
			</Head>

			<Body>
				<TooltipProvider>
					<!-- Intro overlay - blocks content until video ends or is dismissed -->
					<Transition name="fade">
						<div
							v-if="showIntro"
							class="fixed inset-0 bg-[#D0D0D0] z-50 flex items-center justify-center"
							:class="autoplayBlocked && 'cursor-pointer'"
							@click="autoplayBlocked && handleIntroTap()"
						>
							<div class="relative">
								<video
									ref="videoRef"
									:src="introSrc"
									autoplay
									muted
									playsinline
									preload="auto"
									class="size-128 pointer-events-none"
									@ended="dismissIntro"
									@error="dismissIntro"
								/>
								<Transition name="fade">
									<div
										v-if="autoplayBlocked"
										class="absolute inset-0 flex items-center justify-center"
									>
										<div class="size-16 rounded-full bg-black/40 flex items-center justify-center">
											<IconsPlayIcon class="size-8 text-white ml-1" />
										</div>
									</div>
								</Transition>
							</div>
						</div>
					</Transition>
					<Toaster />
					<div
						class="[--header-height:calc(--spacing(16.5))] flex flex-col min-h-screen"
					>
						<SidebarProvider
							:default-open="false"
							storage-key="filter-sidebar"
							class="flex flex-col flex-1"
						>
							<Header />
							<SidebarInset>
								<div class="flex-1">
									<slot />
									<Footer />
								</div>
							</SidebarInset>
						</SidebarProvider>
					</div>
					<LoginDialog />
					<RegisterDialog />
				</TooltipProvider>
			</Body>
		</Html>
	</div>
</template>
<style scoped>
.fade-enter-active {
	transition: opacity 0.3s ease-out;
}
.fade-leave-active {
	transition: opacity 0.8s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
	opacity: 1;
}
</style>
