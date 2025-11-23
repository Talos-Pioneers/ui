<script setup lang="ts">
import BlueprintList from '~/components/blueprints/BlueprintList.vue';
import MainBanner from '~/components/banners/MainBanner.vue';
import { useQueryFilters } from '~/composables/useQueryFilters';
import type { Blueprint, PaginationMeta } from '~/models/blueprint';
import type { Facility } from '~/models/facility';
import type { Item } from '~/models/item';
import type { Tag } from '~/models/tag';
import { versionOptions, regionOptions } from '~/constants/blueprintOptions';

const { locale, locales, t } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const availableLocales = computed(() => {
	return locales.value.filter(i => i.code !== locale.value);
});
const { user } = useSanctumAuth();

type BlueprintListResponse = {
	data: Blueprint[];
	links: {
		first: string | null;
		last: string | null;
		prev: string | null;
		next: string | null;
	};
	meta: PaginationMeta;
};

// Configure filters and sorting for blueprints
const { filters, sort, setFilter, clearFilter, clearAllFilters, hasActiveFilters, setSort, toggleSort, isSortDescending, computedQuery } = useQueryFilters({
	filters: {
		region: { type: 'string' },
		version: { type: 'string' },
		is_anonymous: { type: 'boolean' },
		author_id: { type: 'string' },
		facility: { type: 'array' },
		item_input: { type: 'array' },
		item_output: { type: 'array' },
		likes_count: { type: 'number' },
		copies_count: { type: 'number' },
		'tags.id': { type: 'array' },
	},
	sort: {
		default: 'created_at',
		fields: ['created_at', 'updated_at', 'title', 'likes_count', 'copies_count'],
	},
});

const route = useRoute();
const { query } = route;

// Pagination state - initialize from route query
const currentPage = ref<number>(Number(query.page) || 1);
const perPage = ref<number>(Number(query.per_page) || 25);

// Sync pagination state when route query changes (e.g., browser back/forward)
watch(() => route.query, (newQuery) => {
	const newPage = Number(newQuery.page) || 1;
	const newPerPage = Number(newQuery.per_page) || 25;
	if (newPage !== currentPage.value) {
		currentPage.value = newPage;
	}
	if (newPerPage !== perPage.value) {
		perPage.value = newPerPage;
	}
});

// Build active query with filters, sort, and pagination
const activeQuery = computed(() => {
	const queryParams = { ...computedQuery.value };
	if (currentPage.value > 1) {
		queryParams.page = String(currentPage.value);
	}
	if (perPage.value !== 25) {
		queryParams.per_page = String(perPage.value);
	}
	return queryParams;
});

// Fetch blueprints data
const { data, status, error, refresh } = await useSanctumFetch<BlueprintListResponse>(
	'/api/v1/blueprints',
	() => ({
		method: 'get',
		query: activeQuery.value,
	}),
	{
		watch: [activeQuery],
	}
);

// Extract pagination data from response
const pagination = computed(() => data.value?.meta ?? null);
const blueprints = computed(() => data.value?.data ?? []);

// Sync currentPage with API response (in case API adjusts the page)
watch(pagination, (newPagination) => {
	if (newPagination && newPagination.current_page !== currentPage.value) {
		currentPage.value = newPagination.current_page;
	}
});

// Reset to page 1 when filters or sort change
watch(filters, () => {
	if (currentPage.value > 1) {
		currentPage.value = 1;
	}
}, { deep: true });

watch(sort, () => {
	if (currentPage.value > 1) {
		currentPage.value = 1;
	}
});

// Update route query when pagination changes
watch([currentPage, perPage], () => {
	useRouter().replace({
		query: activeQuery.value,
	});
});

// Fetch filter data
const { data: facilitiesData } = await useSanctumFetch<{ data: Facility[] }>('/api/v1/facilities');
const { data: itemsData, status: itemsStatus, error: itemsError } = await useSanctumFetch<{ data: Item[] }>('/api/v1/items');
const { data: tagsData } = await useSanctumFetch<{ data: Tag[] }>('/api/v1/tags');

const facilities = computed(() => facilitiesData.value?.data ?? []);
const items = computed(() => itemsData.value?.data ?? []);
const tags = computed(() => tagsData.value?.data ?? []);

// Format active filters for display
const activeFilterTags = computed(() => {
	const filterTags: Array<{ key: string; value: any }> = [];

	Object.entries(filters.value).forEach(([key, value]) => {
		if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
			return;
		}

		if (key === 'region') {
			const region = regionOptions.find(r => r.value === value);
			filterTags.push({ key, value: region?.label ?? String(value) });
			return;
		}
		if (key === 'version') {
			const version = versionOptions.find(v => v.value === value);
			filterTags.push({ key, value: version?.label ?? String(value) });
			return;
		}

		if (key === 'tags.id' && Array.isArray(value)) {
			for (const item of value) {
				const tag = tags.value.find(t => t.id == item);
				filterTags.push({ key, value: tag?.name ?? String(item) });
			}
			return;
		}

		if (key === 'facility' && Array.isArray(value)) {
			for (const item of value) {
				const facility = facilities.value.find(f => f.slug == item);
				filterTags.push({ key, value: facility?.name ?? String(item) });
			}
			return;
		}

		if (key === 'item_input' && Array.isArray(value)) {
			for (const item of value) {
				const factoryItem = items.value.find(i => i.slug == item);
				filterTags.push({ key, value: factoryItem?.name ?? String(item) });
			}
			return;
		}

		if (key === 'item_output' && Array.isArray(value)) {
			for (const item of value) {
				const factoryItem = items.value.find(i => i.slug == item);
				filterTags.push({ key, value: factoryItem?.name ?? String(item) });
			}
			return;
		}
	});

	return filterTags;
});

// Handle filter events from BlueprintList
const handleFilterUpdate = (key: string, value: any) => {
	console.log('handleFilterUpdate', key, value);
	setFilter(key, value);
};

const handleSortUpdate = (field: string, descending: boolean) => {
	setSort(field, descending);
};

const handleClearFilter = (key: string, value?: any) => {
	clearFilter(key, value);
};

const handleClearAllFilters = () => {
	clearAllFilters(true);
};

const handleTagFilter = (tagId: string) => {
	const currentTags = (filters.value['tags.id'] as string[]) || [];
	if (!currentTags.includes(tagId)) {
		setFilter('tags.id', [...currentTags, tagId]);
	}
};

const handleRegionFilter = (region: string) => {
	setFilter('region', region);
};

const handleAuthorFilter = (authorId: string) => {
	setFilter('author_id', authorId);
};

const handlePageUpdate = (page: number) => {
	currentPage.value = page;
};

const handlePerPageUpdate = (perPageValue: number) => {
	perPage.value = perPageValue;
};
</script>

<template>
	<div>
		<BlueprintList :blueprints="blueprints" :pagination="pagination" :facilities="facilities" :items="items"
			:tags="tags" :filters="filters" :sort="sort" :is-sort-descending="isSortDescending"
			:has-active-filters="hasActiveFilters" :active-filter-tags="activeFilterTags" :current-page="currentPage"
			:per-page="perPage" :loading="status === 'pending'" :error="error" @update:filter="handleFilterUpdate"
			@update:sort="handleSortUpdate" @update:current-page="handlePageUpdate"
			@update:per-page="handlePerPageUpdate" @clear-filter="handleClearFilter"
			@clear-all-filters="handleClearAllFilters" @filter-tag="handleTagFilter" @filter-region="handleRegionFilter"
			@filter-author="handleAuthorFilter">
			<template #banner>
				<MainBanner />
			</template>
		</BlueprintList>
	</div>
</template>
