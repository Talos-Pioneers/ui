<script setup lang="ts">
import { Button } from '~/components/ui/button';
import backgroundImage from '@/assets/img/banners/factory1.png';
import BannerDivider from './BannerDivider.vue';
import InfoIcon from '../icons/InfoIcon.vue';
import BookIcon from '../icons/BookIcon.vue';
// background: linear-gradient(0deg, #F2F4F8, #F2F4F8),
// linear-gradient(180deg, rgba(0, 255, 254, 0) 52.88%, rgba(0, 255, 254, 0.5) 100%);

</script>
<template>
    <div class="relative block w-full h-83.5 md:h-107 bg-cool-gray-90 bg-cover bg-center"
        :style="{ background: `url(${backgroundImage}) no-repeat center center / cover` }">
        <div
            class="absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(0,255,254,0)_52.88%,rgba(0,255,254,0.5)_100%)]">
        </div>
        <div class="relative z-10 container mx-auto px-4 py-6 flex flex-col h-full justify-center">
            <h1 class="text-3xl md:text-[3.375rem]/[3.75rem] font-medium text-white mb-2">Talos Pioneers</h1>
            <BannerDivider />

            <p class="text-white md:text-lg max-w-2xl">
                Talos Pioneers is a currently work-in-progress community resource for Arknights:
                Endfield, acting as a means for fellow Endministrators to share their Automated Industry
                Complex (AIC) blueprints to each other.
            </p>
            <div class="flex gap-3 mt-6">
                <Button as-child class="min-w-56 justify-between before:absolute" variant="default" rounded="base">
                    <NuxtLinkLocale to="/privacy-policy">
                        <BookIcon class="size-6" />
                        <span class="flex gap-3 items-center text-cool-gray-100">
                            <span>Privacy Policy</span>
                            <svg width="8" height="12" viewBox="0 0 8 12" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 10.59L4.58 6L0 1.41L1.41 0L7.41 6L1.41 12L0 10.59Z" fill="currentColor" />
                            </svg>
                        </span>
                    </NuxtLinkLocale>
                </Button>
                <Button as-child class="min-w-56 justify-between" variant="outline" rounded="base">
                    <NuxtLinkLocale to="/about">
                        <InfoIcon class="size-6" />
                        <span class="flex gap-3 items-center text-cool-gray-70">
                            <span class="text-cool-gray-70">About</span>
                            <svg width="8" height="12" viewBox="0 0 8 12" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 10.59L4.58 6L0 1.41L1.41 0L7.41 6L1.41 12L0 10.59Z" fill="currentColor" />
                            </svg>
                        </span>
                    </NuxtLinkLocale>
                </Button>
            </div>
        </div>
    </div>
</template>