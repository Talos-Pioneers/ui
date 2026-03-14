<script setup lang="ts">
import ThemeLightIcon from '~/components/icons/ThemeLightIcon.vue'
import ThemeDarkIcon from '~/components/icons/ThemeDarkIcon.vue'
import { Button } from '~/components/ui/button'
import { useTheme, THEMES } from '~/composables/useTheme'

const { t } = useI18n()
const { resolved, toggleTheme } = useTheme()

const iconMap: Record<string, Component> = {
	Sun: ThemeLightIcon,
	Moon: ThemeDarkIcon,
}

const currentIcon = computed(() => {
	const theme = THEMES.find(th => th.id === resolved.value)
	return theme ? iconMap[theme.icon] : iconMap[THEMES[0].icon]
})
</script>
<template>
	<div class="hidden nav:inline-flex">
		<Button
			variant="secondary"
			size="responsive-icon"
			class="nav:w-11.5"
			:aria-label="t('theme.toggle')"
			@click="toggleTheme"
		>
			<Transition name="theme-icon" mode="out-in">
				<component
					:is="currentIcon"
					:key="resolved"
					class="h-5 w-5"
				/>
			</Transition>
		</Button>
	</div>
</template>
<style scoped>
.theme-icon-enter-active,
.theme-icon-leave-active {
	transition: opacity 0.15s ease, transform 0.15s ease;
}
.theme-icon-enter-from {
	opacity: 0;
	transform: rotate(-90deg) scale(0.8);
}
.theme-icon-leave-to {
	opacity: 0;
	transform: rotate(90deg) scale(0.8);
}
</style>
