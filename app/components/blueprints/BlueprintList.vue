<script setup lang="ts">
import { useQueryFilters } from '~/composables/useQueryFilters';
import type { Blueprint } from '~/models/blueprint';
import type { Facility } from '~/models/facility';
import type { Item } from '~/models/item';
import type { Tag } from '~/models/tag';
import BlueprintCard from './BlueprintCard.vue';
import BlueprintPagination from './BlueprintPagination.vue';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarTrigger, SidebarInset } from '~/components/ui/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Checkbox } from '~/components/ui/checkbox';
import { Combobox, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxEmpty, ComboboxViewport } from '~/components/ui/combobox';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import RegionValleyIcon from '../icons/RegionValleyIcon.vue';
import RegionWulingIcon from '../icons/RegionWulingIcon.vue';
import CloseIcon from '../icons/CloseIcon.vue';
import SearchIcon from '../icons/SearchIcon.vue';
import { ChevronDown } from 'lucide-vue-next';
import MainBanner from '../banners/MainBanner.vue';
import { useSidebar } from '@/components/ui/sidebar'

const props = withDefaults(defineProps<{
	showSidebar?: boolean;
}>(), {
	showSidebar: true,
});

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

// Fetch filter data (only when sidebar is enabled)
const { data: facilitiesData } = props.showSidebar ? await useSanctumFetch<{ data: Facility[] }>('/api/v1/facilities') : { data: ref(null) };
const { data: itemsData } = props.showSidebar ? await useSanctumFetch<{ data: Item[] }>('/api/v1/items') : { data: ref(null) };
const { data: tagsData } = props.showSidebar ? await useSanctumFetch<{ data: Tag[] }>('/api/v1/tags') : { data: ref(null) };

const facilities = computed(() => facilitiesData.value?.data ?? []);
const items = computed(() => itemsData.value?.data ?? []);
const tags = computed(() => tagsData.value?.data ?? []);

// Sort options
const sortOptions = [
	{ value: 'created_at', label: 'Relevancy' },
	{ value: 'created_at', label: 'Created Date' },
	{ value: 'updated_at', label: 'Updated Date' },
	{ value: 'title', label: 'Title' },
	{ value: 'likes_count', label: 'Likes' },
	{ value: 'copies_count', label: 'Copies' },
];

const currentSortLabel = computed(() => {
	const sortField = sort.value.replace(/^-/, '');
	const option = sortOptions.find(opt => opt.value === sortField);
	return option?.label ?? 'Relevancy';
});

// Game version options
const versionOptions = [
	{ value: '', label: 'All' },
	{ value: 'cbt_3', label: 'CBT 3' },
];

// Tier options
const tierOptions = [
	{ value: '', label: 'All' },
	{ value: 'I', label: 'Tier I' },
	{ value: 'II', label: 'Tier II' },
	{ value: 'III', label: 'Tier III' },
	{ value: 'IV', label: 'Tier IV' },
];

// Region options
const regionOptions = [
	{ value: 'valley_iv', label: 'Valley IV', icon: RegionValleyIcon },
	{ value: 'wuling', label: 'Wuling', icon: RegionWulingIcon },
];

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
				const tag = tags.value.find(t => t.id === item);
				filterTags.push({ key, value: tag?.name ?? String(item) });
			}
			return;
		}

		if (key === 'facility' && Array.isArray(value)) {
			for (const item of value) {
				const facility = facilities.value.find(f => f.slug === item);
				filterTags.push({ key, value: facility?.name ?? String(item) });
			}
			return;
		}

		if (key === 'item_input' && Array.isArray(value)) {
			for (const item of value) {
				const factoryItem = items.value.find(i => i.slug === item);
				filterTags.push({ key, value: factoryItem?.name ?? String(item) });
			}
			return;
		}

		if (key === 'item_output' && Array.isArray(value)) {
			for (const item of value) {
				const factoryItem = items.value.find(i => i.slug === item);
				filterTags.push({ key, value: factoryItem?.name ?? String(item) });
			}
			return;
		}
	});

	return filterTags;
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

// Handle tag checkbox toggle
const toggleTagFilter = (tagId: string) => {
	const currentTags = (filters.value['tags.id'] as string[]) || [];
	if (currentTags.includes(tagId)) {
		setFilter('tags.id', currentTags.filter(id => id !== tagId));
	} else {
		setFilter('tags.id', [...currentTags, tagId]);
	}
};

// Handle combobox selections
const handleFacilitySelect = (facilitySlug: string) => {
	const currentFacilities = (filters.value.facility as string[]) || [];
	if (!currentFacilities.includes(facilitySlug)) {
		setFilter('facility', [...currentFacilities, facilitySlug]);
	}
};

const handleItemInputSelect = (itemSlug: string) => {
	const currentItems = (filters.value.item_input as string[]) || [];
	if (!currentItems.includes(itemSlug)) {
		setFilter('item_input', [...currentItems, itemSlug]);
	}
};

const handleItemOutputSelect = (itemSlug: string) => {
	const currentItems = (filters.value.item_output as string[]) || [];
	if (!currentItems.includes(itemSlug)) {
		setFilter('item_output', [...currentItems, itemSlug]);
	}
};

const { open: sidebarOpen, toggleSidebar } = useSidebar()
</script>

<template>
	<div class="flex h-screen w-full">
		<Sidebar class="top-(--header-height) h-[calc(100svh-var(--header-height))]!">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<div class="flex flex-col gap-2 px-2">
							<button
								class="text-left text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
								All
							</button>
							<button
								class="text-left text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
								PAC
							</button>
							<button class="text-left text-sm text-sidebar-foreground underline">
								Sub-PAC
							</button>
						</div>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Filters</SidebarGroupLabel>
					<SidebarGroupContent>
						<!-- Region Filter -->
						<div class="px-2 py-3 space-y-2">
							<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">Region</label>
							<div class="flex gap-2">
								<button v-for="region in regionOptions" :key="region.value"
									@click="setFilter('region', filters.region === region.value ? null : region.value)"
									:class="[
										'flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded border transition-colors',
										filters.region === region.value
											? 'bg-primary border-primary text-primary-foreground'
											: 'bg-sidebar border-sidebar-border hover:bg-sidebar-accent'
									]">
									<component :is="region.icon" class="w-6 h-6" />
									<span class="text-xs font-medium">{{ region.label }}</span>
								</button>
							</div>
						</div>

						<!-- Game Version -->
						<!-- <div class="px-2 py-3 space-y-2">
							<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">Game
								Version</label>
							<Select :model-value="filters.version || ''"
								@update:model-value="setFilter('version', $event || null)">
								<SelectTrigger class="w-full">
									<SelectValue placeholder="All" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem v-for="option in versionOptions" :key="option.value"
										:value="option.value">
										{{ option.label }}
									</SelectItem>
								</SelectContent>
							</Select>
						</div> -->

						<!-- Tier
						<div class="px-2 py-3 space-y-2">
							<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">Tier</label>
							<Select :model-value="filters.tier || ''"
								@update:model-value="setFilter('tier', $event || null)">
								<SelectTrigger class="w-full">
									<SelectValue placeholder="All" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem v-for="option in tierOptions" :key="option.value"
										:value="option.value">
										{{ option.label }}
									</SelectItem>
								</SelectContent>
							</Select>
						</div> -->

						<!-- Categories (Tags) -->
						<div class="px-2 py-3 space-y-2">
							<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">Categories</label>
							<div class="space-y-2 max-h-48 overflow-y-auto">
								<label v-for="tag in tags" :key="tag.id"
									class="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent/50 rounded px-2 py-1.5 transition-colors">
									<Checkbox :checked="(filters['tags.id'] as string[] || []).includes(tag.id)"
										@update:checked="toggleTagFilter(tag.id)" />
									<span class="text-sm text-sidebar-foreground">{{ tag.name }}</span>
								</label>
							</div>
						</div>

						<!-- Facilities Used -->
						<div class="px-2 py-3 space-y-2">
							<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">Facilities
								Used</label>
							<Popover>
								<PopoverTrigger as-child>
									<Button variant="outline" class="w-full justify-between">
										<span class="text-muted-foreground">Search</span>
										<ChevronDown class="size-4 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent class="w-[300px] p-0">
									<Combobox>
										<ComboboxInput placeholder="Search facilities..." />
										<ComboboxList>
											<ComboboxViewport>
												<ComboboxEmpty>No facilities found.</ComboboxEmpty>
												<ComboboxItem v-for="facility in facilities" :key="facility.id"
													:value="facility.slug"
													@select="handleFacilitySelect(facility.slug)">
													{{ facility.name }}
												</ComboboxItem>
											</ComboboxViewport>
										</ComboboxList>
									</Combobox>
								</PopoverContent>
							</Popover>
						</div>

						<!-- Input Products -->
						<div class="px-2 py-3 space-y-2">
							<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">Input
								Products</label>
							<Popover>
								<PopoverTrigger as-child>
									<Button variant="outline" class="w-full justify-between">
										<span class="text-muted-foreground">Search</span>
										<ChevronDown class="size-4 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent class="w-[300px] p-0">
									<Combobox>
										<ComboboxInput placeholder="Search items..." />
										<ComboboxList>
											<ComboboxViewport>
												<ComboboxEmpty>No items found.</ComboboxEmpty>
												<ComboboxItem v-for="item in items" :key="item.id" :value="item.slug"
													@select="handleItemInputSelect(item.slug)">
													{{ item.name }}
												</ComboboxItem>
											</ComboboxViewport>
										</ComboboxList>
									</Combobox>
								</PopoverContent>
							</Popover>
						</div>

						<!-- Output Products -->
						<div class="px-2 py-3 space-y-2">
							<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">Output
								Products</label>
							<Popover>
								<PopoverTrigger as-child>
									<Button variant="outline" class="w-full justify-between">
										<span class="text-muted-foreground">Search</span>
										<ChevronDown class="size-4 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent class="w-[300px] p-0">
									<Combobox>
										<ComboboxInput placeholder="Search items..." />
										<ComboboxList>
											<ComboboxViewport>
												<ComboboxEmpty>No items found.</ComboboxEmpty>
												<ComboboxItem v-for="item in items" :key="item.id" :value="item.slug"
													@select="handleItemOutputSelect(item.slug)">
													{{ item.name }}
												</ComboboxItem>
											</ComboboxViewport>
										</ComboboxList>
									</Combobox>
								</PopoverContent>
							</Popover>
						</div>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>

		<SidebarInset>
			<!-- Main Content -->
			<div class="flex flex-col">
				<!-- Banner Section -->
				<MainBanner />

				<!-- Content Area -->
				<div class="wave-bg bg-cool-gray-10 before:bg-size-[400px]">
					<div class="container mx-auto px-4 py-6">
						<!-- Controls Bar -->
						<div class="flex flex-col gap-4 mb-8">
							<Button variant="outline" size="sm" @click="toggleSidebar"
								class="before:hidden w-fit bg-transparent">
								{{ sidebarOpen ? 'Hide Filters' : 'Show Filters' }}
							</Button>

							<Input placeholder="Search for any tag..." class="w-full bg-white" />

							<!-- Search Bar (placeholder) -->
							<!-- <div class="flex-1 max-w-md">
									
								</div> -->

							<!-- Active Filters -->
							<div class="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
								<div v-if="hasActiveFilters" class="flex items-center gap-2 flex-wrap">
									<button v-for="tag in activeFilterTags" :key="tag.key"
										@click="clearFilter(tag.key, tag.value)"
										class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cool-gray-20 dark:bg-cool-gray-80 text-cool-gray-90 dark:text-cool-gray-10 text-sm hover:bg-cool-gray-30 dark:hover:bg-cool-gray-70 transition-colors">
										<span>{{ tag.value }}</span>
										<CloseIcon class="w-3 h-3" />
									</button>
									<Button variant="ghost" size="sm" @click="clearAllFilters(true)" class="text-sm">
										Clear All
									</Button>
								</div>
								<div v-else></div>
								<span class="text-sm text-muted-foreground whitespace-nowrap">
									{{ pagination?.total ?? 0 }} Blueprints found
								</span>
							</div>

							<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
								<div class="flex items-center gap-2">
									<label class="text-sm text-muted-foreground whitespace-nowrap">Sort by</label>
									<Select :model-value="sort.replace(/^-/, '')"
										@update:model-value="(val) => toggleSort(typeof val === 'string' ? val : 'created_at')">
										<SelectTrigger class="w-[180px]">
											<SelectValue :placeholder="currentSortLabel" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem v-for="option in sortOptions" :key="option.value"
												:value="option.value">
												{{ option.label }}
											</SelectItem>
										</SelectContent>
									</Select>
									<Button class="rounded" variant="ghost" size="icon-sm"
										@click="toggleSort(sort.replace(/^-/, ''))"
										:title="isSortDescending ? 'Sort ascending' : 'Sort descending'">
										{{ isSortDescending ? '↑' : '↓' }}
									</Button>
								</div>
								<BlueprintPagination v-model:current-page="currentPage" v-model:per-page="perPage"
									:pagination="pagination" :show-per-page-selector="true" />
							</div>

							<!-- Result Count and Sort -->
							<!-- <div class="flex items-center gap-4">
								<span class="text-sm text-muted-foreground whitespace-nowrap">
									{{ pagination?.total ?? 0 }} Blueprints found
								</span>
								<div class="flex items-center gap-2">
									<Select :model-value="sort.replace(/^-/, '')"
										@update:model-value="(val) => toggleSort(typeof val === 'string' ? val : 'created_at')">
										<SelectTrigger class="w-[180px]">
											<SelectValue :placeholder="currentSortLabel" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem v-for="option in sortOptions" :key="option.value"
												:value="option.value">
												{{ option.label }}
											</SelectItem>
										</SelectContent>
									</Select>
									<Button variant="ghost" size="icon" @click="toggleSort(sort.replace(/^-/, ''))"
										:title="isSortDescending ? 'Sort ascending' : 'Sort descending'">
										{{ isSortDescending ? '↑' : '↓' }}
									</Button>
								</div>
							</div> -->
						</div>

						<!-- Loading State -->
						<div v-if="status === 'pending'" class="flex items-center justify-center py-12">
							<p class="text-muted-foreground">Loading blueprints...</p>
						</div>

						<!-- Error State -->
						<div v-if="status === 'error'" class="flex flex-col items-center justify-center py-12">
							<p class="text-destructive mb-2">Error loading blueprints:</p>
							<pre class="text-sm text-muted-foreground">{{ error }}</pre>
						</div>

						<!-- Blueprints Grid -->
						<div v-if="status === 'success'"
							class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
							<BlueprintCard v-for="blueprint in blueprints" :key="blueprint.id" :blueprint="blueprint"
								@filter-tag="handleTagFilter" @filter-region="handleRegionFilter"
								@filter-author="handleAuthorFilter" />

							<div v-if="blueprints.length === 0"
								class="col-span-full flex items-center justify-center py-12">
								<p class="text-muted-foreground">No blueprints found.</p>
							</div>
						</div>

						<div class="flex justify-end">
							<!-- Pagination -->
							<BlueprintPagination v-model:current-page="currentPage" v-model:per-page="perPage"
								:pagination="pagination" :show-per-page-selector="false" />
						</div>
					</div>
				</div>
			</div>
		</SidebarInset>
	</div>
</template>
