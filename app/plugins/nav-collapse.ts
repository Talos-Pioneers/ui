export default defineNuxtPlugin(() => {
	onPrehydrate(() => {
		// Safe threshold: widest authenticated + English nav (~905px) + margin
		document.documentElement.dataset.navState =
			window.innerWidth >= 920 ? 'desktop' : 'mobile'
	})
})
