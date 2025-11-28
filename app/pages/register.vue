<script setup lang="ts">
import RegisterForm from '~/components/auth/RegisterForm.vue'

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
		class="flex pt-10 justify-center items-center h-[calc(100vh-var(--header-height))]"
	>
		<RegisterForm />
	</div>
</template>
