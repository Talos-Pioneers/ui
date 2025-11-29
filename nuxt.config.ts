import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	logLevel: 'verbose',

	devServer: {
		host: 'blueprints.test',
	},

	ssr: true,
	css: ['~/assets/css/tailwind.css'],

	vite: {
		plugins: [tailwindcss()],
	},

	nitro: {
		preset: 'cloudflare_module',

		prerender: {
			routes: ['/cookie-policy', '/privacy-policy'],
		},

		cloudflare: {
			deployConfig: true,
			nodeCompat: true,
		},
	},

	modules: [
		'nitro-cloudflare-dev',
		'@nuxtjs/i18n',
		'nuxt-auth-sanctum',
		'nuxt-sanctum-precognition',
		'@nuxtjs/seo',
		'shadcn-nuxt',
		'@nuxt/fonts',
		'usemods-nuxt',
		'@sentry/nuxt/module',
		'@nuxt/eslint',
		'nuxt-lottie',
		'@nuxt/scripts',
		'@nuxt/content',
	],

	runtimeConfig: {
		public: {
			sentry: {
				dsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
			},
		},
	},

	i18n: {
		baseUrl: process.env.BASE_URL,
		strategy: 'prefix',
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: 'talos_i18n_redirected',
			redirectOn: 'root',
		},
		defaultLocale: 'en',
		locales: [
			{
				code: 'en',
				name: 'English',
				file: 'en.json',
				language: 'en',
			},
			{
				code: 'ja',
				name: '日本語',
				file: 'ja.json',
				language: 'ja',
			},
			{
				code: 'ko',
				name: '한국어',
				file: 'ko.json',
				language: 'ko',
			},
			{
				code: 'zh-TW',
				name: '繁體中文',
				file: 'zh-TW.json',
				language: 'zh-TW',
			},
			{
				code: 'zh-CN',
				name: '簡體中文',
				file: 'zh-CN.json',
				language: 'zh-CN',
			},
			{
				code: 'es',
				name: 'Español',
				file: 'es.json',
				language: 'es',
			},
			{
				code: 'pt',
				name: 'Português',
				file: 'pt.json',
				language: 'pt',
			},
			{
				code: 'fr',
				name: 'Français',
				file: 'fr.json',
				language: 'fr',
			},
			{
				code: 'de',
				name: 'Deutsch',
				file: 'de.json',
				language: 'de',
			},
			{
				code: 'ru',
				name: 'Русский',
				file: 'ru.json',
				language: 'ru',
			},
			{
				code: 'it',
				name: 'Italiano',
				file: 'it.json',
				language: 'it',
			},
			{
				code: 'id',
				name: 'Indonesia',
				file: 'id.json',
				language: 'id',
			},
			{
				code: 'th',
				name: 'ภาษาไทย',
				file: 'th.json',
				language: 'th',
			},
			{
				code: 'vi',
				name: 'Tiếng Việt',
				file: 'vi.json',
				language: 'vi',
			},
		],
	},

	sanctum: {
		baseUrl: process.env.API_URL,
		redirectIfAuthenticated: false,
		redirect: {
			onLogin: false,
		},
	},

	fonts: {
		families: [
			{
				name: 'HarmonyOS_Sans',
				provider: 'local',
				weights: [100, 300, 400, 500, 700, 900],
				fallbacks: ['sans-serif'],
			},
			{
				name: 'HarmonyOS_Sans_SC',
				provider: 'local',
				weights: [100, 300, 400, 500, 700, 900],
				fallbacks: ['sans-serif'],
			},
			{
				name: 'HarmonyOS_Sans_TC',
				provider: 'local',
				weights: [100, 300, 400, 500, 700, 900],
				fallbacks: ['sans-serif'],
			},
			{
				name: 'EndfieldByButan',
				provider: 'local',
				src: '/fonts/EndfieldByButan.ttf',
				fallbacks: ['sans-serif'],
			},
			{
				name: 'Noto Sans JP',
				provider: 'google',
				weights: [100, 300, 400, 500, 700, 900],
			},
			{
				name: 'DM Sans',
				provider: 'google',
				weights: [100, 300, 400, 500, 700, 900],
			},
		],
	},

	sentry: {
		sourceMapsUploadOptions: {
			org: 'talos-pioneers',
			project: 'talos-pioneers-frontend',
			authToken: process.env.SENTRY_AUTH_TOKEN,
		},
	},

	scripts: {
		registry: {
			googleTagManager: {
				id: 'GTM-MMCT5C3R',
			},
		},
	},

	sourcemap: {
		client: 'hidden',
	},
})
