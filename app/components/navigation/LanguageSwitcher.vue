<script setup lang="ts">
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '../ui/button'
import ChevronIcon from '../icons/ChevronIcon.vue'
import LanguageIcon from '../icons/LanguageIcon.vue'
const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const currentLocale = computed(() => {
    return locales.value.find(i => i.code === locale.value)
})
</script>
<template>
    <DropdownMenu :modal="false">
        <DropdownMenuTrigger as-child>
            <Button variant="secondary" class="md:min-w-38 md:px-4.5 md:justify-between" size="responsive-icon">
                <LanguageIcon class="h-5 block md:hidden text-(--lang-switcher-icon)" />
                <span class="items-center gap-2.5 hidden md:flex">
                    <LanguageIcon class="h-5 text-(--lang-switcher-icon)" />
                    <span class="h-3.5 w-px bg-(--lang-switcher-divider)"></span>
                </span>
                <span class="items-center hidden md:flex">
                    <span class="text-(--lang-switcher-text)">{{ currentLocale?.name ?? currentLocale?.code }}</span>
                    <ChevronIcon class="w-4.5 h-4.5 mt-0.5 text-(--lang-switcher-icon)" />
                </span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-40 rounded-2xl">
            <DropdownMenuItem v-for="locale in locales" :key="locale.code" as-child>
                <NuxtLink :to="switchLocalePath(locale.code)" class="text-(--lang-switcher-text)">
                    {{ locale.name ?? locale.code }}
                </NuxtLink>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>