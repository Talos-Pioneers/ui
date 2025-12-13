<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { Button } from '~/components/ui/button'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '~/components/ui/carousel'
import type { UnwrapRefCarouselApi } from '~/components/ui/carousel/interface'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import CommentComposer from '~/components/comments/CommentComposer.vue'
import VerticalElipsis from '~/components/icons/VerticalElipsis.vue'
import CommentList from '~/components/comments/CommentList.vue'
import CopyIcon from '~/components/icons/CopyIcon.vue'
import LikesIcon from '~/components/icons/LikesIcon.vue'
import CopiesIcon from '~/components/icons/CopiesIcon.vue'
import CommentsIcon from '~/components/icons/CommentsIcon.vue'
import CalendarIcon from '~/components/icons/CalendarIcon.vue'
import ClockIcon from '~/components/icons/ClockIcon.vue'
import NotFoundImage from '~/assets/img/not-found-placeholder.png'
import type { Blueprint, BlueprintTag } from '~/models/blueprint'
import type { Comment } from '~/models/comment'
import {
	regionOptions,
	serverRegionOptions,
} from '~/constants/blueprintOptions'
import FacilityList from '~/components/blueprints/FacilityList.vue'
import ItemList from '~/components/blueprints/ItemList.vue'
import DeleteBlueprintDialog from '~/components/blueprints/DeleteBlueprintDialog.vue'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '~/components/ui/tooltip'

type BlueprintResponse = {
	data: Blueprint
}

type CommentListResponse = {
	data: Comment[]
	meta: {
		current_page: number
		last_page: number
	}
}

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const loginModal = useLoginModal()
const { user, isAuthenticated } = useSanctumAuth()
const sanctumClient = useSanctumClient()
const { copy } = useClipboard()
const blueprintId = computed(() => route.params.id as string)

const {
	data: blueprintResponse,
	status: blueprintStatus,
	error: blueprintError,
	refresh: refreshBlueprint,
} = await useSanctumFetch<BlueprintResponse>(
	() => `/api/v1/blueprints/${blueprintId.value}`
)

const blueprint = computed(() => blueprintResponse.value?.data ?? null)

const currentUrl = computed(() => {
	if (import.meta.server) {
		const requestURL = useRequestURL()
		return requestURL.href
	}
	return window.location.href
})

const ogImage = computed(() => {
	if (!blueprint.value?.gallery || blueprint.value.gallery.length === 0) {
		// Return absolute URL for logo
		if (import.meta.server) {
			const requestURL = useRequestURL()
			return `${requestURL.origin}/logo.png`
		}
		return `${window.location.origin}/logo.png`
	}
	const firstImage = blueprint.value.gallery[0]
	const imageUrl = firstImage?.url || firstImage?.thumbnail || '/logo.png'
	// If image URL is already absolute, return it; otherwise make it absolute
	if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
		return imageUrl
	}
	if (import.meta.server) {
		const requestURL = useRequestURL()
		return `${requestURL.origin}${imageUrl}`
	}
	return `${window.location.origin}${imageUrl}`
})

const seoDescription = computed(() => {
	if (!blueprint.value) {
		return t('pages.blueprints.detail.descriptionFallback')
	}
	const description = blueprint.value.description
		? blueprint.value.description.substring(0, 200)
		: ''
	return description
		? t('pages.blueprints.detail.description', { description })
		: t('pages.blueprints.detail.descriptionFallback')
})

watchEffect(() => {
	if (blueprintStatus.value == 'success' && !blueprint.value) {
		throw createError({
			statusCode: 404,
			statusMessage: t('pages.blueprints.detail.notFound'),
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
			statusMessage: t('pages.blueprints.detail.notFound'),
		})
	}

	const siteName = t('pages.blueprints.detail.siteName')
	const title = t('pages.blueprints.detail.title', {
		title: blueprint.value.title,
	})
	const description = seoDescription.value
	const image = ogImage.value
	const url = currentUrl.value

	useHead({
		title,
		meta: [
			{
				name: 'description',
				content: description,
			},
			{
				property: 'og:title',
				content: title,
			},
			{
				property: 'og:description',
				content: description,
			},
			{
				property: 'og:image',
				content: image,
			},
			{
				property: 'og:url',
				content: url,
			},
			{
				property: 'og:type',
				content: 'website',
			},
			{
				property: 'og:site_name',
				content: siteName,
			},
			{
				name: 'twitter:card',
				content: 'summary_large_image',
			},
			{
				name: 'twitter:title',
				content: title,
			},
			{
				name: 'twitter:description',
				content: description,
			},
			{
				name: 'twitter:image',
				content: image,
			},
		],
	})
})

const commentsPage = ref(1)
const shouldResetComments = ref(true)

const {
	data: commentsResponse,
	status: commentsStatus,
	error: commentsError,
	refresh: refreshComments,
} = await useSanctumFetch<CommentListResponse>(
	() => `/api/v1/blueprints/${blueprintId.value}/comments`,
	() => ({
		method: 'get',
		query: { page: String(commentsPage.value) },
	}),
	{
		watch: [commentsPage],
	}
)

const comments = ref<Comment[]>([])

watch(
	() => commentsResponse.value?.data,
	(newComments) => {
		if (!newComments) {
			return
		}
		if (commentsPage.value === 1 || shouldResetComments.value) {
			comments.value = [...newComments]
		} else {
			const existingIds = new Set(
				comments.value.map((comment) => comment.id)
			)
			const filtered = newComments.filter(
				(comment) => !existingIds.has(comment.id)
			)
			comments.value = [...comments.value, ...filtered]
		}
		shouldResetComments.value = false
	},
	{ immediate: true }
)

const totalComments = computed(
	() => blueprint.value?.comments_count ?? comments.value.length
)
const hasMoreComments = computed(() => {
	const meta = commentsResponse.value?.meta
	if (!meta) {
		return false
	}
	return meta.current_page < meta.last_page
})

const galleryApi = ref<UnwrapRefCarouselApi | null>(null)
const activeSlide = ref(0)

const handleCarouselInit = (api: UnwrapRefCarouselApi) => {
	galleryApi.value = api
	activeSlide.value = api.selectedScrollSnap()
	api.on('select', () => {
		activeSlide.value = api.selectedScrollSnap()
	})
}

const goToSlide = (index: number) => {
	galleryApi.value?.scrollTo(index)
}

const stats = computed(() => {
	if (!blueprint.value) {
		return []
	}
	return [
		{
			label: t('pages.blueprints.detail.stats.copies'),
			value: useFormatCompactNumber(blueprint.value.copies_count),
			icon: CopiesIcon,
		},
		{
			label: t('pages.blueprints.detail.stats.likes'),
			value: useFormatCompactNumber(blueprint.value.likes_count),
			icon: LikesIcon,
		},
		{
			label: t('pages.blueprints.detail.stats.comments'),
			value: useFormatCompactNumber(blueprint.value.comments_count),
			icon: CommentsIcon,
		},
	]
})

const isTogglingLike = ref(false)
const isCopyingCode = ref(false)
const galleryItems = computed(() => blueprint.value?.gallery ?? [])
const galleryDisplayItems = computed(() => {
	const items = galleryItems.value
	if (items.length > 0) {
		return items
	}
	return [
		{
			thumbnail: NotFoundImage,
			url: NotFoundImage,
			name:
				blueprint.value?.title ??
				t('pages.blueprints.detail.previewFallback'),
		},
	]
})
const formattedCreatedAt = computed(() =>
	blueprint.value ? useFormatDate(blueprint.value.created_at) : ''
)
const formattedUpdatedAt = computed(() =>
	blueprint.value ? useFormatDate(blueprint.value.updated_at) : ''
)

const handleToggleLike = async () => {
	if (!blueprint.value || isTogglingLike.value) {
		return
	}

	if (!isAuthenticated.value) {
		loginModal.open()
		return
	}

	isTogglingLike.value = true
	try {
		const response = await sanctumClient<{
			liked: boolean
			likes_count: number
		}>(`/api/v1/blueprints/${blueprint.value.id}/like`, {
			method: 'post',
		})
		if (blueprintResponse.value?.data) {
			blueprintResponse.value.data.is_liked = response.liked
			blueprintResponse.value.data.likes_count = response.likes_count
		}
	} catch (error) {
		const { code } = useSanctumError(error)
		if (code === 401) {
			loginModal.open()
		} else {
			toast.error(t('pages.blueprints.detail.toast.likeError'))
		}
	} finally {
		isTogglingLike.value = false
	}
}

const handleCopyCode = async () => {
	if (!blueprint.value) {
		return
	}

	await copy(blueprint.value.code)
	toast.success(t('pages.blueprints.detail.toast.codeCopied'))

	if (isCopyingCode.value) {
		return
	}

	isCopyingCode.value = true
	try {
		const response = await sanctumClient<{
			copies_count: number
			message: string
		}>(`/api/v1/blueprints/${blueprint.value.id}/copy`, {
			method: 'post',
		})
		if (blueprintResponse.value?.data) {
			blueprintResponse.value.data.copies_count = response.copies_count
		}
	} catch (error) {
		const { code, bag, isValidationError } = useSanctumError(error)
		console.log(code, bag, isValidationError)
	} finally {
		isCopyingCode.value = false
	}
}

const navigateToTag = (tag: BlueprintTag) => {
	router.push({
		path: '/',
		query: {
			'filter[tags.id]': tag.id,
		},
	})
}

const commentInput = ref('')
const isSubmittingComment = ref(false)
const commentErrorMessage = ref<string | null>(null)
const editingCommentId = ref<string | null>(null)
const editingContent = ref('')
const deletingCommentId = ref<string | null>(null)

const invalidateComments = async () => {
	shouldResetComments.value = true
	commentsPage.value = 1
	await refreshComments()
	await refreshBlueprint()
}

const submitComment = async () => {
	if (!blueprint.value) {
		return
	}

	if (!isAuthenticated.value) {
		loginModal.open()
		return
	}

	if (!commentInput.value.trim() || isSubmittingComment.value) {
		return
	}

	commentErrorMessage.value = null
	isSubmittingComment.value = true
	try {
		await sanctumClient(
			`/api/v1/blueprints/${blueprint.value.id}/comments`,
			{
				method: 'post',
				body: {
					comment: commentInput.value,
				},
			}
		)
		commentInput.value = ''
		toast.success(t('pages.blueprints.detail.toast.commentSubmitted'))
		await invalidateComments()
	} catch (error) {
		const { isValidationError, bag, code } = useSanctumError(error)
		if (code === 429) {
			commentErrorMessage.value = t(
				'pages.blueprints.detail.comments.rateLimitError'
			)
		} else if (isValidationError) {
			commentErrorMessage.value =
				bag[0]?.message ??
				t('pages.blueprints.detail.comments.submitError')
		} else if (code === 401) {
			loginModal.open()
		} else {
			commentErrorMessage.value = t(
				'pages.blueprints.detail.toast.commentSubmitError'
			)
		}
	} finally {
		isSubmittingComment.value = false
	}
}

const requestEditComment = (comment: Comment) => {
	if (comment.user?.id !== user.value?.id) {
		return
	}
	editingCommentId.value = comment.id
	editingContent.value = comment.comment
}

const cancelEdit = () => {
	editingCommentId.value = null
	editingContent.value = ''
}

const saveCommentEdit = async () => {
	if (
		!blueprint.value ||
		!editingCommentId.value ||
		!editingContent.value.trim()
	) {
		return
	}
	isSubmittingComment.value = true
	try {
		await sanctumClient(
			`/api/v1/blueprints/${blueprint.value.id}/comments/${editingCommentId.value}`,
			{
				method: 'put',
				body: {
					comment: editingContent.value,
				},
			}
		)
		toast.success(t('pages.blueprints.detail.toast.commentUpdated'))
		cancelEdit()
		await invalidateComments()
	} catch (error) {
		const { isValidationError, bag } = useSanctumError(error)
		if (isValidationError) {
			commentErrorMessage.value =
				bag[0]?.message ??
				t('pages.blueprints.detail.comments.submitError')
		} else {
			commentErrorMessage.value = t(
				'pages.blueprints.detail.toast.commentUpdateError'
			)
		}
	} finally {
		isSubmittingComment.value = false
	}
}

const deleteComment = async (comment: Comment) => {
	if (!blueprint.value || comment.user?.id !== user.value?.id) {
		return
	}
	deletingCommentId.value = comment.id
	try {
		await sanctumClient(
			`/api/v1/blueprints/${blueprint.value.id}/comments/${comment.id}`,
			{
				method: 'delete',
			}
		)
		toast.success(t('pages.blueprints.detail.toast.commentDeleted'))
		await invalidateComments()
	} catch (error) {
		toast.error(t('pages.blueprints.detail.toast.commentDeleteError'))
	} finally {
		deletingCommentId.value = null
	}
}

const loadMoreComments = () => {
	if (!hasMoreComments.value) {
		return
	}
	shouldResetComments.value = false
	commentsPage.value += 1
}

const retryCommentsFetch = () => {
	shouldResetComments.value = true
	refreshComments()
}

const isBlueprintLoading = computed(() => blueprintStatus.value === 'pending')
const blueprintLoadError = computed(() =>
	blueprintStatus.value === 'error' ? blueprintError.value : null
)

const isCommentsLoading = computed(
	() =>
		commentsStatus.value === 'pending' &&
		commentsPage.value === 1 &&
		comments.value.length === 0
)
const commentsLoadError = computed(() =>
	commentsStatus.value === 'error'
		? t('pages.blueprints.detail.commentsError')
		: (commentsError.value as string | null)
)

const dropdownOpen = ref(false)
const handleReported = () => {
	dropdownOpen.value = false
}

const deleteDialogOpen = ref(false)
const handleBlueprintDeleted = () => {
	navigateTo('/')
}
</script>

<template>
	<div class="bg-cool-gray-5 dark:bg-cool-gray-95 min-h-screen py-8">
		<div class="container mx-auto px-4">
			<div
				v-if="isBlueprintLoading"
				class="py-20 text-center text-muted-foreground"
			>
				{{ t('pages.blueprints.detail.loading') }}
			</div>

			<div v-else-if="blueprintLoadError" class="py-20 text-center">
				<p class="text-destructive mb-4">
					{{ t('pages.blueprints.detail.error') }}
				</p>
				<Button variant="outline" @click="refreshBlueprint">{{
					t('pages.blueprints.detail.tryAgain')
				}}</Button>
			</div>

			<div v-else-if="!blueprint" class="py-20 text-center">
				<p class="text-muted-foreground">
					{{ t('pages.blueprints.detail.notFound') }}
				</p>
			</div>

			<div
				v-else
				class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start"
			>
				<div class="space-y-8">
					<section class="space-y-4">
						<div
							class="relative rounded-lg overflow-hidden border border-cool-gray-20 dark:border-cool-gray-80 bg-white dark:bg-cool-gray-95"
						>
							<Carousel
								class="relative"
								@init-api="handleCarouselInit"
							>
								<CarouselContent>
									<CarouselItem
										v-for="(
											image, index
										) in galleryDisplayItems"
										:key="index"
									>
										<img
											:src="image.url || image.thumbnail"
											:alt="image.name"
											class="w-full h-full object-center object-contain"
										/>
									</CarouselItem>
								</CarouselContent>
								<CarouselPrevious
									class="absolute left-4 top-1/2 -translate-y-1/2"
								/>
								<CarouselNext
									class="absolute right-4 top-1/2 -translate-y-1/2"
								/>
							</Carousel>
						</div>
						<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
							<button
								v-for="(image, index) in galleryDisplayItems"
								:key="`thumb-${index}`"
								type="button"
								class="rounded-xl border transition-colors overflow-hidden"
								:class="
									activeSlide === index
										? 'border-primary'
										: 'border-transparent hover:border-cool-gray-40'
								"
								@click="goToSlide(index)"
							>
								<img
									:src="image.thumbnail || image.url"
									:alt="image.name"
									class="w-full object-cover"
								/>
							</button>
						</div>
					</section>

					<section
						class="rounded-lg border border-cool-gray-20 dark:border-cool-gray-80 bg-white dark:bg-cool-gray-95 p-6 space-y-6"
					>
						<div class="flex items-center justify-between">
							<h1 class="font-bold text-3xl">
								{{ blueprint.title }}
							</h1>
							<div class="flex items-center gap-1">
								<DropdownMenu v-model:open="dropdownOpen">
									<DropdownMenuTrigger as-child>
										<Button
											class="before:border-none rounded-lg"
											size="icon-sm"
											variant="ghost"
										>
											<VerticalElipsis class="size-7.5" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<ReportButton
											reportable-type="App\Models\Blueprint"
											:reportable-id="blueprint.id"
											item-name="blueprint"
											@reported="handleReported"
										>
											<template
												#default="{
													handleReport,
													isReporting,
												}"
											>
												<DropdownMenuItem
													:disabled="isReporting"
													@click="handleReport"
												>
													<span v-if="isReporting">{{
														t(
															'reportButton.reporting'
														)
													}}</span>
													<span v-else>{{
														t(
															'pages.blueprints.detail.reportBlueprint'
														)
													}}</span>
												</DropdownMenuItem>
											</template>
										</ReportButton>
										<DropdownMenuItem
											v-if="
												blueprint.permissions.can_edit
											"
											as-child
										>
											<NuxtLinkLocale
												:to="`/blueprints/${blueprint.id}/edit`"
											>
												{{
													t(
														'pages.blueprints.detail.edit'
													)
												}}
											</NuxtLinkLocale>
										</DropdownMenuItem>
										<DropdownMenuItem
											v-if="
												blueprint.permissions.can_delete
											"
											@click="deleteDialogOpen = true"
										>
											<span>{{
												t(
													'pages.blueprints.detail.delete'
												)
											}}</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
						<div
							class="flex flex-col md:flex-row md:justify-between md:items-center gap-3"
						>
							<div class="flex items-center gap-3">
								<div
									v-for="stat in stats"
									:key="stat.label"
									class="flex items-center gap-3"
								>
									<component
										:is="stat.icon"
										class="size-4.5 text-cool-gray-70"
									/>
									<p class="font-medium text-cool-gray-90">
										{{ stat.value }}
									</p>
								</div>
							</div>
							<div
								class="flex flex-wrap gap-4 text-sm text-cool-gray-70"
							>
								<div class="flex items-center gap-2">
									<ClockIcon class="w-4 h-4" />
									{{ t('pages.blueprints.detail.created') }}
									{{ formattedCreatedAt }}
								</div>
								<div class="flex items-center gap-2">
									<CalendarIcon class="w-4 h-4" />
									{{ t('pages.blueprints.detail.updated') }}
									{{ formattedUpdatedAt }}
								</div>
							</div>
						</div>

						<hr class="border-cool-gray-20" />

						<div>
							<p
								class="text-sm text-cool-gray-80 leading-relaxed whitespace-pre-line"
							>
								{{
									blueprint.description ||
									t('pages.blueprints.detail.noDescription')
								}}
							</p>
						</div>
					</section>
				</div>

				<aside class="space-y-6">
					<div
						class="rounded-xl border border-cool-gray-20 bg-white dark:bg-cool-gray-95 p-6 space-y-5"
					>
						<div class="grid grid-cols-2 gap-2.5 w-full">
							<Tooltip>
								<TooltipTrigger as-child>
									<Button
										class="w-full justify-between before:hidden"
										rounded="base"
										@click="handleCopyCode"
									>
										<CopyIcon class="size-4.5" />
										{{
											t(
												'pages.blueprints.detail.copyCode'
											)
										}}
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									{{ t('copy.information') }}
								</TooltipContent>
							</Tooltip>
							<Button
								:variant="
									blueprint.is_liked ? 'default' : 'outline'
								"
								rounded="base"
								class="w-full justify-between before:hidden"
								:disabled="isTogglingLike"
								@click="handleToggleLike"
							>
								<LikesIcon class="w-4 h-4" />
								<span v-if="isTogglingLike">{{
									t('pages.blueprints.detail.saving')
								}}</span>
								<span v-else>{{
									blueprint.is_liked
										? t('pages.blueprints.detail.liked')
										: t('pages.blueprints.detail.like')
								}}</span>
							</Button>
						</div>
						<div>
							<h3 class="text-lg font-semibold mb-2.5">
								{{ t('pages.blueprints.detail.details') }}
							</h3>
							<div class="space-y-3 text-sm text-cool-gray-80">
								<div class="flex items-center justify-between">
									<span class="text-cool-gray-60">{{
										t('pages.blueprints.detail.author')
									}}</span>
									<span>{{
										blueprint.creator?.name ??
										t(
											'pages.blueprints.detail.anonymousPioneer'
										)
									}}</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-cool-gray-60">{{
										t(
											'pages.blueprints.detail.serverRegion'
										)
									}}</span>
									<span>{{
										serverRegionOptions.find(
											(r) =>
												r.value ===
												blueprint?.server_region
										)?.label ??
										t(
											'pages.blueprints.detail.serverRegionAny'
										)
									}}</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-cool-gray-60">{{
										t('pages.blueprints.detail.region')
									}}</span>
									<span>{{
										regionOptions.find(
											(r) => r.value === blueprint?.region
										)?.label ??
										t('pages.blueprints.detail.regionAny')
									}}</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-cool-gray-60">{{
										t('pages.blueprints.detail.version')
									}}</span>
									<span class="uppercase">{{
										blueprint.version
									}}</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-cool-gray-60">{{
										t('pages.blueprints.detail.status')
									}}</span>
									<span class="capitalize">{{
										blueprint.status
									}}</span>
								</div>
								<div
									v-if="blueprint.width || blueprint.height"
									class="flex items-center justify-between"
								>
									<span class="text-cool-gray-60">{{
										t('pages.blueprints.detail.size')
									}}</span>
									<span
										>{{ blueprint.width ?? 0 }}x{{
											blueprint.height ?? 0
										}}</span
									>
								</div>
							</div>
						</div>
						<hr class="border-cool-gray-20" />
						<div v-if="blueprint.tags.length">
							<h3 class="text-lg font-semibold mb-2.5">
								{{ t('pages.blueprints.detail.tags') }}
							</h3>
							<div class="flex flex-wrap gap-2">
								<button
									v-for="tag in blueprint.tags"
									:key="tag.id"
									type="button"
									class="px-3 py-1.5 rounded-full border border-cool-gray-30 dark:border-cool-gray-70 text-sm hover:bg-cool-gray-10 dark:hover:bg-cool-gray-80 transition-colors"
									@click="navigateToTag(tag)"
								>
									{{ tag.name }}
								</button>
							</div>
						</div>
						<hr class="border-cool-gray-20" />
						<div>
							<h3 class="text-lg font-semibold mb-2.5">
								{{
									t('pages.blueprints.detail.facilitiesUsed')
								}}
							</h3>
							<FacilityList
								v-if="blueprint.facilities?.length"
								:items="blueprint.facilities"
							/>
							<p v-else class="text-sm text-muted-foreground">
								{{ t('pages.blueprints.detail.noFacilities') }}
							</p>
						</div>
						<hr class="border-cool-gray-20" />
						<div>
							<h3 class="text-lg font-semibold mb-2.5">
								{{ t('pages.blueprints.detail.inputProducts') }}
							</h3>
							<ItemList
								v-if="blueprint.item_inputs?.length"
								:items="blueprint.item_inputs"
							/>
							<p v-else class="text-sm text-muted-foreground">
								{{
									t('pages.blueprints.detail.noInputProducts')
								}}
							</p>
						</div>
						<hr class="border-cool-gray-20" />
						<div>
							<h3 class="text-lg font-semibold mb-2.5">
								{{
									t('pages.blueprints.detail.outputProducts')
								}}
							</h3>
							<ItemList
								v-if="blueprint.item_outputs?.length"
								:items="blueprint.item_outputs"
							/>
							<p v-else class="text-sm text-muted-foreground">
								{{
									t(
										'pages.blueprints.detail.noOutputProducts'
									)
								}}
							</p>
						</div>
					</div>
				</aside>

				<section
					class="rounded-lg border border-cool-gray-20 dark:border-cool-gray-80 bg-white dark:bg-cool-gray-95 p-6 space-y-6"
				>
					<div
						class="flex items-center justify-between flex-wrap gap-3"
					>
						<h3 class="text-xl font-semibold">
							{{ t('pages.blueprints.detail.comments') }} ({{
								totalComments
							}})
						</h3>
					</div>

					<div v-if="editingCommentId" class="space-y-3">
						<h4 class="text-sm font-semibold">
							{{ t('pages.blueprints.detail.editingComment') }}
						</h4>
						<CommentComposer
							v-model="editingContent"
							:is-submitting="isSubmittingComment"
							:submit-label="
								t('pages.blueprints.detail.saveChanges')
							"
							:error="commentErrorMessage"
							@submit="saveCommentEdit"
						/>
						<Button variant="ghost" size="sm" @click="cancelEdit">{{
							t('pages.blueprints.detail.cancel')
						}}</Button>
					</div>
					<div v-else>
						<CommentComposer
							v-if="isAuthenticated"
							v-model="commentInput"
							:is-submitting="isSubmittingComment"
							:error="commentErrorMessage"
							@submit="submitComment"
						/>
						<div
							v-else
							class="rounded-2xl border border-dashed border-cool-gray-30 dark:border-cool-gray-70 p-6 text-center space-y-3"
						>
							<p class="text-sm text-cool-gray-70">
								{{
									t('pages.blueprints.detail.signInToComment')
								}}
							</p>
							<Button @click="loginModal.open">{{
								t(
									'pages.blueprints.detail.signInToCommentButton'
								)
							}}</Button>
						</div>
					</div>

					<CommentList
						:comments="comments"
						:loading="isCommentsLoading"
						:error="commentsLoadError ?? undefined"
						:current-user-id="user?.id"
						:deleting-comment-id="deletingCommentId"
						@retry="retryCommentsFetch"
						@edit="requestEditComment"
						@delete="deleteComment"
					/>

					<div v-if="hasMoreComments" class="text-center">
						<Button
							variant="outline"
							:disabled="commentsStatus === 'pending'"
							@click="loadMoreComments"
						>
							<span v-if="commentsStatus === 'pending'">{{
								t('pages.blueprints.detail.loadingComments')
							}}</span>
							<span v-else>{{
								t('pages.blueprints.detail.loadMoreComments')
							}}</span>
						</Button>
					</div>
				</section>
			</div>
		</div>

		<DeleteBlueprintDialog
			v-if="blueprint"
			:blueprint="blueprint"
			:open="deleteDialogOpen"
			@update:open="deleteDialogOpen = $event"
			@deleted="handleBlueprintDeleted"
		/>
	</div>
</template>
