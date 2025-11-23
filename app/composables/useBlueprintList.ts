import type { Blueprint, PaginationMeta } from "~/models/blueprint";
import type { Facility } from "~/models/facility";
import type { Item } from "~/models/item";
import type { Tag } from "~/models/tag";
import type { QueryFiltersConfig } from "./useQueryFilters";
import { useQueryFilters } from "./useQueryFilters";

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

export async function useBlueprintList(
	endpoint: string,
	filterConfig: QueryFiltersConfig["filters"],
	sortConfig: QueryFiltersConfig["sort"]
) {
	// Configure filters and sorting
	const {
		filters,
		sort,
		setFilter,
		clearFilter,
		clearAllFilters,
		hasActiveFilters,
		setSort,
		isSortDescending,
		computedQuery,
	} = useQueryFilters({
		filters: filterConfig,
		sort: sortConfig,
	});

	const route = useRoute();
	const { query } = route;

	// Pagination state - initialize from route query
	const currentPage = ref<number>(Number(query.page) || 1);
	const perPage = ref<number>(Number(query.per_page) || 25);

	// Sync pagination state when route query changes (e.g., browser back/forward)
	watch(
		() => route.query,
		(newQuery) => {
			const newPage = Number(newQuery.page) || 1;
			const newPerPage = Number(newQuery.per_page) || 25;
			if (newPage !== currentPage.value) {
				currentPage.value = newPage;
			}
			if (newPerPage !== perPage.value) {
				perPage.value = newPerPage;
			}
		}
	);

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
	const { data, status, error, refresh } =
		await useSanctumFetch<BlueprintListResponse>(
			endpoint,
			() => ({
				method: "get",
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
	watch(
		filters,
		() => {
			if (currentPage.value > 1) {
				currentPage.value = 1;
			}
		},
		{ deep: true }
	);

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
	const { data: facilitiesData } = await useSanctumFetch<{ data: Facility[] }>(
		"/api/v1/facilities"
	);
	const { data: itemsData } = await useSanctumFetch<{ data: Item[] }>(
		"/api/v1/items"
	);
	const { data: tagsData } = await useSanctumFetch<{ data: Tag[] }>(
		"/api/v1/tags"
	);

	const facilities = computed(() => facilitiesData.value?.data ?? []);
	const items = computed(() => itemsData.value?.data ?? []);
	const tags = computed(() => tagsData.value?.data ?? []);

	// Event handlers
	const handleFilterUpdate = (key: string, value: any) => {
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
		const currentTags = (filters.value["tags.id"] as string[]) || [];
		if (!currentTags.includes(tagId)) {
			setFilter("tags.id", [...currentTags, tagId]);
		}
	};

	const handleRegionFilter = (region: string) => {
		setFilter("region", region);
	};

	const handleAuthorFilter = (authorId: string) => {
		setFilter("author_id", authorId);
	};

	const handlePageUpdate = (page: number) => {
		currentPage.value = page;
	};

	const handlePerPageUpdate = (perPageValue: number) => {
		perPage.value = perPageValue;
	};

	return {
		// Data
		blueprints,
		pagination,
		facilities,
		items,
		tags,

		// State
		filters,
		sort,
		isSortDescending,
		hasActiveFilters,
		currentPage,
		perPage,
		status: computed(() => status.value),
		error: computed(() => error.value),

		// Actions
		refresh,

		// Handlers
		handleFilterUpdate,
		handleSortUpdate,
		handleClearFilter,
		handleClearAllFilters,
		handleTagFilter,
		handleRegionFilter,
		handleAuthorFilter,
		handlePageUpdate,
		handlePerPageUpdate,
	};
}
