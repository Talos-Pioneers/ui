<script setup lang="ts">
import BlueprintList from '~/components/blueprints/BlueprintList.vue'
import MainBanner from '~/components/banners/MainBanner.vue'
import type { Facility } from '~/models/facility'
import type { Item } from '~/models/item'
import type { Tag } from '~/models/tag'
import { versionOptions, regionOptions } from '~/constants/blueprintOptions'

const { t } = useI18n()
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
} = await useBlueprintQueryFilter('/api/v1/blueprints')

const handleBlueprintDeleted = () => {
	blueprintsRefresh()
}

const activeFilterTags = computed(() => {
	const filterTags: Array<{
		filterKey: string
		label: string
		value: any
	}> = []

	Object.entries(filters.value).forEach(([key, value]) => {
		if (
			value === null ||
			value === '' ||
			(Array.isArray(value) && value.length === 0)
		) {
			return
		}

		if (key === 'author_id') {
			const authorBlueprint = blueprints.value.find(
				(b) => b.creator?.id == value
			)
			const authorName =
				authorBlueprint?.creator?.name ??
				t('components.blueprints.list.filters.author.unknown')
			filterTags.push({
				filterKey: key,
				label: authorName,
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

const handlePageUpdate = (page: number) => {
	currentPage.value = page
}

const handlePerPageUpdate = (perPageValue: number) => {
	perPage.value = perPageValue
}

const currentUrl = computed(() => {
	if (import.meta.server) {
		const requestURL = useRequestURL()
		return requestURL.href
	}
	return window.location.href
})

const ogImage = computed(() => {
	if (import.meta.server) {
		const requestURL = useRequestURL()
		return `${requestURL.origin}/logo.png`
	}
	return `${window.location.origin}/logo.png`
})

useHead({
	title: 'Browse Endfield Blueprints',
	meta: [
		{
			name: 'description',
			content: t('pages.home.description'),
		},
		{
			property: 'og:title',
			content: t('pages.home.title'),
		},
		{
			property: 'og:description',
			content: t('pages.home.description'),
		},
		{
			property: 'keywords',
			content: 'Arknights: Endfield, Endfield, Blueprints, AIC, Automated Industry Complex',
		},
		{
			property: 'og:image',
			content: ogImage.value,
		},
		{
			property: 'og:url',
			content: currentUrl.value,
		},
		{
			property: 'og:type',
			content: 'website',
		},
		{
			property: 'og:site_name',
			content: t('pages.home.siteName'),
		},
		{
			name: 'twitter:card',
			content: 'summary_large_image',
		},
		{
			name: 'twitter:title',
			content: t('pages.home.title'),
		},
		{
			name: 'twitter:description',
			content: t('pages.home.description'),
		},
		{
			name: 'twitter:image',
			content: ogImage.value,
		},
	],
})
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
			@update:filter="setFilter"
			@update:sort="setSort"
			@update:current-page="handlePageUpdate"
			@update:per-page="handlePerPageUpdate"
			@clear-filter="clearFilter"
			@clear-all-filters="clearAllFilters"
			@toggle-sort="toggleSort"
			@blueprint-deleted="handleBlueprintDeleted"
		>
			<template #banner>
				<MainBanner />
			</template>
		</BlueprintList>
	</div>
</template>
