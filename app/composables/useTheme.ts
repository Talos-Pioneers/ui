import { useEventListener } from '@vueuse/core'

export type UserPreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeOption {
	id: UserPreference
	labelKey: string
	icon: string
}

export const THEMES: ThemeOption[] = [
	{ id: 'light', labelKey: 'theme.light', icon: 'Sun' },
	{ id: 'dark', labelKey: 'theme.dark', icon: 'Moon' },
	{ id: 'system', labelKey: 'theme.system', icon: 'Monitor' },
]

export function useTheme() {
	const themeCookie = useCookie<UserPreference>('talos_theme', {
		default: () => 'system',
		maxAge: 60 * 60 * 24 * 365,
		path: '/',
		sameSite: 'lax',
	})

	const preference = useState<UserPreference>('theme-preference', () => themeCookie.value)
	const systemPrefersDark = useState('theme-system-dark', () => false)

	if (import.meta.client) {
		const mq = window.matchMedia('(prefers-color-scheme: dark)')
		systemPrefersDark.value = mq.matches

		useEventListener(mq, 'change', (e: MediaQueryListEvent) => {
			systemPrefersDark.value = e.matches
		})
	}

	const resolved = computed<ResolvedTheme | null>(() => {
		if (preference.value === 'system') {
			if (import.meta.server) return null
			return systemPrefersDark.value ? 'dark' : 'light'
		}
		return preference.value
	})

	const applyTheme = (theme: ResolvedTheme) => {
		if (import.meta.client) {
			const el = document.documentElement
			el.classList.add('theme-transition')
			el.setAttribute('data-theme', theme)
			setTimeout(() => el.classList.remove('theme-transition'), 200)
		}
	}

	const setTheme = (id: UserPreference) => {
		preference.value = id
		themeCookie.value = id
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
	}
}
