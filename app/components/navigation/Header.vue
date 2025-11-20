<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { useLoginModal } from '~/composables/useLoginModal'
import Logo from '../icons/Logo.vue';
import LoginIcon from '../icons/LoginIcon.vue';

const { isAuthenticated } = useSanctumAuth();
const { open } = useLoginModal();
</script>
<template>
    <header class="flex items-center h-16.5 px-7.5">
        <div>
            <NuxtLinkLocale to="/">
                <Logo />
            </NuxtLinkLocale>
        </div>
        <nav class="ml-7.5">
            <ul class="flex items-center gap-7.5">
                <li>
                    <NuxtLinkLocale to="/">
                        Blueprints
                    </NuxtLinkLocale>
                </li>
                <li>
                    <NuxtLinkLocale to="/collections">
                        Collections
                    </NuxtLinkLocale>
                </li>
            </ul>
        </nav>
        <div class="ml-auto">
            <!-- <LanguageSwitcher /> -->
            <template v-if="!isAuthenticated">
                <Button class="w-40 px-4.5 justify-between" @click="open" variant="default">
                    <span class="flex items-center gap-2.5">
                        <LoginIcon class="h-5" />
                        <span class="h-3.5 w-px bg-cool-gray-50"></span>
                    </span>
                    Sign In
                </Button>
            </template>
            <template v-else>
                <!-- TODO: Profile Menu -->
            </template>
        </div>
    </header>
</template>