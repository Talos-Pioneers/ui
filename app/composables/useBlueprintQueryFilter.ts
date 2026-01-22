import { regionOptions, versionOptions } from '~/constants/blueprintOptions'
import type { Blueprint, PaginationMeta } from '~/models/blueprint'
import type { Facility } from '~/models/facility'
import type { Item } from '~/models/item'
import type { Tag } from '~/models/tag'
import type { FilterConfig, SortConfig } from './useQueryFilters'

type BlueprintListResponse = {
	data: Blueprint[]
	links: {
		first: string | null
		last: string | null
		prev: string | null
		next: string | null
	}
	meta: PaginationMeta
}

type UseBlueprintQueryFilterOptions = {
	filters?: Record<string, FilterConfig>
	sort?: SortConfig
}

export const useBlueprintQueryFilter = async (
	endpoint: string = '/api/v1/blueprints',
	options?: UseBlueprintQueryFilterOptions
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
			region: { type: 'string' },
			server_region: { type: 'string' },
			version: { type: 'string' },
			is_anonymous: { type: 'boolean' },
			author_id: { type: 'string' },
			facility: { type: 'array' },
			item_input: { type: 'array' },
			item_output: { type: 'array' },
			likes_count: { type: 'number' },
			copies_count: { type: 'number' },
			'tags.id': { type: 'array' },
			width: { type: 'number' },
			height: { type: 'number' },
			hide_partner_url: { type: 'boolean' },
		},
		sort: options?.sort ?? {
			default: '-created_at',
			fields: [
				'created_at',
				'updated_at',
				'title',
				'likes_count',
				'copies_count',
			],
		},
	})

	const route = useRoute()
	const { query } = route

	// Pagination state - initialize from route query
	const currentPage = ref<number>(Number(query.page) || 1)
	const perPage = ref<number>(Number(query.per_page) || 25)

	// // Build active query with filters, sort, and pagination
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

	// // Sync pagination state when route query changes (e.g., browser back/forward)
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
		data: blueprintsData,
		status: blueprintsStatus,
		error: blueprintsError,
		refresh: blueprintsRefresh,
	} = await useLazySanctumFetch<BlueprintListResponse>(
		endpoint,
		() => ({
			method: 'get',
			query: activeQuery.value,
		}),
		{
			watch: [activeQuery],
		}
	)

	const blueprints = computed(() => blueprintsData.value?.data ?? [])
	const pagination = computed(() => blueprintsData.value?.meta ?? null)

	// // Pagination Logic
	// // Sync currentPage with API response (in case API adjusts the page)
	watch(pagination, (newPagination) => {
		if (newPagination && newPagination.current_page !== currentPage.value) {
			currentPage.value = newPagination.current_page
		}
	})

	// // Reset to page 1 when filters or sort change
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

	// // Update route query when pagination changes
	watch([currentPage, perPage], () => {
		useRouter().replace({
			query: activeQuery.value,
		})
	})

	return {
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
	}
}
