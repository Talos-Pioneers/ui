// import { toRaw, toValue } from "vue";

export type FilterType = 'string' | 'number' | 'boolean' | 'array'

export type FilterConfig = {
	type: FilterType
	default?: string | number | boolean | string[]
}

export type SortConfig = {
	default: string
	fields: string[]
}

export type QueryFiltersConfig = {
	filters: Record<string, FilterConfig>
	sort: SortConfig
}

export function useQueryFilters<T extends QueryFiltersConfig>(config: T) {
	const router = useRouter()
	const route = useRoute()

	const filters = ref<Record<string, any>>({})
	const sort = ref<string>(config.sort.default.replace('-', ''))
	const sortDirection = ref<'asc' | 'desc'>(
		config.sort.default.startsWith('-') ? 'desc' : 'asc'
	)

	for (const [key, filterConfig] of Object.entries(config.filters)) {
		if (filterConfig.default !== undefined) {
			filters.value[key] = filterConfig.default
		}
	}

	// Filter Utils
	const setFilter = (key: string, value: any) => {
		filters.value[key] = value
	}

	const clearFilter = (key: string, value?: any) => {
		if (value) {
			filters.value[key] = filters.value[key].filter(
				(item: any) => item != value
			)
		} else {
			filters.value[key] = null
		}
	}

	const clearAllFilters = (forceEmpty = false) => {
		if (forceEmpty) {
			filters.value = {}
		} else {
			for (const [key, filterConfig] of Object.entries(config.filters)) {
				filters.value[key] =
					filterConfig.default ??
					(filterConfig.type === 'array' ? [] : null)
			}
		}
	}

	const hasActiveFilters = computed(() => {
		return Object.entries(filters.value).some(([key, value]) => {
			return (
				value !== null &&
				value !== '' &&
				(Array.isArray(value) ? value.length > 0 : true)
			)
		})
	})

	// Sort Utils
	const setSort = (field: string, descending = false) => {
		sort.value = field
		sortDirection.value = descending ? 'desc' : 'asc'
	}

	const toggleSort = (field: string) => {
		setSort(field, sortDirection.value !== 'desc')
	}

	const resetSort = () => {
		setSort(config.sort.default, false)
	}

	const isSortDescending = computed(() => {
		return sortDirection.value === 'desc'
	})

	const reset = (forceEmpty = false) => {
		clearAllFilters(forceEmpty)
		resetSort()
	}

	const computedQuery = computed(() => {
		const query = {} as Record<string, string>
		for (const [key, value] of Object.entries(filters.value)) {
			const filterConfig = config.filters[key]
			if (
				filterConfig &&
				value !== null &&
				value !== '' &&
				(Array.isArray(value) ? value.length > 0 : true)
			) {
				if (filterConfig.type === 'array') {
					query[`filter[${key}]`] = value.join(',')
				} else if (filterConfig.type === 'boolean') {
					query[`filter[${key}]`] = value ? '1' : '0'
				} else {
					query[`filter[${key}]`] = String(value)
				}
			}
		}

		query.sort =
			sortDirection.value === 'desc' ? `-${sort.value}` : sort.value

		return query
	})
	// update the nuxt router query params when the query changes
	watch(
		filters,
		() => {
			router.replace({
				query: computedQuery.value,
			})
		},
		{ deep: true }
	)
	watch(sort, () => {
		router.replace({
			query: computedQuery.value,
		})
	})
	watch(sortDirection, () => {
		router.replace({
			query: computedQuery.value,
		})
	})

	const buildFiltersFromQuery = (query: Record<string, string>) => {
		for (const [key, value] of Object.entries(query)) {
			if (key.startsWith('filter[')) {
				const filterKey = key.replace('filter[', '').replace(']', '')
				const filterConfig = config.filters[filterKey]
				if (filterConfig) {
					if (filterConfig.type === 'array') {
						filters.value[filterKey] = value.split(',')
					} else if (filterConfig.type === 'boolean') {
						filters.value[filterKey] = value === '1'
					} else {
						filters.value[filterKey] = value
					}
				}
			}
		}
	}
	const buildSortFromQuery = (query: Record<string, string>) => {
		if (query.sort) {
			setSort(query.sort.replace('-', ''), query.sort.startsWith('-'))
		}
	}

	buildFiltersFromQuery(route.query as Record<string, string>)
	buildSortFromQuery(route.query as Record<string, string>)

	return {
		filters,
		setFilter,
		clearFilter,
		clearAllFilters,
		hasActiveFilters,

		sort,
		setSort,
		toggleSort,
		resetSort,
		isSortDescending,

		reset,

		computedQuery,
		buildFiltersFromQuery,
		buildSortFromQuery,
	}
}
