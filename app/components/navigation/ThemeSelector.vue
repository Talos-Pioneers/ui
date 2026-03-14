<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Button } from '~/components/ui/button'
import { useTheme, type ThemeId } from '~/composables/useTheme'

const { t } = useI18n()
const { preference, resolved, themes, setTheme } = useTheme()

const iconMap: Record<string, Component> = {
	Sun,
	Moon,
}

const triggerIcon = computed(() => {
	const theme = themes.find(th => th.id === resolved.value)
	return theme ? iconMap[theme.icon] : iconMap[themes[0].icon]
})
</script>
<template>
	<div class="hidden md:inline-flex">
	<DropdownMenu>
		<DropdownMenuTrigger as-child>
			<Button
				variant="secondary"
				size="responsive-icon"
				:aria-label="t('theme.change')"
			>
				<component
					:is="triggerIcon"
					class="h-5 w-5"
				/>
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent class="w-40 rounded-2xl" align="end">
			<DropdownMenuItem
				v-for="theme in themes"
				:key="theme.id"
				class="flex items-center gap-2 cursor-pointer"
				:class="{ 'bg-accent': preference === theme.id }"
				@click="setTheme(theme.id as ThemeId)"
			>
				<component :is="iconMap[theme.icon]" class="h-4 w-4" />
				{{ t(theme.labelKey) }}
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
	</div>
</template>
