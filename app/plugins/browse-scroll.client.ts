// Scrolls past the hero banner when navigating to browse pages via
// client-side navigation. Smooth scrolls from current position to
// the content section (works whether scrolling up or down).
//
// Direct URL loads show the page from the top normally (hero visible).
// Respects prefers-reduced-motion by falling back to instant scroll.
//
// Links with [data-scroll-top] (e.g. the logo) opt out of the scroll
// behavior — the plugin scrolls to top instead (since scrollBehavior
// returns false for all browse page navigations).
//
// Two triggers:
// - Cross-page navigation: uses page:finish for reliable DOM timing
// - Same-page re-click: scrolls directly in afterEach (DOM already settled)
//
// ResizeObserver corrects scroll when async content loads on cross-page nav.

const isBrowsePage = (path: string) => {
	const clean = path.replace(/\/$/, '')
	const isRoot = /^\/[a-z]{2}(-[A-Z]{2,})?$/.test(clean)
	const isCollections = /^\/[a-z]{2}(-[A-Z]{2,})?\/collections$/.test(clean)
	return isRoot || isCollections
}

export default defineNuxtPlugin((nuxtApp) => {
	const router = useRouter()

	let pendingScroll = false
	let pendingScrollToTop = false
	let activeObserver: ResizeObserver | null = null
	let skipNextScroll = false
	let isPopstate = false
	let initialLoad = true

	// Detect back/forward navigation so we don't override savedPosition
	window.addEventListener('popstate', () => {
		isPopstate = true
	})

	// Links with data-scroll-top opt out of the browse scroll behavior
	document.addEventListener(
		'click',
		(e) => {
			const link = (e.target as HTMLElement).closest('[data-scroll-top]')
			if (link) skipNextScroll = true
		},
		{ capture: true }
	)

	const scrollToHeroBottom = (withObserver = false) => {
		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches

		requestAnimationFrame(() => {
			const hero = document.getElementById('main-hero')
			if (!hero) return

			const scrollTarget = hero.offsetTop + hero.offsetHeight

			window.scrollTo({
				top: scrollTarget,
				behavior: prefersReducedMotion ? 'instant' : 'smooth',
			})

			if (!withObserver) return

			// Watch for page height changes (async content loading) and
			// correct scroll position if the initial scroll fell short.
			let lastHeight = document.documentElement.scrollHeight
			const observer = new ResizeObserver(() => {
				const newHeight = document.documentElement.scrollHeight
				if (newHeight !== lastHeight) {
					lastHeight = newHeight
					if (window.scrollY < scrollTarget - 2) {
						window.scrollTo({ top: scrollTarget, behavior: 'instant' })
					}
				}
			})
			observer.observe(document.documentElement)
			activeObserver = observer

			// Fallback cleanup
			setTimeout(() => {
				observer.disconnect()
				if (activeObserver === observer) activeObserver = null
			}, 5000)
		})
	}

	router.afterEach((to, from) => {
		// Always clean up previous observer on any navigation
		if (activeObserver) {
			activeObserver.disconnect()
			activeObserver = null
		}

		// Skip initial page load / hydration — only scroll on client-side nav
		if (initialLoad) {
			initialLoad = false
			return
		}

		// Back/forward navigation: let scrollBehavior's savedPosition handle it
		if (isPopstate) {
			isPopstate = false
			return
		}

		// Logo clicks: scroll to top instead of past the hero.
		// scrollBehavior returns false for browse pages, so we handle it here.
		if (skipNextScroll) {
			skipNextScroll = false
			if (to.path === from.path) {
				// Same page: DOM is settled, scroll immediately
				window.scrollTo({ top: 0, behavior: 'instant' })
			} else {
				// Cross-page: wait for page:finish
				pendingScrollToTop = true
			}
			return
		}

		if (!isBrowsePage(to.path)) return

		if (to.path === from.path) {
			// Same browse page re-click: DOM is already settled, scroll directly
			scrollToHeroBottom(false)
			return
		}

		// Locale change on the same page (e.g. /en → /ja): don't scroll
		const stripLocale = (p: string) =>
			p.replace(/^\/[a-z]{2}(-[A-Z]{2,})?/, '') || '/'
		if (stripLocale(to.path) === stripLocale(from.path)) return

		if (!from.name) return

		// Cross-page → browse page: wait for page:finish
		pendingScroll = true
	})

	nuxtApp.hook('page:finish', () => {
		if (pendingScrollToTop) {
			pendingScrollToTop = false
			requestAnimationFrame(() => {
				window.scrollTo({ top: 0, behavior: 'instant' })
			})
			return
		}

		if (!pendingScroll) return
		pendingScroll = false
		scrollToHeroBottom(true)
	})
})
