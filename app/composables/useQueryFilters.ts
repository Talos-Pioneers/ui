// import { toRaw, toValue } from "vue";

export type FilterType = "string" | "number" | "boolean" | "array";

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

export function useQueryFilters<T extends QueryFiltersConfig>(config: T) {
	const filters = ref<Record<string, any>>({});
	const sort = ref<string>(config.sort.default);
	const sortDirection = ref<"asc" | "desc">("asc");

	for (const [key, filterConfig] of Object.entries(config.filters)) {
		if (filterConfig.default !== undefined) {
			filters.value[key] = filterConfig.default;
		}
	}

	// Filter Utils
	const setFilter = (key: string, value: any) => {
		filters.value[key] = value;
	};

	const clearFilter = (key: string) => {
		filters.value[key] = null;
	};

	const clearAllFilters = (forceEmpty = false) => {
		if (forceEmpty) {
			filters.value = {};
		} else {
			for (const [key, filterConfig] of Object.entries(config.filters)) {
				filters.value[key] =
					filterConfig.default ?? (filterConfig.type === "array" ? [] : null);
			}
		}
	};

	const hasActiveFilters = computed(() => {
		return Object.entries(filters.value).some(([key, value]) => {
			return (
				value !== null &&
				value !== "" &&
				(Array.isArray(value) ? value.length > 0 : true)
			);
		});
	});

	// Sort Utils
	const setSort = (field: string, descending = false) => {
		sort.value = field;
		sortDirection.value = descending ? "desc" : "asc";
	};

	const toggleSort = (field: string) => {
		setSort(field, sortDirection.value === "desc" ? true : false);
	};

	const resetSort = () => {
		setSort(config.sort.default, false);
	};

	const isSortDescending = computed(() => {
		return sortDirection.value === "desc";
	});

	const reset = (forceEmpty = false) => {
		clearAllFilters(forceEmpty);
		resetSort();
	};

	const computedQuery = computed(() => {
		const query = {} as Record<string, string>;
		for (const [key, value] of Object.entries(filters.value)) {
			const filterConfig = config.filters[key];
			if (
				filterConfig &&
				value !== null &&
				value !== "" &&
				(Array.isArray(value) ? value.length > 0 : true)
			) {
				if (filterConfig.type === "array") {
					query[`filter[${key}]`] = value.join(",");
					return query;
				}
				if (filterConfig.type === "boolean") {
					query[`filter[${key}]`] = value ? "1" : "0";
					return query;
				}
				query[`filter[${key}]`] = String(value);
			}
		}

		query.sort = sortDirection.value === "desc" ? `-${sort.value}` : sort.value;

		return query;
	});
	// update the nuxt router query params when the query changes
	watch(
		filters,
		() => {
			useRouter().replace({
				query: computedQuery.value,
			});
		},
		{ deep: true }
	);
	watch(sort, () => {
		useRouter().replace({
			query: computedQuery.value,
		});
	});
	const buildFiltersFromQuery = (query: Record<string, string>) => {
		for (const [key, value] of Object.entries(query)) {
			if (key.startsWith("filter[")) {
				const filterKey = key.replace("filter[", "").replace("]", "");
				const filterConfig = config.filters[filterKey];
				if (filterConfig) {
					if (filterConfig.type === "array") {
						filters.value[filterKey] = value.split(",");
					} else if (filterConfig.type === "boolean") {
						filters.value[filterKey] = value === "1";
					} else {
						filters.value[filterKey] = value;
					}
				}
			}
		}
	};
	const buildSortFromQuery = (query: Record<string, string>) => {
		if (query.sort) {
			setSort(query.sort.replace("-", ""), query.sort.startsWith("-"));
		}
	};

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
	};
}

// /**
//  * Composable for managing filters and sorting
//  * Works with Laravel QueryBuilder format: filter[key]=value and sort=field
//  */
// export function useQueryFilters<T extends QueryFiltersConfig>(config: T) {
// 	// Initialize filter refs from defaults
// 	const filters = reactive<Record<string, any>>({});
// 	const sort = ref<string>(config.sort.default);

// 	// Initialize filters from config defaults
// 	for (const [key, filterConfig] of Object.entries(config.filters)) {
// 		if (filterConfig.default !== undefined) {
// 			filters[key] = filterConfig.default;
// 		} else {
// 			filters[key] = filterConfig.type === "array" ? [] : null;
// 		}
// 	}

// 	/**
// 	 * Set a filter value
// 	 */
// 	const setFilter = (key: string, value: any) => {
// 		if (key in filters) {
// 			filters[key] = value;
// 		}
// 	};

// 	/**
// 	 * Clear a specific filter
// 	 */
// 	const clearFilter = (key: string) => {
// 		if (key in filters) {
// 			const filterConfig = config.filters[key];
// 			filters[key] =
// 				filterConfig?.default ?? (filterConfig?.type === "array" ? [] : null);
// 		}
// 	};

// 	/**
// 	 * Clear all filters
// 	 */
// 	const clearAllFilters = () => {
// 		for (const [key, filterConfig] of Object.entries(config.filters)) {
// 			filters[key] =
// 				filterConfig?.default ?? (filterConfig?.type === "array" ? [] : null);
// 		}
// 	};

// 	/**
// 	 * Set sort field and direction
// 	 */
// 	const setSort = (field: string, descending = false) => {
// 		sort.value = descending ? `-${field}` : field;
// 	};

// 	/**
// 	 * Toggle sort direction for current field
// 	 */
// 	const toggleSort = (field: string) => {
// 		const currentField = sort.value.replace(/^-/, "");
// 		if (currentField === field) {
// 			// Toggle direction (if descending, make ascending, and vice versa)
// 			setSort(field, !sort.value.startsWith("-"));
// 		} else {
// 			// Set new field ascending
// 			setSort(field, false);
// 		}
// 	};

// 	/**
// 	 * Reset to defaults
// 	 */
// 	const reset = () => {
// 		clearAllFilters();
// 		sort.value = config.sort.default;
// 	};

// 	/**
// 	 * Build query parameters for API requests
// 	 * Returns object compatible with ofetch/useSanctumFetch query option
// 	 */
// 	const buildQuery = (): Record<string, string> => {
// 		const query: Record<string, string> = {};

// 		// Get plain values from reactive filters
// 		const plainFilters = toRaw(filters);

// 		// Add filters
// 		for (const [key, value] of Object.entries(plainFilters)) {
// 			if (
// 				value !== null &&
// 				value !== undefined &&
// 				value !== "" &&
// 				(Array.isArray(value) ? value.length > 0 : true)
// 			) {
// 				const filterConfig = config.filters[key];
// 				if (filterConfig) {
// 					if (filterConfig.type === "array") {
// 						if (Array.isArray(value) && value.length > 0) {
// 							query[`filter[${key}]`] = value.join(",");
// 						}
// 					} else if (filterConfig.type === "boolean") {
// 						query[`filter[${key}]`] = value ? "1" : "0";
// 					} else {
// 						query[`filter[${key}]`] = String(value);
// 					}
// 				}
// 			}
// 		}

// 		// Add sort (get plain value from ref)
// 		const sortValue = toValue(sort);
// 		if (sortValue) {
// 			query.sort = sortValue;
// 		}

// 		return query;
// 	};

// 	/**
// 	 * Get current sort field (without direction prefix)
// 	 */
// 	const getSortField = computed(() => {
// 		return sort.value.replace(/^-/, "");
// 	});

// 	/**
// 	 * Check if sort is descending
// 	 */
// 	const isSortDescending = computed(() => {
// 		return sort.value.startsWith("-");
// 	});

// 	/**
// 	 * Check if any filters are active
// 	 */
// 	const hasActiveFilters = computed(() => {
// 		return Object.entries(filters).some(([key, value]) => {
// 			const filterConfig = config.filters[key];
// 			const defaultValue =
// 				filterConfig?.default ?? (filterConfig?.type === "array" ? [] : null);
// 			return (
// 				value !== defaultValue &&
// 				value !== null &&
// 				value !== "" &&
// 				(Array.isArray(value) ? value.length > 0 : true)
// 			);
// 		});
// 	});

// 	return {
// 		filters: readonly(filters),
// 		sort: readonly(sort),
// 		setFilter,
// 		clearFilter,
// 		clearAllFilters,
// 		setSort,
// 		toggleSort,
// 		reset,
// 		buildQuery,
// 		getSortField,
// 		isSortDescending,
// 		hasActiveFilters,
// 	};
// }
