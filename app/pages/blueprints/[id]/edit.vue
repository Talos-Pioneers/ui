<script setup lang="ts">
import { Plus, X, GripVertical } from 'lucide-vue-next'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'
import { SearchableTagsInput } from '~/components/ui/tags-input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import { VueDraggable } from 'vue-draggable-plus'
import { toast } from 'vue-sonner'
import type { Facility } from '~/models/facility'
import type { Item } from '~/models/item'
import type { Tag } from '~/models/tag'
import type { Blueprint } from '~/models/blueprint'
import {
	versionOptions,
	serverRegionOptions,
	regionOptions,
} from '~/constants/blueprintOptions'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const blueprintId = computed(() => route.params.id as string)

// Validate access using definePageMeta
// Note: validate runs before the component, so we use $fetch directly
definePageMeta({
	middleware: ['sanctum:auth'],
})

// Form schema matching UpdateBlueprintRequest
type Schema = {
	code: string
	partner_url: string | null
	title: string
	version: string
	description: string | null
	status: string
	server_region: string | null
	is_anonymous: boolean
	tags: number[]
	region: string | null
	facilities: Array<{ id: number; quantity: number }>
	item_inputs: Array<{ id: number; quantity: number }>
	item_outputs: Array<{ id: number; quantity: number }>
	gallery: File[]
	width: number | null
	height: number | null
}

// Fetch blueprint data
const {
	data: blueprintResponse,
	status: blueprintStatus,
	error: blueprintError,
} = await useSanctumFetch<{ data: Blueprint }>(
	() => `/api/v1/blueprints/${blueprintId.value}`
)

const blueprint = computed(() => blueprintResponse.value?.data ?? null)

watchEffect(() => {
	if (blueprintStatus.value == 'success' && !blueprint.value) {
		throw createError({
			statusCode: 404,
			statusMessage: t('pages.blueprints.edit.notFound'),
		})
	}
	if (blueprintError.value) {
		throw createError({
			statusCode: blueprintError.value.statusCode,
			statusMessage: blueprintError.value.statusMessage,
		})
	}
	if (!blueprint.value) {
		throw createError({
			statusCode: 404,
			statusMessage: t('pages.blueprints.edit.notFound'),
		})
	}
	useHead({
		title: t('pages.blueprints.edit.titleTemplate', {
			title: blueprint.value?.title,
		}),
	})
})

// Initialize form with PUT method and existing blueprint data
const form = usePrecognitionForm<Schema>(
	'put',
	`/api/v1/blueprints/${blueprintId.value}`,
	{
		code: blueprint.value?.code || '',
		partner_url: blueprint.value?.partner_url || null,
		title: blueprint.value?.title || '',
		version: blueprint.value?.version || 'cbt_3',
		description: blueprint.value?.description || null,
		status: blueprint.value?.status || 'draft',
		server_region: blueprint.value?.server_region || null,
		is_anonymous: blueprint.value?.is_anonymous ?? false,
		tags: [],
		region: null,
		facilities: [],
		item_inputs: [],
		item_outputs: [],
		gallery: [],
		width: null,
		height: null,
	}
)

// Fetch facilities, items, and tags
const { data: facilitiesData } = await useSanctumFetch<{ data: Facility[] }>(
	'/api/v1/facilities'
)
const { data: itemsData } = await useSanctumFetch<{ data: Item[] }>(
	'/api/v1/items'
)
const { data: tagsData } = await useSanctumFetch<{ data: Tag[] }>(
	'/api/v1/tags'
)

const facilities = computed(() => facilitiesData.value?.data ?? [])
const items = computed(() => itemsData.value?.data ?? [])
const tags = computed(() => tagsData.value?.data ?? [])

// Map to options for SearchableTagsInput (using slugs as values)
const facilityOptions = computed(() =>
	facilities.value.map((f) => ({
		value: f.slug,
		label: f.name,
		icon: `https://assets.warfarin.wiki/v2/itemicon/${f.icon}.png`,
	}))
)

const itemOptions = computed(() =>
	items.value.map((i) => ({
		value: i.slug,
		label: i.name,
		icon: `https://assets.warfarin.wiki/v2/itemicon/${i.icon}.png`,
	}))
)

const tagOptions = computed(() =>
	tags.value.map((t) => ({ value: t.slug, label: t.name }))
)

// Local state for SearchableTagsInput (using slugs)
const tagsSlugs = ref<string[]>([])
const facilitiesSlugs = ref<string[]>([])
const itemInputsSlugs = ref<string[]>([])
const itemOutputsSlugs = ref<string[]>([])

// Image upload state - support both existing (URLs) and new (Files) images
interface ImageItem {
	file?: File
	preview: string
	isExisting: boolean
	url?: string // For existing images
	mediaId?: string // Media ID for existing images
}

const imageItems = ref<ImageItem[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

// Loading state for form submission
const isSubmitting = ref(false)

// Initialize form data from blueprint (only once when blueprint loads)
const isInitialized = ref(false)
watchEffect(() => {
	if (!blueprint.value || isInitialized.value) return

	form.fields.code = blueprint.value.code || ''
	form.fields.partner_url = blueprint.value.partner_url || null
	form.fields.title = blueprint.value.title || ''
	form.fields.version = blueprint.value.version || 'cbt_3'
	form.fields.description = blueprint.value.description || null
	form.fields.status = blueprint.value.status || 'draft'
	form.fields.server_region = blueprint.value.server_region || null
	form.fields.is_anonymous = blueprint.value.creator === null
	form.fields.region = blueprint.value.region || 'any'
	form.fields.width = blueprint.value.width || null
	form.fields.height = blueprint.value.height || null
	// Convert tag IDs to slugs
	tagsSlugs.value = blueprint.value.tags?.map((tag) => tag.slug) || []

	// Convert facility IDs to slugs
	facilitiesSlugs.value =
		blueprint.value.facilities?.map((facility) => facility.slug) || []

	// Convert item input IDs to slugs
	itemInputsSlugs.value =
		blueprint.value.item_inputs?.map((item) => item.slug) || []

	// Convert item output IDs to slugs
	itemOutputsSlugs.value =
		blueprint.value.item_outputs?.map((item) => item.slug) || []

	// Load existing gallery images
	if (blueprint.value.gallery && blueprint.value.gallery.length > 0) {
		imageItems.value = blueprint.value.gallery.map((img) => ({
			preview: img.url || img.thumbnail,
			url: img.url,
			isExisting: true,
			mediaId: img.id,
		}))
	}

	isInitialized.value = true
})

// Handle file selection
const handleFileSelect = (event: Event) => {
	const target = event.target as HTMLInputElement
	if (target.files) {
		const newFiles = Array.from(target.files)

		// Create previews for new files
		newFiles.forEach((file) => {
			const reader = new FileReader()
			reader.onload = (e) => {
				if (e.target?.result) {
					imageItems.value.push({
						file,
						preview: e.target.result as string,
						isExisting: false,
					})
				}
			}
			reader.readAsDataURL(file)
		})

		// Sync files to form.fields.gallery and validate
		syncGalleryToForm()
		form.validate('gallery')
	}
	// Reset input
	if (target) {
		target.value = ''
	}
}

// Remove image
const removeImage = (index: number) => {
	imageItems.value.splice(index, 1)
	syncGalleryToForm()
	form.forgetError('gallery')
}

// Handle image reordering
const handleImageReorder = (newOrder: ImageItem[]) => {
	imageItems.value = newOrder
	syncGalleryToForm()
}

// Sync imageItems to form.fields.gallery (only new files, maintain order - first image = thumbnail)
const syncGalleryToForm = () => {
	// Only include new files (not existing images)
	form.fields.gallery = imageItems.value
		.filter((item) => !item.isExisting && item.file)
		.map((item) => item.file!)
}

// Sync slugs to IDs and update form fields before submission
const syncFormFields = () => {
	// Convert tag slugs to IDs
	form.fields.tags = tagsSlugs.value
		.map((slug) => tags.value.find((t) => t.slug === slug)?.id)
		.filter((id): id is string => id !== undefined)
		.map((id) => Number(id))

	// Convert facility slugs to IDs with quantities
	form.fields.facilities = facilitiesSlugs.value
		.map((slug) => {
			const facility = facilities.value.find((f) => f.slug === slug)
			if (!facility) return null

			// Get quantity from blueprint if it exists
			const existingFacility = blueprint.value?.facilities?.find(
				(f) => f.slug === slug
			)
			return {
				id: Number(facility.id),
				quantity: existingFacility?.quantity || 1,
			}
		})
		.filter((f): f is { id: number; quantity: number } => f !== null)

	// Convert item input slugs to IDs with quantities
	form.fields.item_inputs = itemInputsSlugs.value
		.map((slug) => {
			const item = items.value.find((i) => i.slug === slug)
			if (!item) return null

			// Get quantity from blueprint if it exists
			const existingItem = blueprint.value?.item_inputs?.find(
				(i) => i.slug === slug
			)
			return {
				id: Number(item.id),
				quantity: existingItem?.quantity || 1,
			}
		})
		.filter((i): i is { id: number; quantity: number } => i !== null)

	// Convert item output slugs to IDs with quantities
	form.fields.item_outputs = itemOutputsSlugs.value
		.map((slug) => {
			const item = items.value.find((i) => i.slug === slug)
			if (!item) return null

			// Get quantity from blueprint if it exists
			const existingItem = blueprint.value?.item_outputs?.find(
				(i) => i.slug === slug
			)
			return {
				id: Number(item.id),
				quantity: existingItem?.quantity || 1,
			}
		})
		.filter((i): i is { id: number; quantity: number } => i !== null)

	// Sync gallery files (only new files, maintain order - first image = thumbnail)
	syncGalleryToForm()

	// Ensure is_anonymous remains boolean
	form.fields.is_anonymous = Boolean(form.fields.is_anonymous)
}

// Create FormData in the format Laravel expects for nested arrays
const createFormData = (): FormData => {
	const formData = new FormData()

	// Basic fields
	formData.append('code', form.fields.code)
	formData.append('title', form.fields.title)
	formData.append('version', form.fields.version)
	formData.append('status', form.fields.status)
	formData.append('is_anonymous', form.fields.is_anonymous ? '1' : '0')

	if (form.fields.width) {
		formData.append('width', String(form.fields.width))
	}
	if (form.fields.height) {
		formData.append('height', String(form.fields.height))
	}

	if (form.fields.region && form.fields.region !== 'any') {
		formData.append('region', form.fields.region)
	}
	if (form.fields.description) {
		formData.append('description', form.fields.description)
	}

	if (form.fields.server_region) {
		formData.append('server_region', form.fields.server_region)
	}

	if (form.fields.partner_url) {
		formData.append('partner_url', form.fields.partner_url)
	}

	// Tags - Laravel expects tags[] format
	form.fields.tags.forEach((id) => {
		formData.append('tags[]', String(id))
	})

	// Facilities - Laravel expects facilities[0][id] and facilities[0][quantity] format
	form.fields.facilities.forEach((facility, index) => {
		formData.append(`facilities[${index}][id]`, String(facility.id))
		formData.append(
			`facilities[${index}][quantity]`,
			String(facility.quantity)
		)
	})

	// Item inputs - Laravel expects item_inputs[0][id] and item_inputs[0][quantity] format
	form.fields.item_inputs.forEach((item, index) => {
		formData.append(`item_inputs[${index}][id]`, String(item.id))
		formData.append(
			`item_inputs[${index}][quantity]`,
			String(item.quantity)
		)
	})

	// Item outputs - Laravel expects item_outputs[0][id] and item_outputs[0][quantity] format
	form.fields.item_outputs.forEach((item, index) => {
		formData.append(`item_outputs[${index}][id]`, String(item.id))
		formData.append(
			`item_outputs[${index}][quantity]`,
			String(item.quantity)
		)
	})

	// Gallery files - Laravel expects gallery[] format (only new files)
	form.fields.gallery.forEach((file) => {
		formData.append('gallery[]', file)
	})

	// Gallery keep IDs - IDs of existing images that should be kept
	imageItems.value
		.filter((item) => item.isExisting && item.mediaId)
		.forEach((item) => {
			formData.append('gallery_keep_ids[]', item.mediaId!)
		})

	// Gallery order - send order for all images (existing and new)
	// Format: mediaId for existing, "new_0", "new_1", etc. for new images
	let newImageIndex = 0
	imageItems.value.forEach((item, index) => {
		if (item.isExisting && item.mediaId) {
			formData.append('gallery_order[]', item.mediaId)
		} else {
			formData.append('gallery_order[]', `new_${newImageIndex}`)
			newImageIndex++
		}
	})

	return formData
}

// Submit handler
const submit = async (status: 'draft' | 'published' = 'draft') => {
	if (isSubmitting.value) {
		return
	}

	try {
		isSubmitting.value = true

		// Set status
		form.fields.status = status

		// Sync all form fields (slugs to IDs, files, etc.)
		syncFormFields()

		// Create FormData in Laravel's expected format
		const formData = createFormData()

		// Use Sanctum client directly with FormData since Precognition doesn't handle nested arrays correctly
		const sanctumClient = useSanctumClient()
		const response = await sanctumClient<{ data: { id: string } }>(
			`/api/v1/blueprints/${blueprintId.value}`,
			{
				method: 'PUT',
				body: formData,
			}
		)

		const message =
			status === 'published'
				? t('pages.blueprints.edit.successPublished')
				: t('pages.blueprints.edit.successDraft')
		toast.success(message)

		// Redirect to blueprint detail page
		if (response.data?.id) {
			nextTick(() => {
				router.push(`/blueprints/${response.data.id}`)
			})
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

			toast.error(t('pages.blueprints.edit.errorValidation'))
		} else {
			toast.error(t('pages.blueprints.edit.errorFailed'))
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
						{{ t('pages.blueprints.edit.title') }}
					</h1>

					<!-- Validation Errors Alert -->
					<div
						v-if="form.hasErrors"
						class="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2"
					>
						<p class="text-sm font-medium text-destructive">
							{{
								t(
									'pages.blueprints.create.validationErrorsTitle'
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
						<!-- Image Upload Section -->
						<div class="space-y-2">
							<Label>{{
								t('pages.blueprints.create.images')
							}}</Label>
							<div class="space-y-4">
								<!-- Upload Area -->
								<div
									v-if="imageItems.length === 0"
									class="border-2 border-dashed border-cool-gray-30 dark:border-cool-gray-70 rounded-lg p-8 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
									@click="fileInputRef?.click()"
								>
									<div class="text-center">
										<Plus
											class="size-12 mx-auto mb-2 text-cool-gray-50"
										/>
										<p class="text-sm text-cool-gray-60">
											{{
												t(
													'pages.blueprints.create.clickToUpload'
												)
											}}
										</p>
									</div>
								</div>

								<!-- Image Gallery with Drag and Drop -->
								<VueDraggable
									v-if="imageItems.length > 0"
									v-model="imageItems"
									:animation="200"
									handle=".drag-handle"
									class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
									@update:model-value="handleImageReorder"
								>
									<div
										v-for="(item, index) in imageItems"
										:key="index"
										class="relative group aspect-square rounded-lg overflow-hidden border border-cool-gray-20 dark:border-cool-gray-80"
									>
										<img
											:src="item.preview"
											:alt="`Preview ${index + 1}`"
											class="w-full h-full object-cover"
										/>
										<div
											class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2"
										>
											<button
												type="button"
												class="drag-handle cursor-grab active:cursor-grabbing p-2 bg-white/90 rounded hover:bg-white transition-colors"
												@mousedown.stop
											>
												<GripVertical
													class="size-4 text-cool-gray-90"
												/>
											</button>
											<button
												type="button"
												class="p-2 bg-white/90 rounded hover:bg-white transition-colors"
												@click="removeImage(index)"
											>
												<X
													class="size-4 text-cool-gray-90"
												/>
											</button>
										</div>
										<div
											v-if="index === 0"
											class="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded"
										>
											{{
												t(
													'pages.blueprints.create.thumbnail'
												)
											}}
										</div>
									</div>
								</VueDraggable>

								<!-- Add More Images Button -->
								<button
									v-if="imageItems.length > 0"
									type="button"
									class="flex items-center gap-2 px-4 py-2 border border-cool-gray-30 dark:border-cool-gray-70 rounded-lg hover:border-primary transition-colors text-sm"
									@click="fileInputRef?.click()"
								>
									<Plus class="size-4" />
									{{
										t(
											'pages.blueprints.create.addMoreImages'
										)
									}}
								</button>

								<input
									ref="fileInputRef"
									type="file"
									accept="image/*"
									multiple
									class="hidden"
									@change="handleFileSelect"
								/>

								<p class="text-xs text-cool-gray-60">
									{{
										t(
											'pages.blueprints.create.thumbnailHelper'
										)
									}}
								</p>
								<p
									v-if="form.errors.gallery"
									class="text-xs text-destructive"
								>
									{{
										Array.isArray(form.errors.gallery)
											? form.errors.gallery[0]
											: form.errors.gallery
									}}
								</p>
							</div>
						</div>

						<!-- Title -->
						<div class="space-y-2">
							<Label for="title">{{
								t('pages.blueprints.create.titleLabel')
							}}</Label>
							<Input
								id="title"
								v-model="form.fields.title"
								:placeholder="
									t(
										'pages.blueprints.create.titlePlaceholder'
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
								t('pages.blueprints.create.descriptionLabel')
							}}</Label>
							<textarea
								id="description"
								v-model="form.fields.description"
								rows="6"
								class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
								:placeholder="
									t(
										'pages.blueprints.create.descriptionPlaceholder'
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

						<!-- Share Code -->
						<div class="space-y-2">
							<Label for="code">{{
								t('pages.blueprints.create.shareCodeLabel')
							}}</Label>
							<Input
								id="code"
								v-model="form.fields.code"
								:placeholder="
									t(
										'pages.blueprints.create.shareCodePlaceholder'
									)
								"
								:aria-invalid="!!form.errors.code"
								@change="form.validate('code')"
							/>
							<p
								v-if="form.errors.code"
								class="text-xs text-destructive"
							>
								{{
									Array.isArray(form.errors.code)
										? form.errors.code[0]
										: form.errors.code
								}}
							</p>
						</div>

						<!-- Partner URL -->
						<div class="space-y-2">
							<Label for="partner_url">{{
								t('pages.blueprints.create.partnerUrlLabel')
							}}</Label>
							<Input
								id="partner_url"
								v-model="form.fields.partner_url"
								:placeholder="
									t(
										'pages.blueprints.create.partnerUrlPlaceholder'
									)
								"
								:aria-invalid="!!form.errors.partner_url"
								@change="form.validate('partner_url')"
							/>
							<p class="text-xs text-cool-gray-60">
								{{
									t('pages.blueprints.create.partnerUrlHelper')
								}}
							</p>
							<p
								v-if="form.errors.partner_url"
								class="text-xs text-destructive"
							>
								{{
									Array.isArray(form.errors.partner_url)
										? form.errors.partner_url[0]
										: form.errors.partner_url
								}}
							</p>
						</div>

						<!-- Version -->
						<div class="space-y-2">
							<Label for="version">{{
								t('pages.blueprints.create.versionLabel')
							}}</Label>
							<Select
								v-model="form.fields.version"
								@update:model-value="form.validate('version')"
							>
								<SelectTrigger
									id="version"
									:aria-invalid="!!form.errors.version"
								>
									<SelectValue
										:placeholder="
											t(
												'pages.blueprints.create.versionPlaceholder'
											)
										"
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem
										v-for="option in versionOptions.filter(
											(opt) => opt.value
										)"
										:key="option.value"
										:value="option.value"
									>
										{{ option.label }}
									</SelectItem>
								</SelectContent>
							</Select>
							<p
								v-if="form.errors.version"
								class="text-xs text-destructive"
							>
								{{
									Array.isArray(form.errors.version)
										? form.errors.version[0]
										: form.errors.version
								}}
							</p>
						</div>

						<!-- Server Region -->
						<div class="space-y-2">
							<Label for="server_region">{{
								t('pages.blueprints.create.serverRegionLabel')
							}}</Label>
							<Select
								v-model="form.fields.server_region"
								@update:model-value="
									form.validate('server_region')
								"
							>
								<SelectTrigger
									id="server_region"
									:aria-invalid="!!form.errors.server_region"
								>
									<SelectValue
										:placeholder="
											t(
												'pages.blueprints.create.serverRegionPlaceholder'
											)
										"
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem
										v-for="option in serverRegionOptions"
										:key="option.value"
										:value="option.value"
									>
										{{ option.label }}
									</SelectItem>
								</SelectContent>
							</Select>
							<p
								v-if="form.errors.server_region"
								class="text-xs text-destructive"
							>
								{{
									Array.isArray(form.errors.server_region)
										? form.errors.server_region[0]
										: form.errors.server_region
								}}
							</p>
						</div>

						<!-- Region -->
						<div class="space-y-2">
							<Label for="region">{{
								t('pages.blueprints.create.regionLabel')
							}}</Label>
							<Select
								v-model="form.fields.region"
								@update:model-value="form.validate('region')"
							>
								<SelectTrigger
									id="region"
									:aria-invalid="!!form.errors.region"
								>
									<SelectValue
										:placeholder="
											t(
												'pages.blueprints.create.regionPlaceholder'
											)
										"
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem
										v-for="option in regionOptions"
										:key="option.value"
										:value="option.value"
									>
										{{ option.label }}
									</SelectItem>
									<SelectItem value="any">
										{{
											t(
												'pages.blueprints.create.anyRegion'
											)
										}}
									</SelectItem></SelectContent
								>
							</Select>
							<p
								v-if="form.errors.region"
								class="text-xs text-destructive"
							>
								{{
									Array.isArray(form.errors.region)
										? form.errors.region[0]
										: form.errors.region
								}}
							</p>
						</div>

						<!-- Tags -->
						<div class="space-y-2">
							<Label>{{
								t('pages.blueprints.create.tagsLabel')
							}}</Label>
							<SearchableTagsInput
								v-model="tagsSlugs"
								:options="tagOptions"
								:placeholder="
									t(
										'pages.blueprints.create.searchPlaceholder'
									)
								"
								class="w-full max-w-[418px]"
							/>
							<p
								v-if="form.errors.tags"
								class="text-xs text-destructive"
							>
								{{
									Array.isArray(form.errors.tags)
										? form.errors.tags[0]
										: form.errors.tags
								}}
							</p>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="width">{{
									t('pages.blueprints.create.widthLabel')
								}}</Label>
								<Input
									id="width"
									v-model="form.fields.width"
									type="number"
									min="1"
									max="50"
								/>
								<p
									v-if="form.errors.height"
									class="text-xs text-destructive"
								>
									{{
										Array.isArray(form.errors.height)
											? form.errors.height[0]
											: form.errors.height
									}}
								</p>
							</div>

							<div class="space-y-2">
								<Label for="height">{{
									t('pages.blueprints.create.heightLabel')
								}}</Label>
								<Input
									id="height"
									v-model="form.fields.height"
									type="number"
									min="1"
									max="50"
								/>
								<p
									v-if="form.errors.height"
									class="text-xs text-destructive"
								>
									{{
										Array.isArray(form.errors.height)
											? form.errors.height[0]
											: form.errors.height
									}}
								</p>
							</div>
						</div>

						<!-- Facilities Used -->
						<div class="space-y-2">
							<Label>{{
								t('pages.blueprints.create.facilitiesLabel')
							}}</Label>
							<SearchableTagsInput
								v-model="facilitiesSlugs"
								:options="facilityOptions"
								:placeholder="
									t(
										'pages.blueprints.create.searchPlaceholder'
									)
								"
								class="w-full max-w-[418px]"
							/>
							<p
								v-if="form.errors.facilities"
								class="text-xs text-destructive"
							>
								{{
									Array.isArray(form.errors.facilities)
										? form.errors.facilities[0]
										: form.errors.facilities
								}}
							</p>
						</div>

						<!-- Input Products -->
						<div class="space-y-2">
							<Label>{{
								t('pages.blueprints.create.inputProductsLabel')
							}}</Label>
							<SearchableTagsInput
								v-model="itemInputsSlugs"
								:options="itemOptions"
								:placeholder="
									t(
										'pages.blueprints.create.searchPlaceholder'
									)
								"
								class="w-full max-w-[418px]"
							/>
							<p
								v-if="form.errors.item_inputs"
								class="text-xs text-destructive"
							>
								{{
									Array.isArray(form.errors.item_inputs)
										? form.errors.item_inputs[0]
										: form.errors.item_inputs
								}}
							</p>
						</div>

						<!-- Output Products -->
						<div class="space-y-2">
							<Label>{{
								t('pages.blueprints.create.outputProductsLabel')
							}}</Label>
							<SearchableTagsInput
								v-model="itemOutputsSlugs"
								:options="itemOptions"
								:placeholder="
									t(
										'pages.blueprints.create.searchPlaceholder'
									)
								"
								class="w-full max-w-[418px]"
							/>
							<p
								v-if="form.errors.item_outputs"
								class="text-xs text-destructive"
							>
								{{
									Array.isArray(form.errors.item_outputs)
										? form.errors.item_outputs[0]
										: form.errors.item_outputs
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
											'pages.blueprints.create.postAnonymously'
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
										t('pages.blueprints.create.saving')
									}}</span
								>
								<span v-else>{{
									t('pages.blueprints.create.saveDraft')
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
										t('pages.blueprints.create.publishing')
									}}</span
								>
								<span v-else>{{
									t('pages.blueprints.create.publish')
								}}</span>
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>
