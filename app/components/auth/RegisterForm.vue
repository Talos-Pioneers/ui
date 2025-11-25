<script setup lang="ts">
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import MailIcon from '~/components/icons/MailIcon.vue'
import UserIcon from '~/components/icons/UserIcon.vue'
import GoogleIcon from '~/components/icons/GoogleIcon.vue'
import DiscordIcon from '~/components/icons/DiscordIcon.vue'

const config = useSanctumConfig();
const { locale } = useI18n()
const { close } = useRegisterModal()
const { open: openLogin } = useLoginModal()

const googleUrl = `${config.baseUrl}/auth/google/redirect?locale=${locale.value}`;
const discordUrl = `${config.baseUrl}/auth/discord/redirect?locale=${locale.value}`;

type Schema = {
    username: string
    email: string
    locale: string
}

const form = usePrecognitionForm<Schema>('post', '/register', {
    username: '',
    email: '',
    locale: locale.value,
})

const submit = () => {
    console.log(form.fields);
    form.submit().then((response) => {
        close();
    }).catch((error) => {
        console.log(error);
    });
}
</script>

<template>
    <div class="relative w-full max-w-md">
        <!-- Title Section -->
        <div class="text-center mb-6">
            <h1
                class="text-[2rem] h-8 font-secondary flex justify-center items-center gap-5 font-black text-cool-gray-90 mb-2">
                <span class="text-cool-gray-40 font-sans">[</span> REGISTER <span
                    class="text-cool-gray-40 font-sans">]</span>
            </h1>
            <!-- Placeholder for special font glyphs -->
            <div class="text-sm text-cool-gray-40 font-sarkaz">
                <!-- Special font glyphs will be rendered here -->
                <span>REGISTER</span>
            </div>
        </div>

        <!-- Username Input -->
        <div class="mb-4">
            <div class="relative">
                <div class="absolute left-3 top-1/2 -translate-y-1/2">
                    <UserIcon />
                </div>
                <Input class="pl-10" v-model="form.fields.username" type="text" placeholder="Enter username" />
            </div>
        </div>

        <!-- Email Input -->
        <div class="mb-4">
            <div class="relative">
                <div class="absolute left-3 top-1/2 -translate-y-1/2">
                    <MailIcon />
                </div>
                <Input class="pl-10" v-model="form.fields.email" type="email" placeholder="Enter email address" />
            </div>
        </div>

        <!-- Primary Register Button -->
        <form @submit.prevent="submit" class="mb-4">
            <Button type="submit" class="w-full" variant="default" rounded="base">
                Register
            </Button>
        </form>

        <!-- Links Section -->
        <div class="flex justify-between mb-4 text-sm">
            <button @click="close(); openLogin()" class="text-[#1b1b18] dark:text-[#EDEDEC] hover:underline">
                Log In
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
                <span class="text-[#1b1b18] dark:text-[#EDEDEC] font-medium">Register with Google</span>
            </Button>
            <Button class="bg-transparent" as="a" :href="discordUrl" variant="outline" rounded="base" :withWave="false">
                <DiscordIcon />
                <span class="text-[#1b1b18] dark:text-[#EDEDEC] font-medium">Register with Discord</span>
            </Button>
        </div>
    </div>
</template>