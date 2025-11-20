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
            <Button variant="secondary" class="md:w-40 md:px-4.5 md:justify-between" size="responsive-icon">
                <LanguageIcon class="h-5 block md:hidden" />
                <span class="items-center gap-2.5 hidden md:flex">
                    <LanguageIcon class="h-5" />
                    <span class="h-3.5 w-px bg-cool-gray-50"></span>
                </span>
                <span class="items-center hidden md:flex">
                    <span>{{ currentLocale?.name ?? currentLocale?.code }}</span>
                    <ChevronIcon class="w-4.5 h-4.5 mt-0.5" />
                </span>
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