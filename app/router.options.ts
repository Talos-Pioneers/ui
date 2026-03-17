import type { RouterConfig } from '@nuxt/schema'

// Only matches the main browse pages, not profile sub-pages
const isBrowsePage = (path: string) => {
	const clean = path.replace(/\/$/, '')
	const isRoot = /^\/[a-z]{2}(-[A-Z]{2,})?$/.test(clean)
	const isCollections = /^\/[a-z]{2}(-[A-Z]{2,})?\/collections$/.test(clean)
	return isRoot || isCollections
}

export default <RouterConfig>{
	scrollBehavior(to, from, savedPosition) {
		// Restore position on back/forward
		if (savedPosition) {
			return savedPosition
		}

		// Handle hash links
		if (to.hash) {
			return { el: to.hash }
		}

		// Same-path navigations (query-only changes like pagination): don't scroll
		if (to.path === from.path) {
			return false
		}

		// Browse page scroll is handled by browse-scroll.client.ts plugin
		// Return false to prevent default scroll-to-top
		if (from.name && isBrowsePage(to.path)) {
			return false
		}

		// Default: scroll to top
		return { top: 0 }
	},
}
