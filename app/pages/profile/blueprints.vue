<script setup lang="ts">
import BlueprintList from '~/components/blueprints/BlueprintList.vue'
import BlueprintProfileBanner from '~/components/banners/BlueprintProfileBanner.vue'
import { useBlueprintQueryFilter } from '~/composables/useBlueprintQueryFilter'
import type { Blueprint, PaginationMeta } from '~/models/blueprint'
import type { Facility } from '~/models/facility'
import type { Item } from '~/models/item'
import type { Tag } from '~/models/tag'
import {
	versionOptions,
	regionOptions,
	serverRegionOptions,
	statusOptions,
} from '~/constants/blueprintOptions'

definePageMeta({
	middleware: ['sanctum:auth'],
})

// Fetch filter data
const { data: facilitiesData } = await useLazySanctumFetch<{
	data: Facility[]
}>('/api/v1/facilities')
const { data: itemsData } = await useLazySanctumFetch<{ data: Item[] }>(
	'/api/v1/items'
)
const { data: tagsData } = await useLazySanctumFetch<{ data: Tag[] }>(
	'/api/v1/tags'
)

const facilities = computed(
	() =>
		facilitiesData.value?.data.map((f) => ({
			...f,
			icon: `https://assets.warfarin.wiki/v2/itemicon/${f.icon}.png`,
		})) ?? []
)
const items = computed(
	() =>
		itemsData.value?.data.map((i) => ({
			...i,
			icon: `https://assets.warfarin.wiki/v2/itemicon/${i.icon}.png`,
		})) ?? []
)
const tags = computed(() => tagsData.value?.data ?? [])

const {
	blueprints,
	pagination,
	blueprintsStatus,
	blueprintsError,
	blueprintsRefresh,

	currentPage,
	perPage,

	filters,
	sort,
	setFilter,
	clearFilter,
	clearAllFilters,
	hasActiveFilters,
	setSort,
	toggleSort,
	isSortDescending,
	computedQuery,
} = await useBlueprintQueryFilter('/api/v1/my/blueprints', {
	filters: {
		status: { type: 'string' },
		region: { type: 'string' },
		server_region: { type: 'string' },
		version: { type: 'string' },
		is_anonymous: { type: 'boolean' },
		facility: { type: 'array' },
		item_input: { type: 'array' },
		item_output: { type: 'array' },
		likes_count: { type: 'number' },
		copies_count: { type: 'number' },
		'tags.id': { type: 'array' },
		width: { type: 'number' },
		height: { type: 'number' },
	},
	sort: {
		default: 'created_at',
		fields: ['created_at', 'updated_at', 'title'],
	},
})

const activeFilterTags = computed(() => {
	const filterTags: Array<{ filterKey: string; label: string; value: any }> =
		[]

	Object.entries(filters.value).forEach(([key, value]) => {
		if (
			value === null ||
			value === '' ||
			(Array.isArray(value) && value.length === 0)
		) {
			return
		}

		if (key === 'status') {
			const status = statusOptions.find((s) => s.value === value)
			filterTags.push({
				filterKey: key,
				label: status?.label ?? String(value),
				value: value,
			})
			return
		}

		if (key === 'region') {
			const region = regionOptions.find((r) => r.value === value)
			filterTags.push({
				filterKey: key,
				label: region?.label ?? String(value),
				value: value,
			})
			return
		}

		if (key === 'server_region') {
			const serverRegion = serverRegionOptions.find(
				(r) => r.value === value
			)
			filterTags.push({
				filterKey: key,
				label: serverRegion?.label ?? String(value),
				value: value,
			})
			return
		}

		if (key === 'version') {
			const version = versionOptions.find((v) => v.value === value)
			filterTags.push({
				filterKey: key,
				label: version?.label ?? String(value),
				value: value,
			})
			return
		}

		if (key === 'tags.id' && Array.isArray(value)) {
			for (const item of value) {
				const tag = tags.value.find((t) => t.id == item)
				filterTags.push({
					filterKey: key,
					label: tag?.name ?? String(item),
					value: item,
				})
			}
			return
		}

		if (key === 'facility' && Array.isArray(value)) {
			for (const item of value) {
				const facility = facilities.value.find((f) => f.slug == item)
				filterTags.push({
					filterKey: key,
					label: facility?.name ?? String(item),
					value: item,
				})
			}
			return
		}

		if (key === 'item_input' && Array.isArray(value)) {
			for (const item of value) {
				const factoryItem = items.value.find((i) => i.slug == item)
				filterTags.push({
					filterKey: key,
					label: factoryItem?.name ?? String(item),
					value: item,
				})
			}
			return
		}

		if (key === 'item_output' && Array.isArray(value)) {
			for (const item of value) {
				const factoryItem = items.value.find((i) => i.slug == item)
				filterTags.push({
					filterKey: key,
					label: factoryItem?.name ?? String(item),
					value: item,
				})
			}
			return
		}

		if (key === 'width' && value !== null && value !== '') {
			filterTags.push({
				filterKey: key,
				label: `${t('components.blueprints.list.filters.width')}: ≤${value}`,
				value: value,
			})
			return
		}

		if (key === 'height' && value !== null && value !== '') {
			filterTags.push({
				filterKey: key,
				label: `${t('components.blueprints.list.filters.height')}: ≤${value}`,
				value: value,
			})
			return
		}

		if (key === 'is_anonymous' && value === true) {
			filterTags.push({
				filterKey: key,
				label: t('components.blueprints.list.filters.isAnonymous'),
				value: value,
			})
			return
		}
	})

	return filterTags
})

const { t } = useI18n()

const sortOptions = [
	{
		value: 'created_at',
		label: t('pages.profile.blueprints.sort.createdAt'),
	},
	{
		value: 'updated_at',
		label: t('pages.profile.blueprints.sort.updatedAt'),
	},
	{ value: 'title', label: t('pages.profile.blueprints.sort.title') },
]

const handlePageUpdate = (page: number) => {
	currentPage.value = page
}

const handlePerPageUpdate = (perPageValue: number) => {
	perPage.value = perPageValue
}
</script>

<template>
	<div>
		<BlueprintList
			:blueprints="blueprints"
			:pagination="pagination"
			:facilities="facilities"
			:items="items"
			:tags="tags"
			:filters="filters"
			:sort="sort"
			:is-sort-descending="isSortDescending"
			:has-active-filters="hasActiveFilters"
			:active-filter-tags="activeFilterTags"
			:current-page="currentPage"
			:per-page="perPage"
			:loading="blueprintsStatus === 'pending'"
			:error="blueprintsError"
			:sort-options="sortOptions"
			@update:filter="setFilter"
			@update:sort="setSort"
			@update:current-page="handlePageUpdate"
			@update:per-page="handlePerPageUpdate"
			@clear-filter="clearFilter"
			@clear-all-filters="clearAllFilters"
			@toggle-sort="toggleSort"
			@blueprint-deleted="blueprintsRefresh"
		>
			<template #banner>
				<BlueprintProfileBanner />
			</template>
		</BlueprintList>
	</div>
</template>
