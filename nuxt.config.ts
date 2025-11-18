import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	logLevel: "verbose",
	devServer: {
		host: "blueprints.test",
	},
	css: ["~/assets/css/tailwind.css"],
	vite: {
		plugins: [tailwindcss()],
	},
	nitro: {
		preset: "cloudflare_module",

		cloudflare: {
			deployConfig: true,
			nodeCompat: true,
		},
	},

	modules: [
		"nitro-cloudflare-dev",
		"@nuxtjs/i18n",
		"nuxt-auth-sanctum",
		"nuxt-sanctum-precognition",
		"@nuxtjs/seo",
		"shadcn-nuxt",
	],
	i18n: {
		strategy: "prefix",
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: "talos_i18n_redirected",
			redirectOn: "root",
		},
		defaultLocale: "en",
		locales: [
			{
				code: "en",
				name: "English",
				file: "en.json",
				language: "en",
			},
			{
				code: "ja",
				name: "Japanese",
				file: "ja.json",
				language: "ja",
			},
			{
				code: "ko",
				name: "Korean",
				file: "ko.json",
				language: "ko",
			},
			{
				code: "zh-TW",
				name: "Chinese Traditional",
				file: "zh-TW.json",
				language: "zh-TW",
			},
			{
				code: "zh-CN",
				name: "Chinese Simplified",
				file: "zh-CN.json",
				language: "zh-CN",
			},
			{
				code: "es",
				name: "Spanish",
				file: "es.json",
				language: "es",
			},
			{
				code: "pt",
				name: "Portuguese",
				file: "pt.json",
				language: "pt",
			},
			{
				code: "fr",
				name: "French",
				file: "fr.json",
				language: "fr",
			},
			{
				code: "de",
				name: "German",
				file: "de.json",
				language: "de",
			},
			{
				code: "ru",
				name: "Russian",
				file: "ru.json",
				language: "ru",
			},
			{
				code: "it",
				name: "Italian",
				file: "it.json",
				language: "it",
			},
			{
				code: "id",
				name: "Indonesian",
				file: "id.json",
				language: "id",
			},
			{
				code: "th",
				name: "Thai",
				file: "th.json",
				language: "th",
			},
			{
				code: "vi",
				name: "Vietnamese",
				file: "vi.json",
				language: "vi",
			},
		],
	},
	sanctum: {
		baseUrl: process.env.API_URL,
	},
});
