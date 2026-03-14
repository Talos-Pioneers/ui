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
            <Button variant="secondary" class="nav:min-w-40 nav:px-4.5 nav:justify-between" size="responsive-icon">
                <LanguageIcon class="h-5 block nav:hidden text-(--lang-switcher-icon)" />
                <span class="items-center gap-2.5 hidden nav:flex">
                    <LanguageIcon class="h-5 text-(--lang-switcher-icon)" />
                    <span class="h-3.5 w-px bg-(--lang-switcher-divider)"></span>
                </span>
                <span class="items-center hidden nav:flex">
                    <span class="text-(--lang-switcher-text)">{{ currentLocale?.name ?? currentLocale?.code }}</span>
                    <ChevronIcon class="w-4.5 h-4.5 mt-0.5 text-(--lang-switcher-icon)" />
                </span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-40">
            <DropdownMenuItem v-for="locale in locales" :key="locale.code" as-child>
                <NuxtLink :to="switchLocalePath(locale.code)" class="text-(--lang-switcher-text)">
                    {{ locale.name ?? locale.code }}
                </NuxtLink>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>