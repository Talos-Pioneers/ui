<script setup lang="ts">
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import MailIcon from '~/components/icons/MailIcon.vue'
import GoogleIcon from '~/components/icons/GoogleIcon.vue'
import DiscordIcon from '~/components/icons/DiscordIcon.vue'
import { FieldError } from '../ui/field'

const email = ref('')
const config = useSanctumConfig()
const { locale, t } = useI18n()
const { close } = useLoginModal()
const { open: openRegister } = useRegisterModal()

const googleUrl = `${config.baseUrl}/auth/google/redirect?locale=${locale.value}`
const discordUrl = `${config.baseUrl}/auth/discord/redirect?locale=${locale.value}`
const { login } = useSanctumAuth()
const errors = ref<{ name: string; message: string }[]>([])
const isSubmitted = ref(false)

const submit = async () => {
	try {
		await login(
			{
				email: email.value,
			},
			false
		)
		isSubmitted.value = true
	} catch (error) {
		const err = useSanctumError(error)
		errors.value = err.bag
	}
}

const handleRegisterClick = () => {
	close()
	openRegister()
}
</script>

<template>
	<div class="relative w-full max-w-md">
		<Transition name="fade" mode="out-in">
			<!-- Form State -->
			<div v-if="!isSubmitted" key="form">
				<!-- Title Section -->
				<div class="text-center mb-6">
					<h1
						class="text-[2rem] h-8 font-secondary flex justify-center items-center gap-5 font-[1000] text-cool-gray-90 mb-2"
					>
						<span class="text-cool-gray-40 font-sans">[</span>
						{{ t('auth.login.title') }}
						<span class="text-cool-gray-40 font-sans">]</span>
					</h1>
					<!-- Placeholder for special font glyphs -->
					<div class="text-sm text-cool-gray-40 font-sarkaz">
						<!-- Special font glyphs will be rendered here -->
						<span>{{ t('auth.login.title') }}</span>
					</div>
				</div>

				<!-- Email Input -->
				<div class="mb-4">
					<div class="relative">
						<div class="absolute left-3 top-1/2 -translate-y-1/2">
							<MailIcon />
						</div>
						<Input
							v-model="email"
							class="pl-10"
							type="email"
							:placeholder="t('auth.login.emailPlaceholder')"
						/>
						<FieldError :errors="errors" />
					</div>
				</div>

				<!-- Primary Login Button -->
				<form class="mb-4" @submit.prevent="submit">
					<Button
						type="submit"
						class="w-full"
						variant="default"
						rounded="base"
					>
						{{ t('auth.login.submit') }}
					</Button>
				</form>

				<!-- Links Section -->
				<div class="flex justify-between mb-4 text-sm">
					<button
						class="text-[#1b1b18] dark:text-[#EDEDEC] hover:underline"
						@click="handleRegisterClick"
					>
						{{ t('auth.common.registerLink') }}
					</button>
					<NuxtLinkLocale
						to="/privacy-policy"
						class="text-[#1b1b18] dark:text-[#EDEDEC] hover:underline"
					>
						{{ t('auth.common.privacyPolicy') }}
					</NuxtLinkLocale>
				</div>

				<!-- Divider -->
				<div
					class="border-t border-[#e3e3e0] dark:border-[#3E3E3A] mb-4"
				/>

				<!-- Social Login Buttons -->
				<div class="flex flex-col gap-3">
					<Button
						class="bg-transparent"
						as="a"
						:href="googleUrl"
						variant="outline"
						rounded="base"
						:with-wave="false"
					>
						<GoogleIcon />
						<span
							class="text-[#1b1b18] dark:text-[#EDEDEC] font-medium"
							>{{ t('auth.common.googleLogin') }}</span
						>
					</Button>
					<Button
						class="bg-transparent"
						as="a"
						:href="discordUrl"
						variant="outline"
						rounded="base"
						:with-wave="false"
					>
						<DiscordIcon />
						<span
							class="text-[#1b1b18] dark:text-[#EDEDEC] font-medium"
							>{{ t('auth.common.discordLogin') }}</span
						>
					</Button>
				</div>
			</div>

			<!-- Success State -->
			<div v-else key="success" class="text-center">
				<!-- Title Section -->
				<div class="text-center mb-6 flex flex-col">
					<h1
						class="text-[2rem] h-8 font-secondary flex justify-center items-center gap-5 font-[1000] leading-8 text-cool-gray-90 mb-2"
					>
						<span class="text-cool-gray-40 font-sans">[</span>
						{{ t('auth.login.successTitle') }}
						<span class="text-cool-gray-40 font-sans">]</span>
					</h1>
					<!-- Placeholder for special font glyphs -->
					<div class="text-sm text-cool-gray-40 font-sarkaz mt-3 md:mt-0">
						<!-- Special font glyphs will be rendered here -->
						<span>{{ t('auth.login.successTitle') }}</span>
					</div>
				</div>

				<!-- Success Message -->
				<div class="mb-6">
					<p class="text-cool-gray-90 dark:text-[#EDEDEC] mb-4">
						{{ t('auth.login.successMessage') }}
					</p>
					<p class="text-sm text-cool-gray-60 dark:text-cool-gray-40">
						{{ t('auth.login.instructions') }}
					</p>
				</div>

				<!-- Close Button -->
				<Button
					class="w-full"
					variant="default"
					rounded="base"
					@click="close()"
				>
					{{ t('auth.common.loginLink') }}
				</Button>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
