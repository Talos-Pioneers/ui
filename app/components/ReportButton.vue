<script setup lang="ts">
import { toast } from 'vue-sonner'
import {
	Dialog,
	DialogContent,
	DialogClose,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogTrigger,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { FieldError } from '~/components/ui/field'

const props = defineProps<{
	reportableType:
		| 'App\\Models\\Blueprint'
		| 'App\\Models\\BlueprintCollection'
	reportableId: string
	itemName?: string // Optional name for better error messages (e.g., "blueprint", "collection")
}>()

const emit = defineEmits<{
	reported: []
	error: [message: string]
}>()

const { t } = useI18n()

const isReporting = ref(false)

// note: I don't think this boolean actually does anything? Like, at all?
// closing/opening the modal is handled by DialogClose
const isModalOpen = ref(false)

const itemTypeName = computed(() => {
	return (
		props.itemName ||
		(props.reportableType === 'App\\Models\\Blueprint'
			? 'blueprint'
			: 'collection')
	)
})

const reportTitle = computed(() => {
	return `Report ${itemTypeName.value}`
})

type Schema = {
	reportable_type:
		| 'App\\Models\\Blueprint'
		| 'App\\Models\\BlueprintCollection'
	reportable_id: string
	reason: string
}
const reportForm = usePrecognitionForm<Schema>('post', '/api/v1/reports', {
	reportable_type: props.reportableType,
	reportable_id: props.reportableId,
	reason: '',
})

const maxReasonLength = 1000
const remainingCharacters = computed(() => {
	const length = reportForm.fields.reason?.length ?? 0
	return Math.max(maxReasonLength - length, 0)
})

const submitReport = async () => {
	isReporting.value = true

	try {
		await reportForm.submit()

		toast.success('Report submitted successfully.')
		emit('reported')
		isModalOpen.value = false
		resetForm()
	} catch (error: unknown) {
		const { isValidationError, code, bag } = useSanctumError(error)
		let errorMessage = 'Failed to submit report. Please try again.'
		console.log(error)

		// Check if it's a duplicate report (422 with message)
		if (code === 422) {
			const errorObj = error as {
				response?: { _data?: { message?: string } }
				data?: { message?: string }
			}
			const message =
				errorObj?.response?._data?.message || errorObj?.data?.message
			errorMessage =
				message ||
				`You have already reported this ${itemTypeName.value}.`
		} else if (isValidationError) {
			errorMessage = bag[0]?.message || 'Failed to submit report.'
		}

		toast.error(errorMessage)
		emit('error', errorMessage)
	} finally {
		isReporting.value = false
	}
}

const resetForm = () => {
	reportForm.fields.reason = ''
	reportForm.reset()
}

const handleModalClose = () => {
	isModalOpen.value = false
	resetForm()
}
</script>

<template>
	<Dialog>
		<DialogTrigger as-child>
			<button
				type="button"
				:disabled="isReporting"
				class="w-full text-left px-2 py-1.5 text-sm hover:bg-cool-gray-20 dark:hover:bg-cool-gray-80 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<span v-if="isReporting">{{
					t('reportButton.reporting')
				}}</span>
				<span v-else>{{ t('reportButton.title') }}</span>
			</button>
		</DialogTrigger>

		<DialogContent class="max-w-md">
			<DialogHeader>
				<DialogTitle>{{ reportTitle }}</DialogTitle>
				<DialogDescription>
					{{ t('reportButton.description', { itemTypeName }) }}
				</DialogDescription>
			</DialogHeader>

			<div class="space-y-4 py-4">
				<div class="space-y-2">
					<textarea
						v-model="reportForm.fields.reason"
						:maxlength="maxReasonLength"
						rows="4"
						:placeholder="t('reportButton.reasonPlaceholder')"
						class="w-full rounded-xl border border-cool-gray-30 dark:border-cool-gray-70 bg-white dark:bg-cool-gray-95 px-4 py-3 text-sm text-cool-gray-95 dark:text-white placeholder:text-cool-gray-50 focus:border-primary outline-none transition disabled:opacity-70 disabled:cursor-not-allowed"
						:disabled="isReporting"
						:aria-invalid="!!reportForm.errors.reason"
					/>
					<FieldError
						:errors="
							reportForm.errors.reason ||
							reportForm.errors.reportable_id
						"
					/>
				</div>

				<div
					class="flex items-center justify-end text-xs text-cool-gray-60"
				>
					<span
						>{{ remainingCharacters }}
						{{ t('reportButton.charactersLeft') }}</span
					>
				</div>
			</div>

			<DialogFooter>
				<DialogClose as-child>
					<Button
						variant="outline"
						rounded="base"
						:disabled="isReporting"
						@click="handleModalClose(false)"
					>
						{{ t('reportButton.cancel') }}
					</Button>
				</DialogClose>
				<Button
					rounded="base"
					:disabled="isReporting"
					@click="submitReport"
				>
					<span v-if="isReporting">{{
						t('reportButton.submitting')
					}}</span>
					<span v-else>{{ t('reportButton.submit') }}</span>
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
