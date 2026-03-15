<script setup lang="ts">
import LoginForm from '~/components/auth/LoginForm.vue'
import RegisterForm from '~/components/auth/RegisterForm.vue'

const { isAuthenticated } = useSanctumAuth()
const route = useRoute()

if (isAuthenticated.value) {
	navigateTo('/')
}

const mode = ref<'login' | 'register'>(
	route.query.mode === 'register' ? 'register' : 'login',
)
</script>

<template>
	<div
		class="flex justify-center items-center h-[calc(100vh-var(--header-height))] px-4"
	>
		<Transition name="swap" mode="out-in">
			<LoginForm
				v-if="mode === 'login'"
				key="login"
				:on-switch-to-register="() => mode = 'register'"
			/>
			<RegisterForm
				v-else
				key="register"
				:on-switch-to-login="() => mode = 'login'"
			/>
		</Transition>
	</div>
</template>

<style scoped>
.swap-enter-active,
.swap-leave-active {
	transition: opacity 0.2s ease, transform 0.2s ease;
}
.swap-enter-from {
	opacity: 0;
	transform: translateY(6px);
}
.swap-leave-to {
	opacity: 0;
}
</style>
