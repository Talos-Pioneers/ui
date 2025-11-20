<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { useLoginModal } from '~/composables/useLoginModal'
import Logo from '../icons/Logo.vue';
import LoginIcon from '../icons/LoginIcon.vue';
import LanguageSwitcher from './LanguageSwitcher.vue';
import LogoMobileIcon from '../icons/LogoMobileIcon.vue';

const { isAuthenticated } = useSanctumAuth();
const { open } = useLoginModal();

const navigationItems = [
    {
        label: 'Blueprints',
        to: '/',
    },
    {
        label: 'Collections',
        to: '/collections',
    },
]
</script>
<template>
    <header class="flex items-center h-16.5 px-7.5 border-b border-cool-gray-20">
        <div>
            <NuxtLinkLocale to="/">
                <Logo class="hidden md:block" />
                <LogoMobileIcon class="block md:hidden" />
            </NuxtLinkLocale>
        </div>
        <nav class="ml-7.5 h-full">
            <ul class="flex items-center gap-7.5 h-full">
                <li v-for="item in navigationItems" :key="item.to" class="h-full flex items-center">
                    <NuxtLinkLocale active-class="text-cool-gray-80 border-b-2 h-full border-black"
                        class="text-cool-gray-60 hover:text-cool-gray-80 h-full flex items-center" :to="item.to">
                        {{ item.label }}
                    </NuxtLinkLocale>
                </li>
            </ul>
        </nav>
        <div class="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <template v-if="!isAuthenticated">
                <Button class="w-40 px-4.5 justify-between hidden md:flex" @click="open" variant="default">
                    <span class="flex items-center gap-2.5">
                        <LoginIcon class="h-5" />
                        <span class="h-3.5 w-px bg-cool-gray-50"></span>
                    </span>
                    Sign In
                </Button>
                <Button @click="open" class="md:hidden" variant="default" size="icon-lg">
                    <LoginIcon class="h-5" />
                </Button>
            </template>
            <template v-else>
                <!-- TODO: Profile Menu -->
            </template>
        </div>
    </header>
</template>