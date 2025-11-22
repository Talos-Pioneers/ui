<script setup>
// definePageMeta({
//     title: 'pages.title.top' // set resource key
// })

import BlueprintList from '~/components/blueprints/BlueprintList.vue';
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
        <BlueprintList />
    </div>
</template>
