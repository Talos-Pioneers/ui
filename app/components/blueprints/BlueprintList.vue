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

// Handle filter events from BlueprintCard
const handleTagFilter = (tagId: string) => {
	const currentTags = (queryFilters.filters['tags.id'] as string[]) || [];
	if (!currentTags.includes(tagId)) {
		queryFilters.setFilter('tags.id', [...currentTags, tagId]);
	}
};

const handleRegionFilter = (region: string) => {
	queryFilters.setFilter('region', region);
};

const handleAuthorFilter = (authorId: string) => {
	queryFilters.setFilter('author_id', Number(authorId));
};
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
			<BlueprintCard v-for="blueprint in blueprints" :key="blueprint.id" :blueprint="blueprint"
				@filter-tag="handleTagFilter" @filter-region="handleRegionFilter" @filter-author="handleAuthorFilter" />

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
