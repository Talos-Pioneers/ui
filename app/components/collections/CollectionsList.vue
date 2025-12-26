<script setup lang="ts">
import type { BlueprintCollection } from '~/models/blueprintCollection'
import type { PaginationMeta } from '~/models/blueprint'
import CollectionCard from './CollectionCard.vue'
import BlueprintPagination from '../blueprints/BlueprintPagination.vue'
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarInset,
} from '~/components/ui/sidebar'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import { Checkbox } from '~/components/ui/checkbox'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import CloseIcon from '../icons/CloseIcon.vue'
import { useSidebar } from '@/components/ui/sidebar'
import type { NuxtError } from '#app'
import { CheckboxGroupRoot } from 'reka-ui'

const { t } = useI18n()

const props = withDefaults(
	defineProps<{
		collections: BlueprintCollection[]
		pagination: PaginationMeta | null
		filters: Record<string, any>
		sort: string
		isSortDescending: boolean
		hasActiveFilters: boolean
		activeFilterTags: Array<{
			filterKey: string
			label: string
			value: any
		}>
		currentPage: number
		perPage: number
		showSidebar?: boolean
		loading?: boolean
		error?: NuxtError | string | null
		isMyCollections?: boolean
	}>(),
	{
		showSidebar: true,
		loading: false,
		error: null,
		isMyCollections: false,
	}
)

const emit = defineEmits<{
	'update:filter': [key: string, value: any]
	'update:sort': [field: string, descending: boolean]
	'update:current-page': [page: number]
	'update:per-page': [perPage: number]
	'clear-filter': [key: string, value?: any]
	'clear-all-filters': []
	'collection-deleted': []
}>()

// Sort options
const sortOptions = [
	{
		value: 'created_at',
		label: t('components.collections.list.sort.createdAt'),
	},
	{
		value: 'updated_at',
		label: t('components.collections.list.sort.updatedAt'),
	},
	{ value: 'title', label: t('components.collections.list.sort.title') },
]

const currentSortLabel = computed(() => {
	const sortField = props.sort.replace(/^-/, '')
	const option = sortOptions.find((opt) => opt.value === sortField)
	return option?.label ?? t('components.collections.list.sort.relevancy')
})

const handleSortChange = (val: any) => {
	emit('update:sort', val, props.isSortDescending)
}

const handleSortToggle = () => {
	const field = props.sort.replace(/^-/, '')
	emit('update:sort', field, !props.isSortDescending)
}

const handleAuthorFilter = (authorId: string) => {
	emit('update:filter', 'author_id', authorId)
}

const handleClearTag = (filterKey: string, value: any) => {
	emit('clear-filter', filterKey, value)
}

const handleStatusChange = (status: any) => {
	if (!status || status === 'any') {
		emit('clear-filter', 'status')
	} else {
		emit('update:filter', 'status', status)
	}
}

const handleIsAnonymousChange = (value: any) => {
	if (value) {
		emit('update:filter', 'is_anonymous', value)
	} else {
		emit('clear-filter', 'is_anonymous', value)
	}
}

const currentPageModel = computed({
	get: () => props.currentPage,
	set: (value: number) => emit('update:current-page', value),
})

const perPageModel = computed({
	get: () => props.perPage,
	set: (value: number) => emit('update:per-page', value),
})

// const { open: sidebarOpen, toggleSidebar } = useSidebar()

const statusOptions = [
	{
		value: 'any',
		label: t('components.collections.list.filters.status.any'),
	},
	{
		value: 'published',
		label: t('components.collections.list.filters.status.public'),
	},
	{
		value: 'draft',
		label: t('components.collections.list.filters.status.private'),
	},
]
</script>

<template>
	<div class="flex w-full">
		<!-- Main Content -->
		<div class="flex flex-col w-full">
			<!-- Banner Section -->
			<slot name="banner" />

			<!-- Content Area -->
			<div class="wave-bg bg-cool-gray-10 before:bg-size-[400px]">
				<div class="container mx-auto px-4 py-6">
					<!-- Controls Bar -->
					<div class="flex flex-col gap-4 mb-8">
						<div
							class="flex flex-col md:flex-row gap-4 md:items-center md:justify-between"
						>
							<div
								v-if="hasActiveFilters"
								class="flex items-center gap-2 flex-wrap"
							>
								<button
									v-for="tag in activeFilterTags"
									:key="tag.value"
									class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cool-gray-20 dark:bg-cool-gray-80 text-cool-gray-90 dark:text-cool-gray-10 text-sm hover:bg-cool-gray-30 dark:hover:bg-cool-gray-70 transition-colors"
									@click="
										handleClearTag(tag.filterKey, tag.value)
									"
								>
									<span>{{ tag.label }}</span>
									<CloseIcon class="w-3 h-3" />
								</button>
								<Button
									variant="ghost"
									size="sm"
									class="text-sm"
									@click="emit('clear-all-filters')"
								>
									{{
										t(
											'components.collections.list.filters.clearAll'
										)
									}}
								</Button>
							</div>
							<div v-else />
							<span
								class="text-sm text-muted-foreground whitespace-nowrap"
							>
								{{
									t(
										'components.collections.list.pagination.found',
										{ count: pagination?.total ?? 0 }
									)
								}}
							</span>
						</div>

						<div
							class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
						>
							<div class="flex items-center gap-2">
								<label
									class="text-sm text-muted-foreground whitespace-nowrap"
									>{{
										t(
											'components.collections.list.pagination.sortBy'
										)
									}}</label
								>
								<Select
									:model-value="sort.replace(/^-/, '')"
									@update:model-value="handleSortChange"
								>
									<SelectTrigger class="w-[180px]">
										<SelectValue
											:placeholder="currentSortLabel"
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem
											v-for="option in sortOptions"
											:key="option.value"
											:value="option.value"
										>
											{{ option.label }}
										</SelectItem>
									</SelectContent>
								</Select>
								<Button
									class="rounded"
									variant="ghost"
									size="icon-sm"
									:title="
										isSortDescending
											? t(
													'components.collections.list.pagination.sortAscending'
												)
											: t(
													'components.collections.list.pagination.sortDescending'
												)
									"
									@click="handleSortToggle"
								>
									{{ isSortDescending ? '↑' : '↓' }}
								</Button>
							</div>
							<label
								class="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent/50 rounded px-2 py-1.5 transition-colors"
							>
								<Checkbox
									:checked="filters.is_anonymous === '1'"
									@update:model-value="
										handleIsAnonymousChange
									"
								/>
								<span class="text-sm text-sidebar-foreground">{{
									t(
										'components.collections.list.filters.isAnonymous'
									)
								}}</span>
							</label>
							<div class="ml-auto">
								<BlueprintPagination
									v-model:current-page="currentPageModel"
									v-model:per-page="perPageModel"
									:pagination="pagination"
									:show-per-page-selector="true"
								/>
							</div>
						</div>
					</div>

					<!-- Loading State -->
					<div
						v-if="loading"
						class="flex items-center justify-center py-12"
					>
						<div class="size-64">
							<Lottie name="throbber" />
						</div>
					</div>

					<!-- Error State -->
					<div
						v-if="error"
						class="flex flex-col items-center justify-center py-12"
					>
						<p class="text-destructive mb-2">
							{{ t('components.collections.list.error') }}
						</p>
					</div>

					<!-- Collections Grid -->
					<div
						v-if="!loading && !error"
						class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
					>
						<CollectionCard
							v-for="collection in collections"
							:key="collection.id"
							:collection="collection"
							@filter-author="handleAuthorFilter"
							@deleted="emit('collection-deleted')"
						/>

						<div
							v-if="collections.length === 0"
							class="col-span-full flex items-center justify-center py-12"
						>
							<p class="text-muted-foreground">
								{{ t('components.collections.list.empty') }}
							</p>
						</div>
					</div>

					<div class="flex justify-end">
						<!-- Pagination -->
						<BlueprintPagination
							v-model:current-page="currentPageModel"
							v-model:per-page="perPageModel"
							:pagination="pagination"
							:show-per-page-selector="false"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
