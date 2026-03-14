<script setup lang="ts">
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '../ui/button'
import CheckmarkIcon from '../icons/CheckmarkIcon.vue'
import ChevronIcon from '../icons/ChevronIcon.vue'
import LanguageIcon from '../icons/LanguageIcon.vue'
const { locale, locales, setLocale } = useI18n()

const currentLocale = computed(() => {
    return locales.value.find(i => i.code === locale.value)
})

const handleLocaleChange = (code: string | number) => {
    setLocale(code as string)
}
</script>
<template>
    <DropdownMenu :modal="false">
        <DropdownMenuTrigger as-child>
            <Button variant="secondary" class="group nav:min-w-40 nav:px-4.5 nav:justify-between" size="responsive-icon">
                <LanguageIcon class="h-5 block nav:hidden text-(--lang-switcher-icon)" />
                <span class="items-center gap-2.5 hidden nav:flex">
                    <LanguageIcon class="h-5 text-(--lang-switcher-icon)" />
                    <span class="h-3.5 w-px bg-(--lang-switcher-divider)"></span>
                </span>
                <span class="items-center hidden nav:flex">
                    <span class="text-(--lang-switcher-text)">{{ currentLocale?.name ?? currentLocale?.code }}</span>
                    <ChevronIcon class="w-4.5 h-4.5 mt-0.5 text-(--lang-switcher-icon) transition-transform duration-150 group-data-[state=open]:rotate-180" />
                </span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="min-w-[var(--reka-dropdown-menu-trigger-width)]">
            <DropdownMenuRadioGroup :model-value="locale" @update:model-value="handleLocaleChange">
                <DropdownMenuRadioItem
                    v-for="loc in locales"
                    :key="loc.code"
                    :value="loc.code"
                    class="text-(--lang-switcher-text) cursor-pointer"
                >
                    <template #indicator-icon>
                        <CheckmarkIcon class="size-3 text-(--lang-switcher-checkmark)" />
                    </template>
                    {{ loc.name ?? loc.code }}
                </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
        </DropdownMenuContent>
    </DropdownMenu>
</template>
