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
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import type { Blueprint } from '~/models/blueprint'

const props = defineProps<{
	blueprint: Blueprint
	open: boolean
}>()

const emit = defineEmits<{
	'update:open': [value: boolean]
	deleted: []
}>()

const { t } = useI18n()
const { isAuthenticated } = useSanctumAuth()
const loginModal = useLoginModal()

const isDeleting = ref(false)

const handleDelete = async () => {
	isDeleting.value = true

	const form = usePrecognitionForm(
		'delete',
		`/api/v1/blueprints/${props.blueprint.id}`,
		{}
	)

	try {
		await form.submit()
		toast.success(t('deleteBlueprint.success'))
		emit('update:open', false)
		emit('deleted')
	} catch (error) {
		const err = useSanctumError(error)
		console.error(err)

		if (err.code === 403 && !isAuthenticated.value) {
			loginModal.open()
			emit('update:open', false)
			return
		}

		toast.error(t('deleteBlueprint.error'))
	} finally {
		isDeleting.value = false
	}
}

const handleOpenChange = (value: boolean) => {
	if (!isDeleting.value) {
		emit('update:open', value)
	}
}
</script>

<template>
	<Dialog :open="open" @update:open="handleOpenChange">
		<DialogContent>
			<DialogHeader>
				<DialogTitle>{{ t('deleteBlueprint.title') }}</DialogTitle>
				<DialogDescription>
					{{ t('deleteBlueprint.description') }}
				</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<DialogClose as-child>
					<Button
						variant="outline"
						:disabled="isDeleting"
						rounded="base"
					>
						{{ t('deleteBlueprint.cancel') }}
					</Button>
				</DialogClose>
				<Button
					rounded="base"
					variant="destructive"
					:disabled="isDeleting"
					@click="handleDelete"
				>
					{{
						isDeleting
							? t('deleteBlueprint.deleting')
							: t('deleteBlueprint.confirm')
					}}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
