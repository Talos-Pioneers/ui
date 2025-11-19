<script setup lang="ts">
const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() => {
    return locales.value.filter(i => i.code !== locale.value)
})
</script>
<template>
    <div>
        <template v-for="(locale, index) in availableLocales" :key="locale.code">
            <span v-if="index"> | </span>
            <NuxtLink :to="switchLocalePath(locale.code)">
                {{ locale.name ?? locale.code }}
            </NuxtLink>
        </template>
    </div>
</template>