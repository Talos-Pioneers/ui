<script setup>
import 'vue-sonner/style.css'
import Header from '~/components/navigation/Header.vue'
import Footer from '~/components/navigation/Footer.vue'
import LoginDialog from '~/components/auth/LoginDialog.vue'
import RegisterDialog from '~/components/auth/RegisterDialog.vue'
import { TooltipProvider } from '~/components/ui/tooltip'
import { Toaster } from '~/components/ui/sonner'
import { SidebarProvider, SidebarInset } from '~/components/ui/sidebar'

const head = useLocaleHead()
const loader = ref(true)

onBeforeMount(() => {
	setTimeout(() => {
		loader.value = false
	}, 2900)
})
// const title = computed(() => t(route.meta.title ?? 'TBD', t('layouts.title'))
// );
</script>

<template>
	<div>
		<Html :lang="head.htmlAttrs.lang" :dir="head.htmlAttrs.dir">
			<Head>
				<!-- <Title>{{ title }}</Title> -->
				<template v-for="link in head.link" :key="link.key">
					<Link
						:id="link.key"
						:rel="link.rel"
						:href="link.href"
						:hreflang="link.hreflang"
					/>
				</template>
				<template v-for="meta in head.meta" :key="meta.key">
					<Meta
						:id="meta.key"
						:property="meta.property"
						:content="meta.content"
					/>
				</template>
			</Head>

			<Body>
				<Transition name="fade">
					<div
						v-if="loader"
						class="fixed inset-0 bg-[#D0D0D0] z-50 flex items-center justify-center"
					>
						<video
							src="https://assets.talospioneers.com/intro.webm"
							autoplay
							muted
							class="size-128"
						/>
					</div>
				</Transition>
				<TooltipProvider v-show="!loader">
					<Toaster />
					<div
						class="[--header-height:calc(--spacing(16.5))] flex flex-col min-h-screen"
					>
						<SidebarProvider
							:default-open="false"
							storage-key="filter-sidebar"
							class="flex flex-col flex-1"
						>
							<Header />
							<SidebarInset>
								<div class="flex-1">
									<slot />
									<Footer />
								</div>
							</SidebarInset>
						</SidebarProvider>
					</div>
					<LoginDialog />
					<RegisterDialog />
				</TooltipProvider>
			</Body>
		</Html>
	</div>
</template>
<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
	opacity: 1;
}
</style>
