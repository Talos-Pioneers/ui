<script setup lang="ts">
import LoginForm from '~/components/auth/LoginForm.vue'
import { toast } from 'vue-sonner'

const { user, isAuthenticated } = useSanctumAuth()

if (isAuthenticated.value) {
	// this toast doesn't seem to show. but it's not necessary anyway
	// also i don't want to localize it lol
	// toast.error('You are already logged in. Redirecting...')
	navigateTo('/')
}
</script>

<template>
	<div
		class="flex justify-center items-center h-[calc(100vh-var(--header-height))] px-4"
	>
		<LoginForm />
	</div>
</template>
