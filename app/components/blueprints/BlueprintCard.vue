<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import type { Blueprint } from '~/models/blueprint'
import type { BlueprintCollection } from '~/models/blueprintCollection'
import ClockIcon from '../icons/ClockIcon.vue'
import CopyIcon from '../icons/CopyIcon.vue'
import RegionIcon from '../icons/RegionIcon.vue'
import VerticalElipsis from '../icons/VerticalElipsis.vue'
import CopiesIcon from '../icons/CopiesIcon.vue'
import LikesIcon from '../icons/LikesIcon.vue'
import CommentsIcon from '../icons/CommentsIcon.vue'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import ReportButton from '~/components/ReportButton.vue'
import NotFoundImage from '~/assets/img/not-found-placeholder.png'
import { toast } from 'vue-sonner'
import { Button } from '../ui/button'
import {
	regionOptions,
	serverRegionOptions,
} from '~/constants/blueprintOptions'
import ServerRegionIcon from '../icons/ServerRegionIcon.vue'
import DeleteBlueprintDialog from './DeleteBlueprintDialog.vue'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import AddToCollection from '../collections/AddToCollection.vue'

const props = defineProps<{
	blueprint: Blueprint
	collectionId?: string
	canEditCollection?: boolean
}>()

const emit = defineEmits<{
	'filter-tag': [tagId: string]
	'filter-region': [region: string]
	'filter-server-region': [serverRegion: string]
	'filter-author': [authorId: string]
	deleted: []
	'removed-from-collection': []
}>()

const { copy, copied } = useClipboard()
const { t } = useI18n()
const sanctumClient = useSanctumClient()
const { isAuthenticated } = useSanctumAuth()
const dropdownOpen = ref(false)

const previewImage = computed(() => {
	return props.blueprint.gallery &&
		props.blueprint.gallery.length > 0 &&
		props.blueprint.gallery[0]
		? props.blueprint.gallery[0].thumbnail
		: null
})

const isCopyingCode = ref(false)
const copiesCount = ref(props.blueprint.copies_count)
const handleCopyCode = async () => {
	if (!props.blueprint) {
		return
	}

	await copy(props.blueprint.code)
	toast.success(t('pages.blueprints.detail.toast.codeCopied'))

	if (isCopyingCode.value) {
		return
	}

	isCopyingCode.value = true
	try {
		const response = await sanctumClient<{
			copies_count: number
			message: string
		}>(`/api/v1/blueprints/${props.blueprint.id}/copy`, {
			method: 'post',
		})
		copiesCount.value = response.copies_count
	} finally {
		isCopyingCode.value = false
	}
}

const handleTagClick = (tagId: string) => {
	emit('filter-tag', tagId)
}

const handleRegionClick = () => {
	if (props.blueprint.region) {
		emit('filter-region', props.blueprint.region)
	}
}

const handleServerRegionClick = () => {
	if (props.blueprint.server_region) {
		emit('filter-server-region', props.blueprint.server_region)
	}
}

const handleAuthorClick = () => {
	if (props.blueprint.creator) {
		emit('filter-author', props.blueprint.creator.id)
	}
}

const handleReported = () => {
	dropdownOpen.value = false
}

const deleteDialogOpen = ref(false)

const handleBlueprintDeleted = () => {
	emit('deleted')
}

const isRemovingFromCollection = ref(false)

const handleRemoveFromCollection = async () => {
	if (!props.collectionId || !props.canEditCollection) {
		return
	}

	isRemovingFromCollection.value = true

	try {
		// Fetch current collection blueprints
		const response = await sanctumClient<{
			data: BlueprintCollection
		}>(`/api/v1/collections/${props.collectionId}`, {
			method: 'get',
			query: {
				include: 'blueprints',
			},
		})

		const currentBlueprints =
			response.data?.blueprints?.map((bp) => bp.id) ?? []

		// Remove the blueprint from the array
		const updatedBlueprints = currentBlueprints.filter(
			(id) => id !== props.blueprint.id
		)

		// Update the collection
		await sanctumClient(`/api/v1/collections/${props.collectionId}`, {
			method: 'put',
			body: {
				blueprints: updatedBlueprints,
			},
		})

		toast.success(
			t('components.collections.addToCollection.removeSuccess')
		)
		emit('removed-from-collection')
	} catch (error) {
		const { isValidationError, bag } = useSanctumError(error)
		if (isValidationError && bag.length > 0) {
			toast.error(
				bag[0]?.message ||
					t('components.collections.addToCollection.removeError')
			)
		} else {
			toast.error(
				t('components.collections.addToCollection.removeErrorRetry')
			)
		}
	} finally {
		isRemovingFromCollection.value = false
		dropdownOpen.value = false
	}
}
</script>

<template>
	<div
		class="group grid grid-rows-[auto_1fr] rounded-b-[8px] border-cool-gray-20 border bg-white hover:border-cool-gray-40 transition-colors overflow-hidden"
	>
		<!-- Header Section with Preview Image -->
		<div class="relative aspect-video bg-cool-gray-90 overflow-hidden">
			<NuxtLinkLocale
				v-if="previewImage"
				:to="`/blueprints/${blueprint.id}`"
				class="w-full h-full"
			>
				<img
					:src="previewImage"
					:alt="blueprint.title"
					class="w-full h-full object-cover"
				/>
			</NuxtLinkLocale>
			<NuxtLinkLocale
				v-else
				:to="`/blueprints/${blueprint.id}`"
				class="w-full h-full flex items-center justify-center relative"
			>
				<img
					:src="NotFoundImage"
					:alt="blueprint.title"
					class="w-full h-full object-cover"
				/>
			</NuxtLinkLocale>
			<div class="absolute bottom-2 right-2 z-10">
				<Tooltip v-if="blueprint.code">
					<TooltipTrigger as-child>
						<button
							class="group/copy-button p-2 bg-black/50 border border-cool-gray-60 hover:border-cool-gray-80 rounded-full hover:bg-white transition-colors cursor-pointer"
							:title="
								copied
									? t(
											'components.blueprints.card.copyTooltip.copied'
										)
									: t(
											'components.blueprints.card.copyTooltip.copy'
										)
							"
							@click="handleCopyCode"
						>
							<CopyIcon
								class="w-5 h-5 text-cool-gray-30 group-hover/copy-button:text-cool-gray-80 transition-colors"
							/>
						</button>
					</TooltipTrigger>
					<TooltipContent>
						{{ t('copy.information') }}
					</TooltipContent>
				</Tooltip>
			</div>
		</div>

		<!-- Content Section -->
		<div
			class="p-4 flex flex-col gap-3 bg-white dark:bg-cool-gray-90 rounded-b-lg h-full"
		>
			<!-- Title and Author -->
			<div class="pb-3">
				<NuxtLinkLocale
					:to="`/blueprints/${blueprint.id}`"
					class="block"
				>
					<h2
						class="text-xl font-bold leading-6 text-cool-gray-90 mb-2 line-clamp-2"
					>
						{{ blueprint.title }}
						<span
							v-if="blueprint.width || blueprint.height"
							class="text-sm text-cool-gray-60"
						>
							{{ blueprint.width ?? 0 }}x{{
								blueprint.height ?? 0
							}}
						</span>
					</h2>
				</NuxtLinkLocale>
				<div class="flex items-center justify-between gap-2 h-4">
					<button
						v-if="blueprint.creator"
						class="group/author text-xs text-cool-gray-70 cursor-pointer transition-colors overflow-hidden text-nowrap text-ellipsis flex items-center h-4"
						@click="handleAuthorClick"
					>
						<span class="leading-0">by&nbsp;</span
						><span
							class="leading-0 group-hover/author:text-cool-gray-100 group-hover/author:underline transition-colors"
							>{{ blueprint.creator.name }}</span
						>
					</button>
					<p v-else class="text-xs leading-0 text-cool-gray-70">
						{{ t('components.blueprints.card.author.unknown') }}
					</p>

					<div
						class="flex items-center gap-1.5 text-[10px] text-cool-gray-60 ml-auto text-nowrap flex-none"
					>
						<div class="flex items-center gap-1">
							<ClockIcon class="w-3 h-3" />
							<span class="leading-0">{{
								useFormatDate(blueprint.created_at)
							}}</span>
						</div>
						<!--						<div class="border-r w-[1px] h-2.5 border-cool-gray-40">.</div>-->
						<!--						<div class="flex items-center gap-1">-->
						<!--						  <CalendarIcon class="w-3 h-3"/>-->
						<!--						  <span>{{ useFormatDate(blueprint.updated_at) }}</span>-->
						<!--						</div>-->
					</div>
				</div>
			</div>

			<!-- Region and Actions -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<button
						v-if="blueprint.server_region"
						type="button"
						class="group/server-region flex items-center gap-1.5 text-sm font-medium text-cool-gray-70 cursor-pointer transition-colors"
						@click="handleServerRegionClick"
					>
						<ServerRegionIcon
							class="w-5 h-5 group-hover/server-region:text-cool-gray-100 transition-colors"
						/>
						<span
							class="group-hover/server-region:text-cool-gray-100 group-hover/server-region:underline transition-colors"
							>{{
								t(`serverRegion.${blueprint.server_region}`)
							}}</span
						>
					</button>
					<button
						type="button"
						class="group/region flex items-center gap-1.5 text-sm font-medium text-cool-gray-70 cursor-pointer transition-colors"
						@click="handleRegionClick"
					>
						<RegionIcon class="w-5 h-5" />
						<span
							class="group-hover/region:text-cool-gray-100 group-hover/region:underline transition-colors"
							>{{
								blueprint.region
									? regionOptions.find(
											(r) => r.value === blueprint.region
										)?.label
									: t('components.blueprints.card.region.any')
							}}</span
						>
					</button>
				</div>
				<div class="flex items-center gap-1">
					<AddToCollection
						v-if="isAuthenticated"
						:blueprint="blueprint"
					/>
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
									#default="{ handleReport, isReporting }"
								>
									<DropdownMenuItem
										:disabled="isReporting"
										@click="handleReport"
									>
										<span v-if="isReporting">{{
											t(
												'components.blueprints.card.actions.reporting'
											)
										}}</span>
										<span v-else>{{
											t(
												'components.blueprints.card.actions.report'
											)
										}}</span>
									</DropdownMenuItem>
								</template>
							</ReportButton>
							<DropdownMenuItem
								v-if="blueprint.permissions.can_edit"
								as-child
							>
								<NuxtLinkLocale
									:to="`/blueprints/${blueprint.id}/edit`"
								>
									<span>{{
										t(
											'components.blueprints.card.actions.edit'
										)
									}}</span>
								</NuxtLinkLocale>
							</DropdownMenuItem>
							<DropdownMenuItem
								v-if="blueprint.permissions.can_delete"
								@click="deleteDialogOpen = true"
							>
								<span>{{
									t(
										'components.blueprints.card.actions.delete'
									)
								}}</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								v-if="collectionId && canEditCollection"
								:disabled="isRemovingFromCollection"
								@click="handleRemoveFromCollection"
							>
								<span>{{
									t(
										'components.blueprints.card.actions.removeFromCollection'
									)
								}}</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<!-- Statistics -->
			<div class="flex items-center gap-4 text-sm text-cool-gray-80">
				<div class="flex items-center gap-1.5">
					<CopiesIcon class="w-4" />
					<span>{{ useFormatCompactNumber(copiesCount) }}</span>
				</div>
				<div class="flex grow items-center gap-1.5">
					<LikesIcon class="w-4" />
					<span>{{
						useFormatCompactNumber(blueprint.likes_count)
					}}</span>
				</div>
				<div class="flex items-center gap-1.5">
					<CommentsIcon class="w-6" />
					<span>{{
						useFormatCompactNumber(blueprint.comments_count)
					}}</span>
				</div>
			</div>

			<!-- Tags -->
			<div
				class="group/tags flex items-center gap-2 flex-wrap border-t border-cool-gray-20 mt-auto pt-5 pb-3"
			>
				<span
					class="px-2 py-1 text-sm border border-cool-gray-30 group-hover/tags:border-cool-gray-100 transition-colors"
				>
					{{ t('components.blueprints.card.tagLabel') }}
				</span>
				<template
					v-for="(tag, index) in blueprint.tags"
					:key="tag.slug"
				>
					<span v-if="index !== 0" class="text-cool-gray-60 text-sm"
						>|</span
					>
					<span
						class="text-sm text-cool-gray-80 cursor-pointer hover:text-cool-gray-100 hover:underline transition-colors"
						@click="handleTagClick(tag.id)"
					>
						{{ tag.name }}
					</span>
				</template>
			</div>
		</div>

		<DeleteBlueprintDialog
			:blueprint="blueprint"
			:open="deleteDialogOpen"
			@update:open="deleteDialogOpen = $event"
			@deleted="handleBlueprintDeleted"
		/>
	</div>
</template>
