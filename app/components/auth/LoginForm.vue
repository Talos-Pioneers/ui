<script setup lang="ts">
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import MailIcon from '~/components/icons/MailIcon.vue'
import GoogleIcon from '~/components/icons/GoogleIcon.vue'
import DiscordIcon from '~/components/icons/DiscordIcon.vue'
import buttonWaveImage from '@/assets/img/button-waves.png'

const email = ref('');
const config = useSanctumConfig();
const { locale } = useI18n()
const { close } = useLoginModal()

const googleUrl = `${config.baseUrl}/auth/google/redirect?locale=${locale.value}`;
const discordUrl = `${config.baseUrl}/auth/discord/redirect?locale=${locale.value}`;
const { login } = useSanctumAuth();
const submit = async () => {
    try {
        await login({
            email: email.value,
        });
        close();
    } catch (error) {
        const err = useSanctumError(error)
        console.log(err);
    }
}
</script>

<template>
    <div class="relative w-full max-w-md">
        <!-- Title Section -->
        <div class="text-center mb-6">
            <h1 class="text-2xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] mb-2">
                <span class="opacity-50">[</span> LOG IN <span class="opacity-50">]</span>
            </h1>
            <!-- Placeholder for special font glyphs -->
            <div class="text-sm text-[#706f6c] dark:text-[#A1A09A] font-special">
                <!-- Special font glyphs will be rendered here -->
                <span class="opacity-0">placeholder</span>
            </div>
        </div>

        <!-- Email Input -->
        <div class="mb-4">
            <div class="relative">
                <div class="absolute left-3 top-1/2 -translate-y-1/2">
                    <MailIcon />
                </div>
                <Input v-model="email" type="email" placeholder="Enter email address"
                    class="pl-10 h-12 rounded-lg bg-white dark:bg-[#161615] border border-[#e3e3e0] dark:border-[#3E3E3A] text-[#1b1b18] dark:text-[#EDEDEC] placeholder:text-[#706f6c] dark:placeholder:text-[#A1A09A]" />
            </div>
        </div>

        <!-- Primary Login Button -->
        <form @submit.prevent="submit" class="mb-4">
            <Button type="submit" class="w-full" variant="default" rounded="base">
                Log In
            </Button>
        </form>

        <!-- Links Section -->
        <div class="flex justify-between mb-4 text-sm">
            <NuxtLinkLocale to="/register" class="text-[#1b1b18] dark:text-[#EDEDEC] hover:underline">
                Register
            </NuxtLinkLocale>
            <NuxtLinkLocale to="/privacy-policy" class="text-[#1b1b18] dark:text-[#EDEDEC] hover:underline">
                Privacy Policy
            </NuxtLinkLocale>
        </div>

        <!-- Divider -->
        <div class="border-t border-[#e3e3e0] dark:border-[#3E3E3A] mb-4"></div>

        <!-- Social Login Buttons -->
        <div class="flex flex-col gap-3">
            <Button as="a" :href="googleUrl" variant="outline" rounded="base" :withWave="false">
                <GoogleIcon />
                <span class="text-[#1b1b18] dark:text-[#EDEDEC] font-medium">Log in with Google</span>
            </Button>
            <Button as="a" :href="discordUrl" variant="outline" rounded="base" :withWave="false">
                <DiscordIcon />
                <span class="text-[#1b1b18] dark:text-[#EDEDEC] font-medium">Log in with Discord</span>
            </Button>
        </div>
    </div>
</template>