<script setup lang="ts">
const email = ref('');
const password = ref('');
const { login } = useSanctumAuth();
const submit = async () => {
    await login({
        email: email.value,
    });
}
</script>

<template>
    <div>
        <h1>Login</h1>
        <form @submit.prevent="submit">
            <input type="email" v-model="email" placeholder="Email" />
            <button type="submit">Login</button>
        </form>
    </div>
</template>