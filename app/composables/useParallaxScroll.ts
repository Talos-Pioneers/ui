/**
 * Composable for scroll-based parallax effect
 * Works on desktop and mobile with GPU acceleration
 *
 * Features:
 * - Zero-delay initial calculation (no FOUC on page load)
 * - IntersectionObserver to only run when element is visible
 * - Reactive prefers-reduced-motion detection
 * - iOS Safari rubber-banding protection (clamps negative scrollY)
 * - Offset clamping to prevent background edge reveal
 * - Route change handling (resets on navigation)
 * - KeepAlive support (onActivated/onDeactivated)
 *
 * @param speed - Parallax speed multiplier (default: 0.3)
 * @param options.maxOffset - Maximum pixel offset to prevent edge reveal (default: 200)
 *
 * @example
 * ```vue
 * <script setup>
 * const { parallaxStyle, registerElement } = useParallaxScroll(0.3, { maxOffset: 180 })
 * const container = ref<HTMLElement | null>(null)
 *
 * // MUST call registerElement in onMounted with your template ref
 * onMounted(() => {
 *   if (container.value) registerElement(container.value)
 * })
 * </script>
 * ```
 */
export function useParallaxScroll(
	speed: number = 0.3,
	options: { maxOffset?: number } = {}
) {
	const { maxOffset = 200 } = options

	// All state is reactive refs to avoid shared state between component instances
	const offset = ref(0)
	const isSupported = ref(true)
	// Start false to match server/client (prevents hydration mismatch)
	// Will be set true by IntersectionObserver when element is visible
	const isVisible = ref(false)
	const elementRef = ref<HTMLElement | null>(null)
	const ticking = ref(false)
	const isActive = ref(true) // Track if component is active (for KeepAlive)
	const hasMounted = ref(false) // Track if initial mount happened (for KeepAlive)
	const lastPath = ref('') // For route change deduplication

	// Reactive reduced motion detection
	const prefersReducedMotion = ref(false)
	let motionMediaQuery: MediaQueryList | null = null
	let observer: IntersectionObserver | null = null

	const updateOffset = () => {
		if (prefersReducedMotion.value || !isVisible.value || !isActive.value) {
			ticking.value = false
			return
		}

		// Clamp scrollY to prevent iOS Safari rubber-band negative values
		const scrollY = Math.max(0, window.scrollY)

		// Clamp offset to prevent background edge reveal
		const rawOffset = scrollY * speed
		offset.value = Math.min(rawOffset, maxOffset)

		ticking.value = false
	}

	const onScroll = () => {
		if (!ticking.value && isVisible.value && isActive.value) {
			requestAnimationFrame(updateOffset)
			ticking.value = true
		}
	}

	const setupIntersectionObserver = (el: HTMLElement) => {
		// Cleanup existing observer before creating new one
		if (observer) {
			observer.disconnect()
			observer = null
		}

		observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0]
				if (entry) {
					isVisible.value = entry.isIntersecting
					// Update immediately when becoming visible
					if (entry.isIntersecting && isActive.value) {
						updateOffset()
					}
				}
			},
			{ threshold: 0, rootMargin: '50px' }
		)
		observer.observe(el)
	}

	const onMotionChange = (e: MediaQueryListEvent) => {
		prefersReducedMotion.value = e.matches
		if (e.matches) {
			offset.value = 0
			isSupported.value = false
		} else {
			isSupported.value = true
			if (isActive.value) updateOffset()
		}
	}

	const startListening = () => {
		if (import.meta.server) return

		// Setup reactive reduced motion detection (only once)
		if (!motionMediaQuery) {
			motionMediaQuery = window.matchMedia(
				'(prefers-reduced-motion: reduce)'
			)
			prefersReducedMotion.value = motionMediaQuery.matches
			motionMediaQuery.addEventListener('change', onMotionChange)
		}

		if (prefersReducedMotion.value) {
			isSupported.value = false
			return
		}

		window.addEventListener('scroll', onScroll, { passive: true })

		// Re-observe element if we have a ref
		if (elementRef.value) {
			setupIntersectionObserver(elementRef.value)
		}

		// CRITICAL: Force immediate sync calculation to prevent parallax delay on page load
		// This runs before IntersectionObserver callback (which is async)
		// We bypass the isVisible/isActive checks here for the initial calculation only
		if (!prefersReducedMotion.value) {
			const scrollY = Math.max(0, window.scrollY)
			const rawOffset = scrollY * speed
			offset.value = Math.min(rawOffset, maxOffset)
		}
	}

	const stopListening = () => {
		window.removeEventListener('scroll', onScroll)
		if (observer) {
			observer.disconnect()
			observer = null
		}
		ticking.value = false
	}

	const fullCleanup = () => {
		stopListening()
		motionMediaQuery?.removeEventListener('change', onMotionChange)
		motionMediaQuery = null
	}

	// Lifecycle hooks
	onMounted(() => {
		isActive.value = true
		hasMounted.value = true
		startListening()
	})

	onUnmounted(() => {
		isActive.value = false
		fullCleanup()
	})

	// KeepAlive support - pause/resume when cached/restored
	// Note: onActivated fires on INITIAL mount too, so we guard with hasMounted
	onActivated(() => {
		if (!hasMounted.value) return // Skip first activation (handled by onMounted)
		isActive.value = true
		startListening()
	})

	onDeactivated(() => {
		isActive.value = false
		stopListening()
	})

	// Reset offset on route change (handles SPA navigation)
	// Using useRouter().currentRoute for immediate value (Nuxt's useRoute can lag in layouts)
	const router = useRouter()

	watch(
		() => router.currentRoute.value.fullPath,
		(newPath) => {
			// Skip if not mounted yet or same path
			if (!hasMounted.value || newPath === lastPath.value) return
			lastPath.value = newPath
			offset.value = 0
			// Recalculate after navigation settles
			nextTick(() => {
				if (!prefersReducedMotion.value && isActive.value) {
					updateOffset()
				}
			})
		}
	)

	const parallaxStyle = computed(() => {
		if (!isSupported.value || prefersReducedMotion.value) {
			return {}
		}
		return {
			transform: `translate3d(0, ${offset.value}px, 0)`,
		}
	})

	/**
	 * Register an element for IntersectionObserver tracking.
	 * MUST be called in onMounted() with your template ref.
	 */
	const registerElement = (el: HTMLElement | null) => {
		if (el && import.meta.client) {
			elementRef.value = el
			setupIntersectionObserver(el)
		}
	}

	return {
		offset,
		parallaxStyle,
		isSupported,
		isVisible,
		registerElement,
	}
}

