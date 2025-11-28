<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import type { Blueprint } from '~/models/blueprint'
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
import { regionOptions } from '~/constants/blueprintOptions'

const props = defineProps<{
	blueprint: Blueprint
}>()

const emit = defineEmits<{
	'filter-tag': [tagId: string]
	'filter-region': [region: string]
	'filter-author': [authorId: string]
}>()

const { copy, copied } = useClipboard()
const { t } = useI18n()
const sanctumClient = useSanctumClient()

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

const handleAuthorClick = () => {
	if (props.blueprint.creator) {
		emit('filter-author', props.blueprint.creator.id)
	}
}

const handleReported = () => {
	dropdownOpen.value = false
}

const { handleDelete } = await useBlueprintDelete()
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
				>
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
				>
			</NuxtLinkLocale>
			<div class="absolute bottom-2 right-2 z-10">
				<button
					class="group/copy-button p-2 bg-black/50 border border-cool-gray-60 hover:border-cool-gray-80 rounded-full hover:bg-white transition-colors cursor-pointer"
					:title="copied ? t('components.blueprints.card.copyTooltip.copied') : t('components.blueprints.card.copyTooltip.copy')"
					@click="handleCopyCode"
				>
					<CopyIcon
						class="w-5 h-5 text-cool-gray-30 group-hover/copy-button:text-cool-gray-80 transition-colors"
					/>
				</button>
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
				<div
					class="group/region flex items-center gap-1.5 text-sm font-medium text-cool-gray-80 cursor-pointer transition-colors"
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
				</div>
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
									#default="{ handleReport, isReporting }"
								>
									<DropdownMenuItem
										:disabled="isReporting"
										@click="handleReport"
									>
										<span v-if="isReporting"
											>{{ t('components.blueprints.card.actions.reporting') }}</span
										>
										<span v-else>{{ t('components.blueprints.card.actions.report') }}</span>
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
									<span>{{ t('components.blueprints.card.actions.edit') }}</span>
								</NuxtLinkLocale>
							</DropdownMenuItem>
							<DropdownMenuItem
								v-if="blueprint.permissions.can_delete"
								@click="handleDelete(blueprint)"
							>
								<span>{{ t('components.blueprints.card.actions.delete') }}</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<!-- Statistics -->
			<div class="flex items-center gap-4 text-sm text-cool-gray-80">
				<div class="flex items-center gap-1.5">
					<CopiesIcon class="w-4" />
					<span>{{
						useFormatCompactNumber(copiesCount)
					}}</span>
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
	</div>
</template>
