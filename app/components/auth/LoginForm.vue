<script setup lang="ts">
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import MailIcon from '~/components/icons/MailIcon.vue'
import GoogleIcon from '~/components/icons/GoogleIcon.vue'
import DiscordIcon from '~/components/icons/DiscordIcon.vue'
import { FieldError } from '../ui/field'
import * as Sentry from '@sentry/nuxt'

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
		Sentry.captureException(error)
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
						class="text-[2rem] h-8 font-secondary flex justify-center items-center gap-5 font-[1000] text-(--login-title) mb-2"
					>
						<span class="text-(--login-bracket) font-sans">[</span>
						{{ t('auth.login.title') }}
						<span class="text-(--login-bracket) font-sans">]</span>
					</h1>
					<!-- Placeholder for special font glyphs -->
					<div class="text-xl leading-none text-(--login-caption) font-sarkaz tracking-[1px] uppercase">
						<!-- Special font glyphs will be rendered here -->
						<span>{{ t('auth.login.title') }}</span>
					</div>
				</div>

				<form @submit.prevent="submit">
					<!-- Email Input -->
					<div class="mb-4">
						<div class="relative">
							<div class="absolute left-3 top-1/2 -translate-y-1/2 text-(--login-input-placeholder)">
								<MailIcon />
							</div>
							<Input
								v-model="email"
								class="pl-10 border-0 border-b border-(--login-input-border) rounded-none bg-white placeholder:text-(--login-input-placeholder)"
								type="email"
								:placeholder="t('auth.login.emailPlaceholder')"
							/>
						</div>
						<FieldError :errors="errors" />
					</div>

					<!-- Primary Login Button -->
					<div class="mb-4">
						<Button
							type="submit"
							class="w-full"
							variant="default"
							rounded="none"
						>
							{{ t('auth.login.submit') }}
						</Button>
					</div>
				</form>

				<!-- Links Section -->
				<div class="flex justify-between mb-4 text-sm">
					<button
						class="text-(--login-link) hover:underline"
						@click="handleRegisterClick"
					>
						{{ t('auth.common.registerLink') }}
					</button>
					<NuxtLinkLocale
						to="/privacy-policy"
						class="text-(--login-link) hover:underline"
						@click="close()"
					>
						{{ t('auth.common.privacyPolicy') }}
					</NuxtLinkLocale>
				</div>

				<!-- Divider -->
				<div
					class="border-t border-(--login-divider) mb-4"
				/>

				<!-- Social Login Buttons -->
				<div class="flex flex-col gap-3">
					<Button
						class="bg-transparent border-(--login-social-border)!"
						as="a"
						:href="googleUrl"
						variant="outline"
						rounded="none"
						:with-wave="false"
					>
						<GoogleIcon class="text-(--login-social-icon)" />
						<span
							class="text-(--login-social-text) font-medium"
							>{{ t('auth.common.googleLogin') }}</span
						>
					</Button>
					<Button
						class="bg-transparent border-(--login-social-border)!"
						as="a"
						:href="discordUrl"
						variant="outline"
						rounded="none"
						:with-wave="false"
					>
						<DiscordIcon class="text-(--login-social-icon)" />
						<span
							class="text-(--login-social-text) font-medium"
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
						class="text-[2rem] h-8 font-secondary flex justify-center items-center gap-5 font-[1000] leading-8 text-(--login-title) mb-2"
					>
						<span class="text-(--login-bracket) font-sans">[</span>
						{{ t('auth.login.successTitle') }}
						<span class="text-(--login-bracket) font-sans">]</span>
					</h1>
					<!-- Placeholder for special font glyphs -->
					<div
						class="text-xl leading-none text-(--login-caption) font-sarkaz tracking-[1px] uppercase mt-3 md:mt-0"
					>
						<!-- Special font glyphs will be rendered here -->
						<span>{{ t('auth.login.successTitle') }}</span>
					</div>
				</div>

				<!-- Success Message -->
				<div class="mb-6">
					<p class="text-foreground mb-4">
						{{ t('auth.login.successMessage') }}
					</p>
					<p class="text-sm text-muted-foreground">
						{{ t('auth.login.instructions') }}
					</p>
				</div>

				<!-- Close Button -->
				<Button
					class="w-full"
					variant="default"
					rounded="none"
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
