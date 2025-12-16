<script setup lang="ts">
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'
import { toast } from 'vue-sonner'

definePageMeta({
	middleware: ['sanctum:auth'],
})

const router = useRouter()
const { t } = useI18n()

useHead({
	title: t('pages.collections.create.title'),
})

// Form schema matching StoreBlueprintCollectionRequest
type Schema = {
	title: string
	description: string | null
	status: string
	is_anonymous: boolean
}

// Initialize form with Precognition
const form = usePrecognitionForm<Schema>('post', '/api/v1/collections', {
	title: '',
	description: null,
	status: 'draft',
	is_anonymous: false,
})

// Loading state for form submission
const isSubmitting = ref(false)

// Submit handler
const submit = async (status: 'draft' | 'published' = 'draft') => {
	if (isSubmitting.value) {
		return
	}

	try {
		isSubmitting.value = true

		// Set status
		form.fields.status = status

		// Use Sanctum client directly
		const sanctumClient = useSanctumClient()
		const response = await sanctumClient<{ data: { id: string } }>(
			'/api/v1/collections',
			{
				method: 'POST',
				body: {
					title: form.fields.title,
					description: form.fields.description,
					status: form.fields.status,
					is_anonymous: form.fields.is_anonymous,
				},
			}
		)

		const message =
			status === 'published'
				? t('pages.collections.create.successPublished')
				: t('pages.collections.create.successDraft')
		toast.success(message)

		// Redirect to collection detail page
		if (response.data?.id) {
			await router.push(`/collections/${response.data.id}`)
		}
	} catch (error) {
		const { isValidationError, bag } = useSanctumError(error)

		if (isValidationError) {
			// Manually populate form.errors from validation errors
			const validationErrors: Record<string, string[]> = {}
			bag.forEach((err) => {
				const field = err.name
				if (field) {
					if (validationErrors[field]) {
						validationErrors[field].push(err.message)
					} else {
						validationErrors[field] = [err.message]
					}
				}
			})

			// Update form.errors by clearing and reassigning
			const currentErrorKeys = Object.keys(form.errors)
			currentErrorKeys.forEach((key) => {
				if (typeof form.forgetError === 'function') {
					form.forgetError(key as keyof typeof form.fields)
				}
			})

			// Assign new errors
			Object.assign(form.errors, validationErrors)

			toast.error(t('pages.collections.create.errorValidation'))
		} else {
			toast.error(t('pages.collections.create.errorFailed'))
		}
	} finally {
		isSubmitting.value = false
	}
}
</script>

<template>
	<div class="wave-bg bg-cool-gray-10 before:bg-size-[400px] min-h-screen">
		<div class="container mx-auto px-4 py-6">
			<div class="max-w-4xl mx-auto">
				<div
					class="bg-white dark:bg-cool-gray-95 rounded-lg border border-cool-gray-20 dark:border-cool-gray-80 p-6 space-y-6"
				>
					<h1 class="font-bold text-3xl">
						{{ t('pages.collections.create.title') }}
					</h1>

					<!-- Validation Errors Alert -->
					<div
						v-if="form.hasErrors"
						class="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2"
					>
						<p class="text-sm font-medium text-destructive">
							{{
								t(
									'pages.collections.create.validationErrorsTitle'
								)
							}}
						</p>
						<ul
							class="list-disc list-inside text-sm text-destructive space-y-1"
						>
							<li
								v-for="(error, field) in form.errors"
								:key="field"
							>
								<strong>{{ field }}:</strong>
								{{ Array.isArray(error) ? error[0] : error }}
							</li>
						</ul>
					</div>

					<form
						class="space-y-6"
						@submit.prevent="() => submit('draft')"
					>
						<!-- Title -->
						<div class="space-y-2">
							<Label for="title">{{
								t('pages.collections.create.titleLabel')
							}}</Label>
							<Input
								id="title"
								v-model="form.fields.title"
								:placeholder="
									t(
										'pages.collections.create.titlePlaceholder'
									)
								"
								:aria-invalid="!!form.errors.title"
								@change="form.validate('title')"
							/>
							<p
								v-if="form.errors.title"
								class="text-xs text-destructive"
							>
								{{
									Array.isArray(form.errors.title)
										? form.errors.title[0]
										: form.errors.title
								}}
							</p>
						</div>

						<!-- Description -->
						<div class="space-y-2">
							<Label for="description">{{
								t('pages.collections.create.descriptionLabel')
							}}</Label>
							<textarea
								id="description"
								v-model="form.fields.description"
								rows="6"
								class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
								:placeholder="
									t(
										'pages.collections.create.descriptionPlaceholder'
									)
								"
								:aria-invalid="!!form.errors.description"
								@change="form.validate('description')"
							/>
							<p
								v-if="form.errors.description"
								class="text-xs text-destructive"
							>
								{{
									Array.isArray(form.errors.description)
										? form.errors.description[0]
										: form.errors.description
								}}
							</p>
						</div>

						<!-- Anonymous Checkbox -->
						<div class="space-y-2">
							<div class="flex items-center space-x-2">
								<Checkbox
									id="is_anonymous"
									v-model="form.fields.is_anonymous"
									@update:checked="
										form.validate('is_anonymous')
									"
								/>
								<Label
									for="is_anonymous"
									class="text-sm font-normal cursor-pointer"
								>
									{{
										t(
											'pages.collections.create.postAnonymously'
										)
									}}
								</Label>
							</div>
							<p
								v-if="form.errors.is_anonymous"
								class="text-xs text-destructive"
							>
								{{
									Array.isArray(form.errors.is_anonymous)
										? form.errors.is_anonymous[0]
										: form.errors.is_anonymous
								}}
							</p>
						</div>

						<!-- Submit Buttons -->
						<div class="flex justify-end gap-3 pt-4">
							<Button
								type="button"
								:disabled="isSubmitting"
								variant="outline"
								class="min-w-[120px]"
								@click="submit('draft')"
							>
								<span
									v-if="
										isSubmitting &&
										form.fields.status === 'draft'
									"
									>{{
										t('pages.collections.create.saving')
									}}</span
								>
								<span v-else>{{
									t('pages.collections.create.saveDraft')
								}}</span>
							</Button>
							<Button
								type="button"
								:disabled="isSubmitting"
								class="min-w-[120px]"
								@click="submit('published')"
							>
								<span
									v-if="
										isSubmitting &&
										form.fields.status === 'published'
									"
									>{{
										t('pages.collections.create.publishing')
									}}</span
								>
								<span v-else>{{
									t('pages.collections.create.publish')
								}}</span>
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>
