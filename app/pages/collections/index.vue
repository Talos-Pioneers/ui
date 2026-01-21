<script setup lang="ts">
import MainBanner from '~/components/banners/MainBanner.vue'
import CollectionsList from '~/components/collections/CollectionsList.vue'
import { useCollectionQueryFilter } from '~/composables/useCollectionQueryFilter'
import type { BlueprintCollection } from '~/models/blueprintCollection'

const {
	collections,
	pagination,
	collectionsStatus,
	collectionsError,
	collectionsRefresh,

	currentPage,
	perPage,

	filters,
	sort,
	setFilter,
	clearFilter,
	clearAllFilters,
	hasActiveFilters,
	setSort,
	isSortDescending,
} = await useCollectionQueryFilter('/api/v1/collections', {
	filters: {
		author_id: { type: 'string' },
		is_anonymous: { type: 'boolean' },
	},
	sort: {
		default: '-created_at',
		fields: ['created_at', 'updated_at', 'title'],
	},
})

const { t } = useI18n()

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
			// Find the author name from collections data
			const authorCollection = collections.value.find(
				(c) => c.creator?.id === value
			)
			const authorName =
				authorCollection?.creator?.name ??
				t('components.collections.list.filters.author.unknown')
			filterTags.push({
				filterKey: key,
				label: `${t('components.collections.list.filters.author.label')}: ${authorName}`,
				value: value,
			})
			return
		}

		if (key === 'is_anonymous' && value) {
			filterTags.push({
				filterKey: key,
				label: t('components.collections.list.filters.isAnonymous'),
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
</script>

<template>
	<div>
		<CollectionsList
			:collections="collections"
			:pagination="pagination"
			:filters="filters"
			:sort="sort"
			:is-sort-descending="isSortDescending"
			:has-active-filters="hasActiveFilters"
			:active-filter-tags="activeFilterTags"
			:current-page="currentPage"
			:per-page="perPage"
			:loading="collectionsStatus === 'pending'"
			:error="collectionsError"
			:is-my-collections="false"
			@update:filter="setFilter"
			@update:sort="setSort"
			@update:current-page="handlePageUpdate"
			@update:per-page="handlePerPageUpdate"
			@clear-filter="clearFilter"
			@clear-all-filters="clearAllFilters"
			@collection-deleted="collectionsRefresh"
		>
			<template #banner>
				<MainBanner />
			</template>
		</CollectionsList>
	</div>
</template>
