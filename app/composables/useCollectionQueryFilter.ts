import type { BlueprintCollection } from '~/models/blueprintCollection'
import type { PaginationMeta } from '~/models/blueprint'
import type { FilterConfig, SortConfig } from './useQueryFilters'

type CollectionListResponse = {
	data: BlueprintCollection[]
	links: {
		first: string | null
		last: string | null
		prev: string | null
		next: string | null
	}
	meta: PaginationMeta
}

type UseCollectionQueryFilterOptions = {
	filters?: Record<string, FilterConfig>
	sort?: SortConfig
}

export const useCollectionQueryFilter = async (
	endpoint: string = '/api/v1/collections',
	options?: UseCollectionQueryFilterOptions
) => {
	const {
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
	} = useQueryFilters({
		filters: options?.filters ?? {
			author_id: { type: 'string' },
			status: { type: 'string' },
			is_anonymous: { type: 'boolean' },
		},
		sort: options?.sort ?? {
			default: '-created_at',
			fields: ['created_at', 'updated_at', 'title'],
		},
	})

	const route = useRoute()
	const { query } = route

	// Pagination state - initialize from route query
	const currentPage = ref<number>(Number(query.page) || 1)
	const perPage = ref<number>(Number(query.per_page) || 25)

	// Build active query with filters, sort, and pagination
	const activeQuery = computed(() => {
		const queryParams = { ...computedQuery.value }
		if (currentPage.value > 1) {
			queryParams.page = String(currentPage.value)
		}

		if (perPage.value !== 25) {
			queryParams.per_page = String(perPage.value)
		}

		return queryParams
	})

	// Sync pagination state when route query changes (e.g., browser back/forward)
	watch(
		() => route.query,
		(newQuery) => {
			const newPage = Number(newQuery.page) || 1
			const newPerPage = Number(newQuery.per_page) || 25
			if (newPage !== currentPage.value) {
				currentPage.value = newPage
			}
			if (newPerPage !== perPage.value) {
				perPage.value = newPerPage
			}
		}
	)

	const {
		data: collectionsData,
		status: collectionsStatus,
		error: collectionsError,
		refresh: collectionsRefresh,
	} = await useLazySanctumFetch<CollectionListResponse>(
		endpoint,
		() => ({
			method: 'get',
			query: activeQuery.value,
		}),
		{
			watch: [activeQuery],
		}
	)

	const collections = computed(() => collectionsData.value?.data ?? [])
	const pagination = computed(() => collectionsData.value?.meta ?? null)

	// Pagination Logic
	// Sync currentPage with API response (in case API adjusts the page)
	watch(pagination, (newPagination) => {
		if (newPagination && newPagination.current_page !== currentPage.value) {
			currentPage.value = newPagination.current_page
		}
	})

	// Reset to page 1 when filters or sort change
	watch(
		filters,
		() => {
			if (currentPage.value > 1) {
				currentPage.value = 1
			}
		},
		{ deep: true }
	)
	watch(sort, () => {
		if (currentPage.value > 1) {
			currentPage.value = 1
		}
	})

	// Update route query when pagination changes
	watch([currentPage, perPage], () => {
		useRouter().replace({
			query: activeQuery.value,
		})
	})

	return {
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
		toggleSort,
		isSortDescending,
		computedQuery,
	}
}
