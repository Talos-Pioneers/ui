export default defineNuxtPlugin(() => {
	// onPrehydrate stringifies the callback and inlines it into the SSR HTML.
	// It runs on the client before Vue hydrates, preventing FOUC.
	// The callback has NO access to imports, composables, or module scope —
	// it's serialized as a standalone function.
	onPrehydrate(() => {
		const m = document.cookie.match(/talos_theme=([\w-]+)/)
		const p = (m && m[1]) || 'system'
		const t = p === 'system'
			? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
			: p
		document.documentElement.setAttribute('data-theme', t)
	})
})
