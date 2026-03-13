<script setup lang="ts">
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { useTheme, type UserPreference } from '~/composables/useTheme'

const { t } = useI18n()
const { preference, themes, setTheme } = useTheme()

const iconMap: Record<string, Component> = {
	Sun,
	Moon,
	Monitor,
}
</script>
<template>
	<div class="flex items-center gap-1 rounded-lg border border-border p-1">
		<button
			v-for="theme in themes"
			:key="theme.id"
			class="flex items-center justify-center rounded-md min-w-11 min-h-11 transition-colors"
			:class="preference === theme.id
				? 'bg-accent text-accent-foreground'
				: 'text-muted-foreground hover:text-foreground hover:bg-accent/50'"
			:aria-label="t(theme.labelKey)"
			:aria-pressed="preference === theme.id"
			@click="setTheme(theme.id as UserPreference)"
		>
			<component :is="iconMap[theme.icon]" class="h-5 w-5" />
		</button>
	</div>
</template>
