<script setup lang="ts">
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import MailIcon from '~/components/icons/MailIcon.vue'
import GoogleIcon from '~/components/icons/GoogleIcon.vue'
import DiscordIcon from '~/components/icons/DiscordIcon.vue'
import inputPattern from '@/assets/img/input-pattern.svg'
import waveBg from '@/assets/img/wave-bg.svg'

const email = ref('');
const config = useSanctumConfig();
const { locale } = useI18n()
const { close } = useLoginModal()
const { open: openRegister } = useRegisterModal()

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
            <h1
                class="text-[2rem] h-8 font-secondary flex justify-center items-center gap-5 font-black text-cool-gray-90 mb-2">
                <span class="text-cool-gray-40 font-sans">[</span> LOG IN <span
                    class="text-cool-gray-40 font-sans">]</span>
            </h1>
            <!-- Placeholder for special font glyphs -->
            <div class="text-sm text-cool-gray-40 font-sarkaz">
                <!-- Special font glyphs will be rendered here -->
                <span>LOG IN</span>
            </div>
        </div>

        <!-- Email Input -->
        <div class="mb-4">
            <div class="relative">
                <div class="absolute left-3 top-1/2 -translate-y-1/2">
                    <MailIcon />
                </div>
                <Input class="pl-10" v-model="email" type="email" placeholder="Enter email address" />
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
            <button @click="close(); openRegister()" class="text-[#1b1b18] dark:text-[#EDEDEC] hover:underline">
                Register
            </button>
            <NuxtLinkLocale to="/privacy-policy" class="text-[#1b1b18] dark:text-[#EDEDEC] hover:underline">
                Privacy Policy
            </NuxtLinkLocale>
        </div>

        <!-- Divider -->
        <div class="border-t border-[#e3e3e0] dark:border-[#3E3E3A] mb-4"></div>

        <!-- Social Login Buttons -->
        <div class="flex flex-col gap-3">
            <Button class="bg-transparent" as="a" :href="googleUrl" variant="outline" rounded="base" :withWave="false">
                <GoogleIcon />
                <span class="text-[#1b1b18] dark:text-[#EDEDEC] font-medium">Log in with Google</span>
            </Button>
            <Button class="bg-transparent" as="a" :href="discordUrl" variant="outline" rounded="base" :withWave="false">
                <DiscordIcon />
                <span class="text-[#1b1b18] dark:text-[#EDEDEC] font-medium">Log in with Discord</span>
            </Button>
        </div>
    </div>
</template>