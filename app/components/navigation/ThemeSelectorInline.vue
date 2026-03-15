<script setup lang="ts">
import ThemeLightIcon from '~/components/icons/ThemeLightIcon.vue'
import ThemeDarkIcon from '~/components/icons/ThemeDarkIcon.vue'
import { useTheme, type ThemeId } from '~/composables/useTheme'

const { t } = useI18n()
const { preference, themes, setTheme } = useTheme()

const iconMap: Record<string, Component> = {
	Sun: ThemeLightIcon,
	Moon: ThemeDarkIcon,
}
</script>
<template>
	<div class="flex items-center gap-1 rounded-lg border border-border p-1 w-fit">
		<button
			v-for="theme in themes"
			:key="theme.id"
			class="flex items-center justify-center rounded-md min-w-11 min-h-11 transition-colors"
			:class="preference === theme.id
				? 'bg-accent text-accent-foreground'
				: 'text-muted-foreground hover:text-foreground hover:bg-accent/50'"
			:aria-label="t('theme.toggle')"
			:aria-pressed="preference === theme.id"
			@click="setTheme(theme.id as ThemeId)"
		>
			<component :is="iconMap[theme.icon]" class="h-5 w-5" />
		</button>
	</div>
</template>
