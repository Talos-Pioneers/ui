<script setup lang="ts">
import { useQueryFilters } from '~/composables/useQueryFilters';
import type { Blueprint } from '~/models/blueprint';
import BlueprintCard from './BlueprintCard.vue';

type BlueprintListResponse = {
	data: Blueprint[];
	links: {
		first: string | null;
		last: string | null;
		prev: string | null;
		next: string | null;
	};
	meta: {
		current_page: number;
		from: number | null;
		last_page: number;
		per_page: number;
		to: number | null;
		total: number;
	};
};

// Configure filters and sorting for blueprints
const { filters, sort, setFilter, clearFilter, clearAllFilters, hasActiveFilters, setSort, toggleSort, resetSort, isSortDescending, reset, computedQuery, buildFiltersFromQuery, buildSortFromQuery } = useQueryFilters({
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

// Sort options
const sortOptions = [
	{ value: 'created_at', label: 'Created Date' },
	{ value: 'updated_at', label: 'Updated Date' },
	{ value: 'title', label: 'Title' },
	{ value: 'likes_count', label: 'Likes' },
	{ value: 'copies_count', label: 'Copies' },
];

// Get filter entries for iteration
const filterEntries = computed(() => {
	return Object.entries(filters.value).filter(([key, value]) => {
		return value !== null && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
	});
});

// Handle filter events from BlueprintCard
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
</script>

<template>
	<div class="blueprint-list">
		<!-- Filters and Sorting Controls -->
		<div class="filters-section">
			<div class="sort-controls">
				<label for="sort-select">Sort by:</label>
				<select id="sort-select" :value="sort" @change="toggleSort(($event.target as HTMLSelectElement).value)">
					<option v-for="option in sortOptions" :key="option.value" :value="option.value">
						{{ option.label }} {{ isSortDescending && sort ===
							option.value ? '(Desc)' : '' }}
					</option>
				</select>
				<button v-if="isSortDescending" @click="toggleSort(sort)" title="Sort ascending">
					↑
				</button>
				<button v-else @click="toggleSort(sort)" title="Sort descending">
					↓
				</button>
			</div>

			<div v-if="hasActiveFilters" class="active-filters">
				<span>Active filters:</span>
				<button v-for="[key, value] in filterEntries" :key="key" @click="clearFilter(key)" class="filter-tag">
					{{ key }}: {{ Array.isArray(value) ? value.join(', ') : value }}
					×
				</button>
				<button @click="clearAllFilters(true)" class="clear-all">
					Clear all
				</button>
			</div>
		</div>

		<!-- Loading State -->
		<div v-if="status === 'pending'" class="loading">
			Loading blueprints...
		</div>

		<!-- Error State -->
		<div v-if="status === 'error'" class="error">
			<p>Error loading blueprints:</p>
			<pre>{{ error }}</pre>
		</div>

		<!-- Blueprints Grid -->
		<div v-if="status === 'success'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-7.5">
			<BlueprintCard v-for="blueprint in blueprints" :key="blueprint.id" :blueprint="blueprint"
				@filter-tag="handleTagFilter" @filter-region="handleRegionFilter" @filter-author="handleAuthorFilter" />

			<div v-if="blueprints.length === 0" class="empty-state">
				<p>No blueprints found.</p>
			</div>
		</div>

		<!-- Pagination -->
		<div v-if="pagination && pagination.last_page > 1" class="pagination">
			<button :disabled="pagination.current_page <= 1" @click="currentPage = pagination.current_page - 1">
				Previous
			</button>
			<span>
				Page {{ pagination.current_page }} of {{ pagination.last_page }}
				({{ pagination.total }} total)
			</span>
			<button :disabled="pagination.current_page >= pagination.last_page"
				@click="currentPage = pagination.current_page + 1">
				Next
			</button>
		</div>
	</div>
</template>
