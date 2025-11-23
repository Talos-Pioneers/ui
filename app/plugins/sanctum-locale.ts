export default defineNuxtPlugin((nuxtApp) => {
	const locale = nuxtApp.$i18n.locale.value;

	nuxtApp.hook("sanctum:request", (app, ctx) => {
		// Get the current locale from i18n
		// Add the current locale to the request headers
		ctx.options.headers.set("X-Locale", locale);
	});
});
