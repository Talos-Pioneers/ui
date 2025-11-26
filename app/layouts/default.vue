<script setup>
import 'vue-sonner/style.css'
import Header from '~/components/navigation/Header.vue';
import Footer from '~/components/navigation/Footer.vue';
import LoginDialog from '~/components/auth/LoginDialog.vue'
import RegisterDialog from '~/components/auth/RegisterDialog.vue'
import { TooltipProvider } from '~/components/ui/tooltip';
import { Toaster } from '~/components/ui/sonner';
import { SidebarProvider, SidebarInset } from '~/components/ui/sidebar';

const route = useRoute()
const { t } = useI18n()
const head = useLocaleHead()
// const title = computed(() => t(route.meta.title ?? 'TBD', t('layouts.title'))
// );

</script>

<template>
    <div>
        <Html :lang="head.htmlAttrs.lang" :dir="head.htmlAttrs.dir">

        <Head>
            <!-- <Title>{{ title }}</Title> -->
            <template v-for="link in head.link" :key="link.key">
                <Link :id="link.key" :rel="link.rel" :href="link.href" :hreflang="link.hreflang" />
            </template>
            <template v-for="meta in head.meta" :key="meta.key">
                <Meta :id="meta.key" :property="meta.property" :content="meta.content" />
            </template>
        </Head>

        <Body>
            <TooltipProvider>
                <Toaster />
                <div class="[--header-height:calc(--spacing(16.5))] flex flex-col min-h-screen">
                    <SidebarProvider :default-open="false" storage-key="filter-sidebar" class="flex flex-col flex-1">
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
