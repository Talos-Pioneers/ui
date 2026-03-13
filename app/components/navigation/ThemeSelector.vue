<script setup lang="ts">
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Button } from '~/components/ui/button'
import { useTheme, type UserPreference } from '~/composables/useTheme'

const { t } = useI18n()
const { preference, resolved, themes, setTheme } = useTheme()

const iconMap: Record<string, Component> = {
	Sun,
	Moon,
	Monitor,
}

const triggerIcon = computed(() => {
	if (resolved.value === 'dark') return Moon
	if (resolved.value === 'light') return Sun
	return Monitor
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
				@click="setTheme(theme.id as UserPreference)"
			>
				<component :is="iconMap[theme.icon]" class="h-4 w-4" />
				{{ t(theme.labelKey) }}
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
	</div>
</template>
