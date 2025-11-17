<script setup lang="ts">
const email = ref('');
const { register } = useSanctumAuth();
const submit = async () => {
    await register({
        email: email.value,
    });
}
</script>

<template>
    <div>
        <h1>Register</h1>
        <form @submit.prevent="submit">
            <input type="email" v-model="email" placeholder="Email" />
            <button type="submit">Register</button>
        </form>
    </div>
</template>