export type FilterType = 'string' | 'number' | 'boolean' | 'array';

export type FilterConfig = {
	type: FilterType;
	default?: string | number | boolean | string[];
};

export type SortConfig = {
	default: string;
	fields: string[];
};

export type QueryFiltersConfig = {
	filters: Record<string, FilterConfig>;
	sort: SortConfig;
};

/**
 * Composable for managing URL-synchronized filters and sorting
 * Works with Laravel QueryBuilder format: filter[key]=value and sort=field
 */
export function useQueryFilters<T extends QueryFiltersConfig>(config: T) {
	const route = useRoute();
	const router = useRouter();

	// Initialize filter refs from URL or defaults
	const filters = reactive<Record<string, any>>({});
	const sort = ref<string>(config.sort.default);

	// Initialize filters from config
	for (const [key, filterConfig] of Object.entries(config.filters)) {
		const urlValue = route.query[`filter[${key}]`] as string | undefined;

		if (urlValue !== undefined) {
			if (filterConfig.type === 'array') {
				filters[key] = urlValue.split(',').filter(Boolean);
			} else if (filterConfig.type === 'boolean') {
				filters[key] = urlValue === '1' || urlValue === 'true';
			} else if (filterConfig.type === 'number') {
				filters[key] = Number(urlValue);
			} else {
				filters[key] = urlValue;
			}
		} else if (filterConfig.default !== undefined) {
			filters[key] = filterConfig.default;
		} else {
			filters[key] = filterConfig.type === 'array' ? [] : null;
		}
	}

	// Initialize sort from URL or default
	const urlSort = route.query.sort as string | undefined;
	if (urlSort !== undefined) {
		sort.value = urlSort;
	}

	// Watch for route query changes to keep filters in sync with URL
	watch(() => route.query, (newQuery) => {
		// Update filters from URL
		for (const [key, filterConfig] of Object.entries(config.filters)) {
			const urlValue = newQuery[`filter[${key}]`] as string | undefined;

			if (urlValue !== undefined) {
				if (filterConfig.type === 'array') {
					filters[key] = urlValue.split(',').filter(Boolean);
				} else if (filterConfig.type === 'boolean') {
					filters[key] = urlValue === '1' || urlValue === 'true';
				} else if (filterConfig.type === 'number') {
					filters[key] = Number(urlValue);
				} else {
					filters[key] = urlValue;
				}
			} else {
				// Reset to default if not in URL
				filters[key] = filterConfig?.default ?? (filterConfig?.type === 'array' ? [] : null);
			}
		}

		// Update sort from URL
		const newSort = newQuery.sort as string | undefined;
		if (newSort !== undefined) {
			sort.value = newSort;
		} else {
			sort.value = config.sort.default;
		}
	}, { deep: true });

	/**
	 * Update URL query parameters
	 */
	const updateUrl = () => {
		const query: Record<string, any> = { ...route.query };

		// Remove all existing filter params
		Object.keys(query).forEach(key => {
			if (key.startsWith('filter[')) {
				delete query[key];
			}
		});

		// Add filters to query
		for (const [key, value] of Object.entries(filters)) {
			if (value !== null && value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
				const filterConfig = config.filters[key];
				if (filterConfig) {
					if (filterConfig.type === 'array') {
						if (Array.isArray(value) && value.length > 0) {
							query[`filter[${key}]`] = value.join(',');
						}
					} else if (filterConfig.type === 'boolean') {
						query[`filter[${key}]`] = value ? '1' : '0';
					} else {
						query[`filter[${key}]`] = String(value);
					}
				}
			}
		}

		// Add sort to query (only if not default)
		if (sort.value !== config.sort.default) {
			query.sort = sort.value;
		} else {
			// Remove sort if it's the default
			delete query.sort;
		}

		// Update URL without adding to history
		router.replace({
			query,
		});
	};

	/**
	 * Set a filter value
	 */
	const setFilter = (key: string, value: any) => {
		if (key in filters) {
			filters[key] = value;
			updateUrl();
		}
	};

	/**
	 * Clear a specific filter
	 */
	const clearFilter = (key: string) => {
		if (key in filters) {
			const filterConfig = config.filters[key];
			filters[key] = filterConfig?.default ?? (filterConfig?.type === 'array' ? [] : null);
			updateUrl();
		}
	};

	/**
	 * Clear all filters
	 */
	const clearAllFilters = () => {
		for (const [key, filterConfig] of Object.entries(config.filters)) {
			filters[key] = filterConfig?.default ?? (filterConfig?.type === 'array' ? [] : null);
		}
		updateUrl();
	};

	/**
	 * Set sort field and direction
	 */
	const setSort = (field: string, descending = false) => {
		sort.value = descending ? `-${field}` : field;
		updateUrl();
	};

	/**
	 * Toggle sort direction for current field
	 */
	const toggleSort = (field: string) => {
		const currentField = sort.value.replace(/^-/, '');
		if (currentField === field) {
			// Toggle direction (if descending, make ascending, and vice versa)
			setSort(field, !sort.value.startsWith('-'));
		} else {
			// Set new field ascending
			setSort(field, false);
		}
	};

	/**
	 * Reset to defaults
	 */
	const reset = () => {
		clearAllFilters();
		sort.value = config.sort.default;
		updateUrl();
	};

	/**
	 * Build query parameters for API requests
	 * Returns object compatible with ofetch/useSanctumFetch query option
	 */
	const buildQuery = (): Record<string, string> => {
		const query: Record<string, string> = {};

		// Add filters
		for (const [key, value] of Object.entries(filters)) {
			if (value !== null && value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
				const filterConfig = config.filters[key];
				if (filterConfig) {
					if (filterConfig.type === 'array') {
						if (Array.isArray(value) && value.length > 0) {
							query[`filter[${key}]`] = value.join(',');
						}
					} else if (filterConfig.type === 'boolean') {
						query[`filter[${key}]`] = value ? '1' : '0';
					} else {
						query[`filter[${key}]`] = String(value);
					}
				}
			}
		}

		// Add sort
		if (sort.value) {
			query.sort = sort.value;
		}

		return query;
	};

	/**
	 * Get current sort field (without direction prefix)
	 */
	const getSortField = computed(() => {
		return sort.value.replace(/^-/, '');
	});

	/**
	 * Check if sort is descending
	 */
	const isSortDescending = computed(() => {
		return sort.value.startsWith('-');
	});

	/**
	 * Check if any filters are active
	 */
	const hasActiveFilters = computed(() => {
		return Object.entries(filters).some(([key, value]) => {
			const filterConfig = config.filters[key];
			const defaultValue = filterConfig?.default ?? (filterConfig?.type === 'array' ? [] : null);
			return value !== defaultValue && value !== null && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
		});
	});

	return {
		filters: readonly(filters),
		sort: readonly(sort),
		setFilter,
		clearFilter,
		clearAllFilters,
		setSort,
		toggleSort,
		reset,
		buildQuery,
		getSortField,
		isSortDescending,
		hasActiveFilters,
	};
}

