<script setup>
// definePageMeta({
//     title: 'pages.title.top' // set resource key
// })

const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() => {
    return locales.value.filter(i => i.code !== locale.value)
})

const email = ref('');
const { login, user } = useSanctumAuth();
const submit = async () => {
    await login({
        email: email.value,
    });
}

</script>

<template>
    <div>
        <p>Current Locale: {{ locale }}</p>
        <nav>
            <template v-for="(locale, index) in availableLocales" :key="locale.code">
                <span v-if="index"> | </span>
                <NuxtLink :to="switchLocalePath(locale.code)">
                    {{ locale.name ?? locale.code }}
                </NuxtLink>
            </template>
        </nav>
        <p>User: {{ user }}</p>
        <form @submit.prevent="submit">
            <input type="email" v-model="email" placeholder="Email" />
            <button type="submit">Login</button>
        </form>
    </div>
</template>
