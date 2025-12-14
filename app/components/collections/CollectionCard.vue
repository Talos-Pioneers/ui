<script setup lang="ts">
import type { BlueprintCollection } from '~/models/blueprintCollection'
import ClockIcon from '../icons/ClockIcon.vue'
import VerticalElipsis from '../icons/VerticalElipsis.vue'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import ReportButton from '~/components/ReportButton.vue'
import { Button } from '../ui/button'
import DeleteCollectionDialog from './DeleteCollectionDialog.vue'

const props = defineProps<{
	collection: BlueprintCollection
}>()

const emit = defineEmits<{
	'filter-author': [authorId: string]
	deleted: []
}>()

const { t } = useI18n()
const { isAuthenticated } = useSanctumAuth()
const dropdownOpen = ref(false)

const handleAuthorClick = () => {
	if (props.collection.creator) {
		emit('filter-author', props.collection.creator.id)
	}
}

const handleReported = () => {
	dropdownOpen.value = false
}

const deleteDialogOpen = ref(false)

const handleCollectionDeleted = () => {
	emit('deleted')
}

const blueprintsCount = computed(() => {
	return (
		props.collection.blueprints_count ??
		props.collection.blueprints?.length ??
		0
	)
})
</script>

<template>
	<div
		class="group rounded-b-[8px] border-cool-gray-20 border bg-white hover:border-cool-gray-40 transition-colors overflow-hidden"
	>
		<!-- Content Section -->
		<div
			class="p-4 flex flex-col gap-3 bg-white dark:bg-cool-gray-90 rounded-b-lg h-full"
		>
			<!-- Title and Author -->
			<div class="pb-3">
				<NuxtLinkLocale
					:to="`/collections/${collection.id}`"
					class="block"
				>
					<h2
						class="text-xl font-bold leading-6 text-cool-gray-90 mb-2 line-clamp-2"
					>
						{{ collection.title }}
						<span
							v-if="collection.status === 'draft'"
							class="ml-2 text-xs text-cool-gray-60 font-normal"
						>
							({{
								t('components.collections.card.status.draft')
							}})
						</span>
					</h2>
				</NuxtLinkLocale>
				<div class="flex items-center justify-between gap-2 h-4">
					<button
						v-if="collection.creator"
						class="group/author text-xs text-cool-gray-70 cursor-pointer transition-colors overflow-hidden text-nowrap text-ellipsis flex items-center h-4"
						@click="handleAuthorClick"
					>
						<span class="leading-0">by&nbsp;</span
						><span
							class="leading-0 group-hover/author:text-cool-gray-100 group-hover/author:underline transition-colors"
							>{{ collection.creator.name }}</span
						>
					</button>
					<p v-else class="text-xs leading-0 text-cool-gray-70">
						{{ t('components.collections.card.author.anonymous') }}
					</p>

					<div
						class="flex items-center gap-1.5 text-[10px] text-cool-gray-60 ml-auto text-nowrap flex-none"
					>
						<div class="flex items-center gap-1">
							<ClockIcon class="w-3 h-3" />
							<span class="leading-0">{{
								useFormatDate(collection.created_at)
							}}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Description -->
			<p
				v-if="collection.description"
				class="text-sm text-cool-gray-70 line-clamp-2"
			>
				{{ collection.description }}
			</p>

			<!-- Actions and Statistics -->
			<div class="flex items-center justify-between mt-auto">
				<div class="flex items-center gap-2">
					<span
						class="px-2 py-1 text-sm border border-cool-gray-30 group-hover/tags:border-cool-gray-100 transition-colors"
					>
						{{ t('components.collections.card.tagLabel') }}
					</span>
					<div
						class="flex items-center gap-4 text-sm text-cool-gray-80"
					>
						<div class="flex items-center gap-1.5">
							<span>{{
								useFormatCompactNumber(blueprintsCount)
							}}</span>
							<span class="text-cool-gray-60">{{
								blueprintsCount === 1
									? t('components.collections.card.blueprint')
									: t(
											'components.collections.card.blueprints'
										)
							}}</span>
						</div>
					</div>
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
								reportable-type="App\Models\BlueprintCollection"
								:reportable-id="collection.id"
								item-name="collection"
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
												'components.collections.card.actions.reporting'
											)
										}}</span>
										<span v-else>{{
											t(
												'components.collections.card.actions.report'
											)
										}}</span>
									</DropdownMenuItem>
								</template>
							</ReportButton>
							<DropdownMenuItem
								v-if="collection.permissions.can_edit"
								as-child
							>
								<NuxtLinkLocale
									:to="`/collections/${collection.id}/edit`"
								>
									<span>{{
										t(
											'components.collections.card.actions.edit'
										)
									}}</span>
								</NuxtLinkLocale>
							</DropdownMenuItem>
							<DropdownMenuItem
								v-if="collection.permissions.can_delete"
								@click="deleteDialogOpen = true"
							>
								<span>{{
									t(
										'components.collections.card.actions.delete'
									)
								}}</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>

		<DeleteCollectionDialog
			:collection="collection"
			:open="deleteDialogOpen"
			@update:open="deleteDialogOpen = $event"
			@deleted="handleCollectionDeleted"
		/>
	</div>
</template>
