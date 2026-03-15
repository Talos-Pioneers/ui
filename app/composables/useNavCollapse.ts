/**
 * Dynamically collapses the nav bar based on actual content width
 * instead of a fixed CSS breakpoint. Handles different auth states
 * and languages automatically via ResizeObserver + known element widths.
 */
export function useNavCollapse() {
	const headerRef = ref<HTMLElement | null>(null)
	const navMeasureRef = ref<HTMLElement | null>(null)
	const isCollapsed = ref(false)

	const { locale } = useI18n()
	const route = useRoute()

	// Known CSS dimensions (px) — derived from Tailwind classes
	const HEADER_PADDING = 60 // px-7.5 = 30px * 2
	const LOGO_WIDTH = 157 // SVG width attribute
	const NAV_MARGIN = 30 // ml-7.5
	const MIN_GAP = 24 // comfortable minimum between nav and controls
	const THEME_W = 46 // nav:w-11.5
	const LANG_W = 160 // min-w-40
	const ACTION_BTN_W = 160 // min-w-40 (Sign In or Create)
	const PROFILE_W = 46 // size-11.5
	const BTN_GAP = 8 // gap-2

	let isAuthenticated: Ref<boolean>
	try {
		const auth = useSanctumAuth()
		isAuthenticated = auth.isAuthenticated
	} catch {
		isAuthenticated = ref(false)
	}

	const isOnLoginPage = computed(() => route.path.includes('/login'))

	// Desktop right-side width from known CSS constants
	const desktopRightWidth = computed(() => {
		let w = THEME_W + BTN_GAP + LANG_W
		if (isAuthenticated.value) {
			w += BTN_GAP + ACTION_BTN_W + BTN_GAP + PROFILE_W
		} else if (!isOnLoginPage.value) {
			w += BTN_GAP + ACTION_BTN_W
		}
		return w
	})

	const navContentWidth = ref(0)

	const setState = (collapsed: boolean) => {
		if (collapsed === isCollapsed.value) return
		isCollapsed.value = collapsed
		if (import.meta.client) {
			document.documentElement.dataset.navState = collapsed
				? 'mobile'
				: 'desktop'
		}
	}

	const check = () => {
		if (!headerRef.value || navContentWidth.value === 0) return
		const available = headerRef.value.offsetWidth - HEADER_PADDING
		const needed =
			LOGO_WIDTH +
			NAV_MARGIN +
			navContentWidth.value +
			MIN_GAP +
			desktopRightWidth.value
		setState(available < needed)
	}

	const measureNav = () => {
		if (navMeasureRef.value) {
			navContentWidth.value = navMeasureRef.value.scrollWidth
		}
		check()
	}

	watch(locale, () => nextTick(measureNav))
	watch([isAuthenticated, isOnLoginPage], () => nextTick(check))

	onMounted(() => {
		nextTick(() => {
			measureNav()

			if (headerRef.value) {
				const observer = new ResizeObserver(() => {
					requestAnimationFrame(check)
				})
				observer.observe(headerRef.value)
				onUnmounted(() => observer.disconnect())
			}
		})
	})

	return { headerRef, navMeasureRef, isCollapsed }
}
