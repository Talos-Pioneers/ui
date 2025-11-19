<script setup lang="ts">
import { useQueryFilters } from '~/composables/useQueryFilters';
import type { Blueprint } from '~/models/blueprint';

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
const queryFilters = useQueryFilters({
	filters: {
		region: { type: 'string' },
		version: { type: 'string' },
		is_anonymous: { type: 'boolean' },
		author_id: { type: 'number' },
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

// Get current page from route query
const route = useRoute();
const currentPage = computed(() => {
	const page = route.query.page;
	return page ? Number(page) : 1;
});

// Watch for query changes and fetch blueprints
const queryParams = computed(() => {
	const params = queryFilters.buildQuery();
	if (currentPage.value > 1) {
		params.page = String(currentPage.value);
	}
	return params;
});

const { data, status, error, refresh } = await useSanctumFetch<BlueprintListResponse>('/api/v1/blueprints', {
	query: queryParams,
});

const blueprints = computed(() => data.value?.data ?? []);
const pagination = computed(() => data.value?.meta ?? null);

// Refresh when query params change
watch(queryParams, () => {
	refresh();
}, { deep: true });

// Sort options
const sortOptions = [
	{ value: 'created_at', label: 'Created Date' },
	{ value: 'updated_at', label: 'Updated Date' },
	{ value: 'title', label: 'Title' },
	{ value: 'likes_count', label: 'Likes' },
	{ value: 'copies_count', label: 'Copies' },
];

const currentSortLabel = computed(() => {
	const option = sortOptions.find(opt => opt.value === queryFilters.getSortField.value);
	return option?.label ?? 'Created Date';
});

// Get filter entries for iteration
const filterEntries = computed(() => {
	return Object.entries(queryFilters.filters).filter(([key, value]) => {
		return value !== null && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
	});
});
</script>

<template>
	<div class="blueprint-list">
		<!-- Filters and Sorting Controls -->
		<div class="filters-section">
			<div class="sort-controls">
				<label for="sort-select">Sort by:</label>
				<select id="sort-select" :value="queryFilters.getSortField.value"
					@change="queryFilters.toggleSort(($event.target as HTMLSelectElement).value)">
					<option v-for="option in sortOptions" :key="option.value" :value="option.value">
						{{ option.label }} {{ queryFilters.isSortDescending.value && queryFilters.getSortField.value ===
							option.value ? '(Desc)' : '' }}
					</option>
				</select>
				<button v-if="queryFilters.isSortDescending.value"
					@click="queryFilters.setSort(queryFilters.getSortField.value, false)" title="Sort ascending">
					↑
				</button>
				<button v-else @click="queryFilters.setSort(queryFilters.getSortField.value, true)"
					title="Sort descending">
					↓
				</button>
			</div>

			<div v-if="queryFilters.hasActiveFilters.value" class="active-filters">
				<span>Active filters:</span>
				<button v-for="[key, value] in filterEntries" :key="key" @click="queryFilters.clearFilter(key)"
					class="filter-tag">
					{{ key }}: {{ Array.isArray(value) ? value.join(', ') : value }}
					×
				</button>
				<button @click="queryFilters.clearAllFilters()" class="clear-all">
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
		<div v-if="status === 'success'" class="blueprints-grid">
			<BlueprintCard v-for="blueprint in blueprints" :key="blueprint.id" :blueprint="blueprint" />

			<div v-if="blueprints.length === 0" class="empty-state">
				<p>No blueprints found.</p>
			</div>
		</div>

		<!-- Pagination -->
		<div v-if="pagination && pagination.last_page > 1" class="pagination">
			<button :disabled="currentPage <= 1"
				@click="navigateTo({ query: { ...route.query, page: currentPage - 1 } })">
				Previous
			</button>
			<span>
				Page {{ pagination.current_page }} of {{ pagination.last_page }}
				({{ pagination.total }} total)
			</span>
			<button :disabled="currentPage >= pagination.last_page"
				@click="navigateTo({ query: { ...route.query, page: currentPage + 1 } })">
				Next
			</button>
		</div>
	</div>
</template>

<style scoped>
.blueprint-list {
	@apply space-y-6;
}

.filters-section {
	@apply flex flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg;
}

.sort-controls {
	@apply flex items-center gap-2;
}

.sort-controls label {
	@apply font-medium;
}

.sort-controls select {
	@apply px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700;
}

.sort-controls button {
	@apply px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700;
}

.active-filters {
	@apply flex flex-wrap items-center gap-2;
}

.filter-tag {
	@apply px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800;
}

.clear-all {
	@apply px-2 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-800;
}

.loading,
.error {
	@apply p-4 text-center;
}

.error {
	@apply text-red-600 dark:text-red-400;
}

.blueprints-grid {
	@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4;
}

.empty-state {
	@apply col-span-full text-center p-8 text-gray-500 dark:text-gray-400;
}

.pagination {
	@apply flex items-center justify-center gap-4;
}

.pagination button {
	@apply px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
