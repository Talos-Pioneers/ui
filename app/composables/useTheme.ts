import { useEventListener } from '@vueuse/core'

export interface ThemeOption {
	id: string
	icon: string
}

/**
 * All available themes — single source of truth.
 * To add a future theme: add an entry here and a matching
 * `[data-theme="<id>"]` block in tailwind.css.
 */
export const THEMES = [
	{ id: 'light', icon: 'Sun' },
	{ id: 'dark', icon: 'Moon' },
] as const satisfies readonly ThemeOption[]

/** Union of all registered theme IDs, derived from THEMES. */
export type ThemeId = (typeof THEMES)[number]['id']

/**
 * Maps OS `prefers-color-scheme` result to a theme id.
 * Centralised so only this mapping needs updating if a future theme
 * should become the OS default for dark- or light-preferring users.
 */
const OS_THEME_MAP: Record<'light' | 'dark', ThemeId> = {
	light: 'light',
	dark: 'dark',
}

/**
 * Per-theme metadata used outside CSS (e.g. `<meta name="theme-color">`).
 * Add an entry for each new theme.
 */
export const THEME_META: Record<ThemeId, { themeColor: string }> = {
	light: { themeColor: '#ffffff' },
	dark: { themeColor: '#272727' },
}

export function useTheme() {
	const themeCookie = useCookie<ThemeId | null>('talos_theme', {
		default: () => null,
		maxAge: 60 * 60 * 24 * 365,
		path: '/',
		sameSite: 'lax',
	})

	const systemPrefersDark = useState('theme-system-dark', () => false)

	if (import.meta.client) {
		const mq = window.matchMedia('(prefers-color-scheme: dark)')
		systemPrefersDark.value = mq.matches

		useEventListener(mq, 'change', (e: MediaQueryListEvent) => {
			systemPrefersDark.value = e.matches
		})
	}

	/** The theme the OS would select if the user has no stored preference. */
	const osDefault = computed<ThemeId>(() =>
		OS_THEME_MAP[systemPrefersDark.value ? 'dark' : 'light'],
	)

	const preference = useState<ThemeId>('theme-preference', () =>
		themeCookie.value ?? osDefault.value,
	)

	// Keep preference in sync with OS changes when user has no stored preference
	if (import.meta.client) {
		watch(osDefault, (val) => {
			if (!themeCookie.value) preference.value = val
		})
	}

	const resolved = computed<ThemeId | null>(() => {
		if (import.meta.server && !themeCookie.value) return null
		return preference.value
	})

	const applyTheme = (theme: ThemeId) => {
		if (import.meta.client) {
			const el = document.documentElement
			el.classList.add('theme-transition')
			el.setAttribute('data-theme', theme)
			setTimeout(() => el.classList.remove('theme-transition'), 200)
		}
	}

	const setTheme = (id: ThemeId) => {
		preference.value = id
		themeCookie.value = id
	}

	/** Cycle to the next theme in the THEMES array. */
	const toggleTheme = () => {
		const currentIndex = THEMES.findIndex(th => th.id === preference.value)
		const nextIndex = (currentIndex + 1) % THEMES.length
		setTheme(THEMES[nextIndex].id)
	}

	if (import.meta.client) {
		watch(resolved, (val) => {
			if (val) applyTheme(val)
		}, { immediate: true })
	}

	return {
		preference,
		resolved,
		themes: THEMES,
		setTheme,
		toggleTheme,
	}
}
