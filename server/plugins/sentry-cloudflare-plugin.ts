import { sentryCloudflareNitroPlugin } from "@sentry/nuxt/module/plugins";
export default defineNitroPlugin(
	sentryCloudflareNitroPlugin({
		dsn: "https://b52f0ced6ca2217c58fd74ee4a77c8d5@o4510417268113408.ingest.us.sentry.io/4510423228940288",
		tracesSampleRate: 1.0,
	})
);
