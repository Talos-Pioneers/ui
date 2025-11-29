<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
    <footer class="bg-white border-t border-cool-gray-20 py-8 px-7.5">
        <div class="max-w-7xl mx-auto">
            <nav class="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-7.5">
                <NuxtLinkLocale
                    to="/about"
                    class="text-cool-gray-60 hover:text-cool-gray-80 transition-colors"
                >
                    {{ t('footer.about') }}
                </NuxtLinkLocale>
                <NuxtLinkLocale
                    to="/privacy-policy"
                    class="text-cool-gray-60 hover:text-cool-gray-80 transition-colors"
                >
                    {{ t('footer.privacyPolicy') }}
                </NuxtLinkLocale>
                <NuxtLinkLocale
                    to="/cookie-policy"
                    class="text-cool-gray-60 hover:text-cool-gray-80 transition-colors"
                >
                    {{ t('footer.cookiePolicy') }}
                </NuxtLinkLocale>
            </nav>
            <p class="text-cool-gray-60 text-center text-sm mt-4">© 2025 Talos Pioneers. All rights reserved.</p>
        </div>
    </footer>
</template>

