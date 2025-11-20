<script setup>
// definePageMeta({
//     title: 'pages.title.top' // set resource key
// })

import { Button } from '~/components/ui/button';
const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() => {
    return locales.value.filter(i => i.code !== locale.value)
})
const { user } = useSanctumAuth();

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
        <AuthLoginForm />

        <br>

        <Button variant="secondary">Sign In</Button>
    </div>
</template>
