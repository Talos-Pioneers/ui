<script setup lang="ts">
	import BlueprintList from '~/components/blueprints/BlueprintList.vue'
	import MainBanner from '~/components/banners/MainBanner.vue'
	import { useQueryFilters } from '~/composables/useQueryFilters'
	import type { Blueprint, PaginationMeta } from '~/models/blueprint'
	import type { Facility } from '~/models/facility'
	import type { Item } from '~/models/item'
	import type { Tag } from '~/models/tag'
	import { versionOptions, regionOptions } from '~/constants/blueprintOptions'

	const { locale, locales, t } = useI18n()
	const switchLocalePath = useSwitchLocalePath()

	const availableLocales = computed(() => {
		return locales.value.filter((i) => i.code !== locale.value)
	})
	const { user } = useSanctumAuth()
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
				icon: `https://static.warfarin.wiki/v1/itemicon/${f.icon}.webp`,
			})) ?? []
	)
	const items = computed(
		() =>
			itemsData.value?.data.map((i) => ({
				...i,
				icon: `https://static.warfarin.wiki/v1/itemicon/${i.icon}.webp`,
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
	} = await useBlueprintQueryFilter('/api/v1/blueprints')

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
					const facility = facilities.value.find(
						(f) => f.slug == item
					)
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
		})

		return filterTags
	})

	const handlePageUpdate = (page: number) => {
		currentPage.value = page
	}

	const handlePerPageUpdate = (perPageValue: number) => {
		perPage.value = perPageValue
	}

	const head = useHead({
		title: t('pages.home.title'),
		meta: [
			{
				property: 'og:title',
				content: t('pages.home.title'),
			},
			{
				name: 'description',
				content: t('pages.home.description'),
			},
			{
				property: 'og:description',
				content: t('pages.home.description'),
			},
			{
				property: 'og:image',
				content: '/logo.png',
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
		>
			<template #banner>
				<MainBanner />
			</template>
		</BlueprintList>
	</div>
</template>
