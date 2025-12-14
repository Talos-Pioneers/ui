<script setup lang="ts">
import type { Blueprint } from '~/models/blueprint'
import type { BlueprintCollection } from '~/models/blueprintCollection'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { FieldError } from '../ui/field'
import { toast } from 'vue-sonner'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog'
import AddCollectionIcon from '../icons/AddCollectionIcon.vue'

const props = defineProps<{
	blueprint: Blueprint
}>()

const emit = defineEmits<{
	added: []
}>()

const { t } = useI18n()
const sanctumClient = useSanctumClient()

// Fetch user's collections
type CollectionsResponse = {
	data: BlueprintCollection[]
	meta?: {
		current_page: number
		last_page: number
		total: number
	}
}

const {
	data: collectionsData,
	status: collectionsStatus,
	refresh: refreshCollections,
} = await useLazySanctumFetch<CollectionsResponse>(
	'/api/v1/my/collections',
	() => ({
		method: 'get',
		query: {
			include: 'blueprints',
		},
	})
)

const collections = computed(() => collectionsData.value?.data ?? [])

// State for creating new collection
const showCreateForm = ref(false)
const isCreating = ref(false)

// Precognition form for creating new collection
type CreateSchema = {
	title: string
	blueprints: string[]
}

const createForm = usePrecognitionForm<CreateSchema>(
	'post',
	'/api/v1/collections',
	{
		title: '',
		blueprints: [props.blueprint.id],
	}
)

// State for updating collections
const updatingCollectionId = ref<string | null>(null)

// Check if blueprint is already in a collection
const isBlueprintInCollection = (collection: BlueprintCollection): boolean => {
	if (!collection.blueprints) {
		return false
	}
	return collection.blueprints.some((bp) => bp.id === props.blueprint.id)
}

// Handle creating new collection
const handleCreateCollection = async () => {
	if (!createForm.fields.title.trim()) {
		return
	}

	isCreating.value = true
	try {
		await createForm.submit()

		// Check for errors
		if (Object.keys(createForm.errors).length === 0) {
			toast.success(
				t('components.collections.addToCollection.createSuccess')
			)
			createForm.fields.title = ''
			createForm.reset()
			showCreateForm.value = false
			await refreshCollections()
			emit('added')
		}
	} catch (error) {
		const { isValidationError, bag } = useSanctumError(error)
		if (isValidationError && bag.length > 0) {
			toast.error(
				bag[0]?.message ||
					t('components.collections.addToCollection.createError')
			)
		} else {
			toast.error(
				t('components.collections.addToCollection.createErrorRetry')
			)
		}
	} finally {
		isCreating.value = false
	}
}

// Handle adding blueprint to existing collection
const handleAddToCollection = async (collection: BlueprintCollection) => {
	if (isBlueprintInCollection(collection)) {
		toast.info(
			t('components.collections.addToCollection.alreadyInCollection')
		)
		return
	}

	updatingCollectionId.value = collection.id

	// Get current blueprints from the collection (already loaded or fetch if needed)
	try {
		let currentBlueprints: string[] = []

		// If blueprints are already loaded, use them
		if (collection.blueprints && collection.blueprints.length > 0) {
			currentBlueprints = collection.blueprints.map((bp) => bp.id)
		} else {
			// Otherwise fetch the collection to get current blueprints
			const response = await sanctumClient<{
				data: BlueprintCollection
			}>(`/api/v1/collections/${collection.id}`, {
				method: 'get',
				query: {
					include: 'blueprints',
				},
			})

			currentBlueprints =
				response.data?.blueprints?.map((bp) => bp.id) ?? []
		}

		const updatedBlueprints = [...currentBlueprints, props.blueprint.id]

		// Use Precognition form for update
		type UpdateSchema = {
			blueprints: string[]
		}

		const updateForm = usePrecognitionForm<UpdateSchema>(
			'put',
			`/api/v1/collections/${collection.id}`,
			{
				blueprints: updatedBlueprints,
			}
		)

		await updateForm.submit()

		if (Object.keys(updateForm.errors).length === 0) {
			toast.success(
				t('components.collections.addToCollection.addSuccess')
			)
			await refreshCollections()
			emit('added')
		} else {
			toast.error(t('components.collections.addToCollection.addError'))
		}
	} catch (error) {
		const { isValidationError, bag } = useSanctumError(error)
		if (isValidationError && bag.length > 0) {
			toast.error(
				bag[0]?.message ||
					t('components.collections.addToCollection.addError')
			)
		} else {
			toast.error(
				t('components.collections.addToCollection.addErrorRetry')
			)
		}
	} finally {
		updatingCollectionId.value = null
	}
}

const toggleCreateForm = () => {
	showCreateForm.value = !showCreateForm.value
	if (!showCreateForm.value) {
		createForm.fields.title = ''
		createForm.reset()
	}
}
</script>

<template>
	<Dialog>
		<DialogTrigger as-child>
			<Button
				class="before:border-none rounded-lg"
				size="icon-sm"
				variant="ghost"
			>
				<AddCollectionIcon class="size-7.5" />
			</Button>
		</DialogTrigger>
		<DialogContent class="max-w-md">
			<DialogHeader>
				<DialogTitle>
					{{ t('components.collections.addToCollection.title') }}
				</DialogTitle>
			</DialogHeader>

			<div class="space-y-4 py-4">
				<!-- Loading state -->
				<div
					v-if="collectionsStatus === 'pending'"
					class="text-center py-8"
				>
					<p class="text-sm text-cool-gray-60">
						{{
							t('components.collections.addToCollection.loading')
						}}
					</p>
				</div>

				<!-- Collections list -->
				<div v-else-if="collections.length > 0" class="space-y-2">
					<div
						v-for="collection in collections"
						:key="collection.id"
						class="flex items-center justify-between p-3 rounded-lg border border-cool-gray-30 dark:border-cool-gray-70 hover:bg-cool-gray-10 dark:hover:bg-cool-gray-90 transition-colors"
					>
						<div class="flex items-center gap-3 flex-1">
							<div class="flex-1 min-w-0">
								<p
									class="text-sm font-medium text-cool-gray-95 dark:text-white truncate"
								>
									{{ collection.title }}
								</p>
								<p class="text-xs text-cool-gray-60">
									{{
										t(
											(collection.blueprints_count ??
												collection.blueprints?.length ??
												0) === 1
												? 'components.collections.addToCollection.blueprintCountSingular'
												: 'components.collections.addToCollection.blueprintCountPlural',
											{
												count:
													collection.blueprints_count ??
													collection.blueprints
														?.length ??
													0,
											}
										)
									}}
								</p>
							</div>
						</div>
						<Button
							v-if="!isBlueprintInCollection(collection)"
							class="ml-2"
							variant="ghost"
							size="sm"
							:disabled="updatingCollectionId === collection.id"
							@click="handleAddToCollection(collection)"
						>
							<span
								v-if="updatingCollectionId === collection.id"
								class="text-xs"
							>
								{{
									t(
										'components.collections.addToCollection.adding'
									)
								}}
							</span>
							<span v-else class="text-xs">
								{{
									t(
										'components.collections.addToCollection.add'
									)
								}}
							</span>
						</Button>
					</div>
				</div>

				<!-- Empty state -->
				<div
					v-else-if="
						collectionsStatus === 'success' &&
						collections.length === 0
					"
					class="text-center py-8"
				>
					<p class="text-sm text-cool-gray-60">
						{{ t('components.collections.addToCollection.empty') }}
					</p>
				</div>

				<!-- Create new collection form -->
				<div
					class="space-y-3 pt-4 border-t border-cool-gray-30 dark:border-cool-gray-70"
				>
					<Button
						v-if="!showCreateForm"
						variant="outline"
						rounded="base"
						class="w-full"
						@click="toggleCreateForm"
					>
						{{
							t(
								'components.collections.addToCollection.createNew'
							)
						}}
					</Button>

					<div v-else class="space-y-3">
						<div class="space-y-2">
							<Input
								v-model="createForm.fields.title"
								:placeholder="
									t(
										'components.collections.addToCollection.titlePlaceholder'
									)
								"
								:aria-invalid="!!createForm.errors.title"
								:disabled="isCreating"
							/>
							<FieldError :errors="createForm.errors.title" />
						</div>
						<div class="flex gap-2">
							<Button
								variant="outline"
								class="flex-1"
								:disabled="isCreating"
								@click="toggleCreateForm"
							>
								{{
									t(
										'components.collections.addToCollection.cancel'
									)
								}}
							</Button>
							<Button
								class="flex-1"
								:disabled="
									isCreating ||
									!createForm.fields.title.trim()
								"
								@click="handleCreateCollection"
							>
								<span v-if="isCreating">
									{{
										t(
											'components.collections.addToCollection.creating'
										)
									}}
								</span>
								<span v-else>
									{{
										t(
											'components.collections.addToCollection.create'
										)
									}}
								</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</DialogContent>
	</Dialog>
</template>
