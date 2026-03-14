<script setup lang="ts">
import { Button } from '~/components/ui/button'
import LoginIcon from '../icons/LoginIcon.vue'
import { useLoginModal } from '~/composables/useLoginModal'

const { t } = useI18n()
const { open } = useLoginModal()
</script>
<template>
	<Button
		class="min-w-40 px-4.5 justify-between hidden nav:flex bg-(--sign-in-bg) before:border-(--sign-in-outline)"
		variant="default"
		@click="open"
	>
		<span class="flex items-center gap-2.5">
			<LoginIcon class="h-5 text-(--sign-in-icon)" />
			<span class="h-3.5 w-px bg-(--sign-in-divider)" />
		</span>
		<span class="text-(--sign-in-text)">{{ t('components.navigation.header.signIn') }}</span>
	</Button>
	<Button
		class="nav:hidden bg-(--sign-in-bg) before:border-(--sign-in-outline)"
		variant="default"
		size="icon-lg"
		@click="open"
	>
		<LoginIcon class="h-5 text-(--sign-in-icon)" />
	</Button>
</template>
