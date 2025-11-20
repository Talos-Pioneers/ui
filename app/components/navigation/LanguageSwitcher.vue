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
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button variant="secondary" class="w-40 px-4.5 justify-between hidden md:flex">
                <span class="flex items-center gap-2.5">
                    <LanguageIcon class="h-5" />
                    <span class="h-3.5 w-px bg-cool-gray-50"></span>
                </span>
                <span class="flex items-center">
                    <span>{{ currentLocale?.name ?? currentLocale?.code }}</span>
                    <ChevronIcon class="w-4.5 h-4.5 mt-0.5" />
                </span>
            </Button>
            <Button class="md:hidden" variant="secondary" size="icon-lg">
                <LanguageIcon class="h-5" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-40 rounded-2xl">
            <DropdownMenuItem v-for="locale in locales" :key="locale.code" as-child>
                <NuxtLink :to="switchLocalePath(locale.code)">
                    {{ locale.name ?? locale.code }}
                </NuxtLink>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>