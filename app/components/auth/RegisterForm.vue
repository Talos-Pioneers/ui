<script setup lang="ts">
const config = useSanctumConfig();
const { locale } = useI18n()

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
const state = form.fields;
</script>

<template>
    <div>
        <h1>Register</h1>
        <form @submit.prevent="form.submit">
            <input type="text" v-model="state.username" placeholder="Username" />
            <input type="email" v-model="state.email" placeholder="Email" />
            <button type="submit">Register</button>
        </form>
        <div class="flex justify-between">
            <a :href="googleUrl">Login with Google</a>
            <a :href="discordUrl">Login with Discord</a>
        </div>
    </div>
</template>