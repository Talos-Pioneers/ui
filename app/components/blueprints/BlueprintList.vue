<script setup lang="ts">
import type { Blueprint, PaginationMeta } from '~/models/blueprint';
import type { Facility } from '~/models/facility';
import type { Item } from '~/models/item';
import type { Tag } from '~/models/tag';
import { regionOptions, versionOptions, serverRegionOptions } from '~/constants/blueprintOptions';
import BlueprintCard from './BlueprintCard.vue';
import BlueprintPagination from './BlueprintPagination.vue';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarInset } from '~/components/ui/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Checkbox } from '~/components/ui/checkbox';
import { Combobox } from '~/components/ui/combobox';
import { SearchableTagsInput } from '~/components/ui/tags-input';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Button } from '~/components/ui/button';
import CloseIcon from '../icons/CloseIcon.vue';
import { ChevronDown } from 'lucide-vue-next';
import { useSidebar } from '@/components/ui/sidebar';
import type { NuxtError } from '#app';
import { CheckboxGroupRoot } from 'reka-ui';

const { t } = useI18n();

const props = withDefaults(defineProps<{
	blueprints: Blueprint[];
	pagination: PaginationMeta | null;
	facilities: Facility[];
	items: Item[];
	tags: Tag[];
	filters: Record<string, any>;
	sort: string;
	isSortDescending: boolean;
	hasActiveFilters: boolean;
	activeFilterTags: Array<{ filterKey: string; label: string; value: any }>;
	currentPage: number;
	perPage: number;
	showSidebar?: boolean;
	loading?: boolean;
	error?: NuxtError | string | null;
	sortOptions?: Array<{ value: string; label: string }>;
}>(), {
	showSidebar: true,
	loading: false,
	error: null,
	sortOptions: undefined,
});

const emit = defineEmits<{
	'update:filter': [key: string, value: any];
	'update:sort': [field: string, descending: boolean];
	'update:current-page': [page: number];
	'update:per-page': [perPage: number];
	'clear-filter': [key: string, value?: any];
	'clear-all-filters': [];
}>();

// Sort options
const defaultSortOptions = [
	{ value: 'created_at', label: t('components.blueprints.list.sort.createdAt') },
	{ value: 'updated_at', label: t('components.blueprints.list.sort.updatedAt') },
	{ value: 'title', label: t('components.blueprints.list.sort.title') },
	{ value: 'likes_count', label: t('components.blueprints.list.sort.likes') },
	{ value: 'copies_count', label: t('components.blueprints.list.sort.copies') },
];

const sortOptions = computed(() => props.sortOptions ?? defaultSortOptions);

const currentSortLabel = computed(() => {
	const sortField = props.sort.replace(/^-/, '');
	const option = sortOptions.value.find(opt => opt.value === sortField);
	return option?.label ?? t('components.blueprints.list.sort.relevancy');
});
const handleSortChange = (val: any) => {
	emit('update:sort', val, props.isSortDescending);
}
const handleSortToggle = () => {
	const field = props.sort.replace(/^-/, '');
	emit('update:sort', field, !props.isSortDescending);
};

// Handle filter events from BlueprintCard
const handleTagFilter = (tagId: string) => {
	emit('update:filter', 'tags.id', [...(props.filters['tags.id'] as string[] || []), tagId]);
};
const handleClearTag = (filterKey: string, value: any) => {
	if (filterKey === 'tags.id' || filterKey === 'item_input' || filterKey === 'item_output') {
		emit('clear-filter', filterKey, value);
	} else {
		emit('clear-filter', filterKey);
	}
};
const handleRegionFilter = (region: string) => {
	emit('update:filter', 'region', region);
};
const handleAuthorFilter = (authorId: string) => {
	emit('update:filter', 'author_id', authorId);
};

// // Group tags by type
const groupedTags = computed(() => {
	const groupKeys = ['blueprint_tags', 'blueprint_tier', 'blueprint_type'] as const;
	const groups: Record<typeof groupKeys[number], Tag[]> = {
		blueprint_tags: [],
		blueprint_tier: [],
		blueprint_type: [],
	};

	for (const tag of props.tags) {
		if (groupKeys.includes(tag.type as typeof groupKeys[number])) {
			groups[tag.type as keyof typeof groups].push(tag);
		}
	}

	return groups;
});

const handleRegionClick = (regionValue: string) => {
	const newValue = props.filters.region === regionValue ? null : regionValue;
	emit('update:filter', 'region', newValue);
};

const handleServerRegionChange = (serverRegionValue: string) => {
	const newValue = props.filters.server_region === serverRegionValue ? null : serverRegionValue;
	emit('update:filter', 'server_region', newValue);
};

const currentPageModel = computed({
	get: () => props.currentPage,
	set: (value: number) => emit('update:current-page', value),
});

const perPageModel = computed({
	get: () => props.perPage,
	set: (value: number) => emit('update:per-page', value),
});

const { open: sidebarOpen, toggleSidebar } = useSidebar();

// Unified filter options - combines all filterable items
interface UnifiedFilterOption {
	value: string; // Prefixed identifier like "region:valley_iv", "tag:123", etc.
	label: string;
	icon?: string | null;
	filterKey: string; // The filter key to update: 'region', 'tags.id', 'facility', 'item_input', 'item_output'
	originalValue: string; // The actual value to use in the filter
}

const unifiedFilterOptions = computed<UnifiedFilterOption[]>(() => {
	const options: UnifiedFilterOption[] = [];

	// Add regions
	for (const region of regionOptions) {
		options.push({
			value: `region:${region.value}`,
			label: region.label,
			icon: null,
			filterKey: 'region',
			originalValue: region.value,
		});
	}

	// Add tags (all types)
	for (const tag of props.tags) {
		options.push({
			value: `tag:${tag.id}`,
			label: tag.name,
			icon: null,
			filterKey: 'tags.id',
			originalValue: String(tag.id),
		});
	}

	// Add facilities
	for (const facility of props.facilities) {
		options.push({
			value: `facility:${facility.slug}`,
			label: facility.name,
			icon: facility.icon,
			filterKey: 'facility',
			originalValue: facility.slug,
		});
	}

	// Add input items
	for (const item of props.items) {
		options.push({
			value: `item_input:${item.slug}`,
			label: item.name,
			icon: item.icon,
			filterKey: 'item_input',
			originalValue: item.slug,
		});
	}

	// Add output items
	for (const item of props.items) {
		options.push({
			value: `item_output:${item.slug}`,
			label: item.name,
			icon: item.icon,
			filterKey: 'item_output',
			originalValue: item.slug,
		});
	}

	return options;
});

// Selected items across all filters - converts filters to unified format
const unifiedSelectedItems = computed<string[]>(() => {
	const selected: string[] = [];

	// Add region if selected
	if (props.filters.region) {
		selected.push(`region:${props.filters.region}`);
	}

	// Add tags if selected
	if (Array.isArray(props.filters['tags.id']) && props.filters['tags.id'].length > 0) {
		for (const tagId of props.filters['tags.id']) {
			selected.push(`tag:${tagId}`);
		}
	}

	// Add facilities if selected
	if (Array.isArray(props.filters.facility) && props.filters.facility.length > 0) {
		for (const facilitySlug of props.filters.facility) {
			selected.push(`facility:${facilitySlug}`);
		}
	}

	// Add input items if selected
	if (Array.isArray(props.filters.item_input) && props.filters.item_input.length > 0) {
		for (const itemSlug of props.filters.item_input) {
			selected.push(`item_input:${itemSlug}`);
		}
	}

	// Add output items if selected
	if (Array.isArray(props.filters.item_output) && props.filters.item_output.length > 0) {
		for (const itemSlug of props.filters.item_output) {
			selected.push(`item_output:${itemSlug}`);
		}
	}

	return selected;
});

// Parse unified value to get filter key and original value
const parseUnifiedValue = (value: string): { filterKey: string; originalValue: string } | null => {
	const [prefix, ...rest] = value.split(':');
	if (!prefix || rest.length === 0) {
		return null;
	}

	const originalValue = rest.join(':'); // Handle values that might contain colons

	switch (prefix) {
		case 'region':
			return { filterKey: 'region', originalValue };
		case 'tag':
			return { filterKey: 'tags.id', originalValue };
		case 'facility':
			return { filterKey: 'facility', originalValue };
		case 'item_input':
			return { filterKey: 'item_input', originalValue };
		case 'item_output':
			return { filterKey: 'item_output', originalValue };
		default:
			return null;
	}
};

// Handle unified filter selection/removal
const unifiedFilterModel = computed({
	get: () => unifiedSelectedItems.value,
	set: (newValues: string[]) => {
		const oldValues = unifiedSelectedItems.value;

		// Find added items
		const added = newValues.filter(v => !oldValues.includes(v));
		// Find removed items
		const removed = oldValues.filter(v => !newValues.includes(v));

		// Handle additions
		for (const value of added) {
			const parsed = parseUnifiedValue(value);
			if (!parsed) continue;

			if (parsed.filterKey === 'region') {
				// Region is a single value, replace existing
				emit('update:filter', parsed.filterKey, parsed.originalValue);
			} else {
				// Array filters: add to existing array
				const currentArray = (props.filters[parsed.filterKey] as string[]) || [];
				if (!currentArray.includes(parsed.originalValue)) {
					emit('update:filter', parsed.filterKey, [...currentArray, parsed.originalValue]);
				}
			}
		}

		// Handle removals
		for (const value of removed) {
			const parsed = parseUnifiedValue(value);
			if (!parsed) continue;

			if (parsed.filterKey === 'region') {
				// Region: clear the filter
				emit('clear-filter', parsed.filterKey);
			} else {
				// Array filters: remove specific value
				emit('clear-filter', parsed.filterKey, parsed.originalValue);
			}
		}
	},
});
</script>

<template>
	<div class="flex w-full">
		<Sidebar v-if="showSidebar" class="top-(--header-height) h-[calc(100svh-var(--header-height))]!">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>{{ t('components.blueprints.list.filters.label') }}</SidebarGroupLabel>
					<SidebarGroupContent>
						<div class="px-2 py-3 space-y-2">
							<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">{{ t('components.blueprints.list.filters.region') }}</label>
							<div class="flex gap-2">
								<button
v-for="region in regionOptions" :key="region.value"
									:class="[
										'flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded border transition-colors',
										filters.region === region.value
											? 'bg-primary border-primary text-cool-gray-100'
											: 'bg-sidebar border-sidebar-border hover:bg-sidebar-accent'
									]" @click="handleRegionClick(region.value)">
									<component
:is="region.icon" class="w-6 h-6" :class="[
										filters.region === region.value
											? 'text-cool-gray-100'
											: 'text-cool-gray-30'
									]" />
									<span class="text-xs text-cool-gray-70 font-medium">{{ region.label }}</span>
								</button>
							</div>
						</div>

						<template v-for="group in Object.keys(groupedTags)" :key="group">
							<div
v-if="groupedTags[group as keyof typeof groupedTags].length > 0"
								class="px-2 py-3 space-y-2">
								<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">{{ t('components.blueprints.list.filters.tags') }}</label>
								<div class="space-y-2 max-h-48 overflow-y-auto">
									<CheckboxGroupRoot v-model="filters['tags.id']">
										<label
v-for="tag in groupedTags[group as keyof typeof groupedTags]"
											:key="tag.id" :for="`tag-${tag.id}`"
											class="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent/50 rounded px-2 py-1.5 transition-colors">
											<Checkbox :id="`tag-${tag.id}`" :value="String(tag.id)" />
											<span class="text-sm text-sidebar-foreground">{{ tag.name }}</span>
										</label>
									</CheckboxGroupRoot>
								</div>
							</div>
						</template>

						<div class="px-2 py-3 space-y-2">
							<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">{{ t('components.blueprints.list.filters.facilitiesUsed') }}</label>
							<SearchableTagsInput
v-model="filters.facility"
								:options="facilities.map(f => ({ value: f.slug, label: f.name, icon: f.icon }))"
								:placeholder="t('components.blueprints.list.filters.facilitiesPlaceholder')" class="w-full" />
						</div>

						<div class="px-2 py-3 space-y-2">
							<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">{{ t('components.blueprints.list.filters.inputProducts') }}</label>
							<SearchableTagsInput
v-model="filters.item_input"
								:options="items.map(i => ({ value: i.slug, label: i.name, icon: i.icon }))"
								:placeholder="t('components.blueprints.list.filters.inputProductsPlaceholder')" class="w-full" />
						</div>

						<div class="px-2 py-3 space-y-2">
							<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">{{ t('components.blueprints.list.filters.outputProducts') }}</label>
							<SearchableTagsInput
v-model="filters.item_output"
								:options="items.map(i => ({ value: i.slug, label: i.name, icon: i.icon }))"
								:placeholder="t('components.blueprints.list.filters.outputProductsPlaceholder')" class="w-full" />
						</div>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>

		<!-- Main Content -->
		<div class="flex flex-col w-full">
			<!-- Banner Section -->
			<slot name="banner" />

			<!-- Content Area -->
			<div class="wave-bg bg-cool-gray-10 before:bg-size-[400px]">
				<div class="container mx-auto px-4 py-6">
					<!-- Controls Bar -->
					<div class="flex flex-col gap-4 mb-8">
						<Button
v-if="showSidebar" variant="outline" size="sm" class="before:hidden w-fit bg-transparent"
							@click="toggleSidebar">
							{{ sidebarOpen ? t('components.blueprints.list.filters.hide') : t('components.blueprints.list.filters.show') }}
						</Button>

						<div class="w-full flex flex-col md:flex-row gap-4 items-center">
						<SearchableTagsInput
v-model="unifiedFilterModel" :display-tags="false"
							:options="unifiedFilterOptions.map(opt => ({ value: opt.value, label: opt.label, icon: opt.icon }))"
							:placeholder="t('components.blueprints.list.filters.searchPlaceholder')" class="w-full bg-white" />
							<Select
                                :model-value="filters.server_region"
								@update:model-value="handleServerRegionChange">
								<SelectTrigger class="w-full md:w-1/3 h-10.5 bg-white">
									<SelectValue :placeholder="t('components.blueprints.list.filters.serverRegion')" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem v-for="option in serverRegionOptions" :key="option.value" :value="option.value">
										{{ option.label }}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div class="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
							<div v-if="hasActiveFilters" class="flex items-center gap-2 flex-wrap">
								<button
v-for="tag in activeFilterTags" :key="tag.value"
									class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cool-gray-20 dark:bg-cool-gray-80 text-cool-gray-90 dark:text-cool-gray-10 text-sm hover:bg-cool-gray-30 dark:hover:bg-cool-gray-70 transition-colors"
									@click="handleClearTag(tag.filterKey, tag.value)">
									<span>{{ tag.label }}</span>
									<CloseIcon class="w-3 h-3" />
								</button>
								<Button
variant="ghost" size="sm" class="text-sm"
									@click="emit('clear-all-filters')">
									{{ t('components.blueprints.list.filters.clearAll') }}
								</Button>
							</div>
							<div v-else/>
							<span class="text-sm text-muted-foreground whitespace-nowrap">
								{{ t('components.blueprints.list.pagination.found', { count: pagination?.total ?? 0 }) }}
							</span>
						</div>

						<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div class="flex items-center gap-2">
								<label class="text-sm text-muted-foreground whitespace-nowrap">{{ t('components.blueprints.list.pagination.sortBy') }}</label>
								<Select
:model-value="sort.replace(/^-/, '')"
									@update:model-value="handleSortChange">
									<SelectTrigger class="w-[180px]">
										<SelectValue :placeholder="currentSortLabel" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem
v-for="option in sortOptions" :key="option.value"
											:value="option.value">
											{{ option.label }}
										</SelectItem>
									</SelectContent>
								</Select>
								<Button
class="rounded" variant="ghost" size="icon-sm" :title="isSortDescending ? t('components.blueprints.list.pagination.sortAscending') : t('components.blueprints.list.pagination.sortDescending')"
									@click="handleSortToggle">
									{{ isSortDescending ? '↑' : '↓' }}
								</Button>
							</div>
							<BlueprintPagination
v-model:current-page="currentPageModel"
								v-model:per-page="perPageModel" :pagination="pagination"
								:show-per-page-selector="true" />
						</div>
					</div>

					<!-- Loading State -->
					<div v-if="loading" class="flex items-center justify-center py-12">
						<div class="size-64">
							<Lottie name="throbber" />
						</div>
					</div>

					<!-- Error State -->
					<div v-if="error" class="flex flex-col items-center justify-center py-12">
						<p class="text-destructive mb-2">{{ t('components.blueprints.list.error') }}</p>
						<pre class="text-sm text-muted-foreground">{{ error }}</pre>
					</div>

					<!-- Blueprints Grid -->
					<div
v-if="!loading && !error"
						class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
						<BlueprintCard
v-for="blueprint in blueprints" :key="blueprint.id" :blueprint="blueprint"
							@filter-tag="handleTagFilter" @filter-region="handleRegionFilter"
							@filter-author="handleAuthorFilter" />

						<div
v-if="blueprints.length === 0"
							class="col-span-full flex items-center justify-center py-12">
							<p class="text-muted-foreground">{{ t('components.blueprints.list.empty') }}</p>
						</div>
					</div>

					<div class="flex justify-end">
						<!-- Pagination -->
						<BlueprintPagination
v-model:current-page="currentPageModel" v-model:per-page="perPageModel"
							:pagination="pagination" :show-per-page-selector="false" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
