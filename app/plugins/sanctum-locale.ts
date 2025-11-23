export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.hook("sanctum:request", (app, ctx) => {
		// Get the current locale from i18n
		const { locale } = useI18n();

		// Add the current locale to the request headers
		ctx.options.headers.set("X-Locale", locale.value as string);
	});
});
