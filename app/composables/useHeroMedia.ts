/**
 * Manages hero banner media pairs (static image + animated video).
 *
 * On page load, randomly selects a pair and shows the static image (A variant)
 * immediately for fast LCP. The animated video (B variant) loads in the background.
 * Once buffered, it crossfades from image to video. If the video is already cached,
 * the transition happens near-instantly.
 *
 * Persists video playback position across SPA navigations (e.g. language changes)
 * so the video resumes seamlessly without replaying the crossfade.
 *
 * Respects prefers-reduced-motion by never loading the video.
 */
export function useHeroMedia() {
	const mediaPairs = [
		{
			image: 'https://assets.talospioneers.com/media/talos_pioneerbannerIllust_FENDMIN.webp',
			video: 'https://assets.talospioneers.com/media/Endmin_F.webm',
		},
		{
			image: 'https://assets.talospioneers.com/media/talos_pioneerbannerIllust_MENDMIN.webp',
			video: 'https://assets.talospioneers.com/media/Endmin_M.webm',
		},
	]

	// SSR-safe random pair selection — computed once on server, rehydrated on client
	// Persists across SPA navigations so language changes keep the same pair
	const pairIndex = useState('heroPairIndex', () =>
		Math.floor(Math.random() * mediaPairs.length)
	)

	// Persisted playback position — survives component unmount/remount (e.g. locale switch)
	const savedTime = useState('heroVideoTime', () => 0)

	// Tracks whether video was already active before this mount
	const videoActivated = useState('heroVideoActivated', () => false)

	const pair = mediaPairs[pairIndex.value]
	const imageUrl = pair.image
	const videoUrl = pair.video

	// If video was playing before unmount, skip the crossfade on remount
	const isResuming = videoActivated.value

	// When resuming: start with video visible + loaded so there's no image flash
	const showVideo = ref(isResuming)
	const shouldLoadVideo = ref(isResuming)
	const videoRef = ref<HTMLVideoElement | null>(null)

	let timeoutId: ReturnType<typeof setTimeout> | null = null
	let activated = false // prevents double-fire from rAF + canplaythrough race

	// Hoisted function declarations for mutual reference
	function cleanupListeners() {
		const video = videoRef.value
		if (video) {
			video.removeEventListener('canplaythrough', activateVideo)
			video.removeEventListener('error', cleanupListeners)
		}
		if (timeoutId) {
			clearTimeout(timeoutId)
			timeoutId = null
		}
	}

	function activateVideo() {
		if (activated) return
		activated = true
		const video = videoRef.value
		if (!video) return

		// Restore playback position if resuming from a previous mount
		if (savedTime.value > 0) {
			video.currentTime = savedTime.value
		}

		showVideo.value = true
		videoActivated.value = true
		video.play().catch(() => {
			showVideo.value = false
		})
		cleanupListeners()
	}

	onMounted(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
		shouldLoadVideo.value = true
	})

	// React to the video element mounting in the DOM
	watch(videoRef, (video) => {
		if (!video) return

		// Immediate check — video may already be cached and ready
		if (video.readyState >= 3) {
			activateVideo()
			return
		}

		// Listen for sufficient buffering
		video.addEventListener('canplaythrough', activateVideo, { once: true })
		video.addEventListener('error', cleanupListeners, { once: true })

		// Deferred cache check — browser may need one frame to resolve cache
		requestAnimationFrame(() => {
			if (video.readyState >= 3) activateVideo()
		})

		// Give up after 10s on slow connections — stay on static image
		timeoutId = setTimeout(cleanupListeners, 10_000)
	})

	// Save playback position before unmount so the next mount can resume
	// Then release the video source to free memory held by the decoder
	onBeforeUnmount(() => {
		const video = videoRef.value
		if (video) {
			if (showVideo.value) {
				savedTime.value = video.currentTime
			}
			video.pause()
			video.removeAttribute('src')
			video.load()
		}
		cleanupListeners()
	})

	return {
		imageUrl,
		videoUrl,
		showVideo,
		shouldLoadVideo,
		videoRef,
		isResuming,
	}
}
