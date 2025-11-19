<script setup lang="ts">
const email = ref('');
const config = useSanctumConfig();
const { locale } = useI18n()

const googleUrl = `${config.baseUrl}/auth/google/redirect?locale=${locale.value}`;
const discordUrl = `${config.baseUrl}/auth/discord/redirect?locale=${locale.value}`;
const { login } = useSanctumAuth();
const submit = async () => {
    try {
        await login({
            email: email.value,
        });
    } catch (error) {
        const err = useSanctumError(error)
        console.log(err);
    }
}
</script>

<template>
    <div>
        <h1>Login</h1>
        <form @submit.prevent="submit">
            <input type="email" v-model="email" placeholder="Email" />
            <button type="submit">Login</button>
        </form>
        <div class="flex justify-between">
            <a :href="googleUrl">Login with Google</a>
            <a :href="discordUrl">Login with Discord</a>
        </div>
    </div>
</template>