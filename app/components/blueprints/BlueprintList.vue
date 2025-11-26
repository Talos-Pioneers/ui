<script setup lang="ts">
import type { Blueprint, PaginationMeta } from '~/models/blueprint';
import type { Facility } from '~/models/facility';
import type { Item } from '~/models/item';
import type { Tag } from '~/models/tag';
import { regionOptions } from '~/constants/blueprintOptions';
import BlueprintCard from './BlueprintCard.vue';
import BlueprintPagination from './BlueprintPagination.vue';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarInset } from '~/components/ui/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Checkbox } from '~/components/ui/checkbox';
import { Combobox } from '~/components/ui/combobox';
import { SearchableTagsInput } from '~/components/ui/tags-input';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import CloseIcon from '../icons/CloseIcon.vue';
import { ChevronDown } from 'lucide-vue-next';
import { useSidebar } from '@/components/ui/sidebar';
import type { NuxtError } from '#app';
import { CheckboxGroupRoot } from 'reka-ui';

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
}>(), {
	showSidebar: true,
	loading: false,
	error: null,
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
const sortOptions = [
	{ value: 'created_at', label: 'Created Date' },
	{ value: 'updated_at', label: 'Updated Date' },
	{ value: 'title', label: 'Title' },
	{ value: 'likes_count', label: 'Likes' },
	{ value: 'copies_count', label: 'Copies' },
];

const currentSortLabel = computed(() => {
	const sortField = props.sort.replace(/^-/, '');
	const option = sortOptions.find(opt => opt.value === sortField);
	return option?.label ?? 'Relevancy';
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

// // Handle tag checkbox toggle
// const toggleTagFilter = (tagId: string) => {
// 	if (props.filters['tags.id']?.includes(tagId)) {
// 		console.log('tagId is already in the filters', tagId);
// 	}
// };

// const isTagSelected = (tagId: string) => {
// 	return props.filters['tags.id']?.includes(tagId);
// };

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

// // Computed models for TagsInput components
// const facilitiesModel = computed({
// 	get: () => (props.filters.facility as string[]) || [],
// 	set: (value: string[]) => emit('update:filter', 'facility', value),
// });

// const itemInputModel = computed({
// 	get: () => (props.filters.item_input as string[]) || [],
// 	set: (value: string[]) => emit('update:filter', 'item_input', value),
// });

// const itemOutputModel = computed({
// 	get: () => (props.filters.item_output as string[]) || [],
// 	set: (value: string[]) => emit('update:filter', 'item_output', value),
// });
const handleRegionClick = (regionValue: string) => {
	const newValue = props.filters.region === regionValue ? null : regionValue;
	emit('update:filter', 'region', newValue);
};
// const handleClearFilter = (key: string, value?: any) => {
// 	emit('clear-filter', key, value);
// };
// const handleClearAllFilters = () => {
// 	emit('clear-all-filters');
// };

const currentPageModel = computed({
	get: () => props.currentPage,
	set: (value: number) => emit('update:current-page', value),
});

const perPageModel = computed({
	get: () => props.perPage,
	set: (value: number) => emit('update:per-page', value),
});

const { open: sidebarOpen, toggleSidebar } = useSidebar();
</script>

<template>
	<div class="flex h-screen w-full">
		<Sidebar v-if="showSidebar" class="top-(--header-height) h-[calc(100svh-var(--header-height))]!">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Filters</SidebarGroupLabel>
					<SidebarGroupContent>
						<div class="px-2 py-3 space-y-2">
							<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">Region</label>
							<div class="flex gap-2">
								<button v-for="region in regionOptions" :key="region.value"
									@click="handleRegionClick(region.value)" :class="[
										'flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded border transition-colors',
										filters.region === region.value
											? 'bg-primary border-primary text-cool-gray-100'
											: 'bg-sidebar border-sidebar-border hover:bg-sidebar-accent'
									]">
									<component :is="region.icon" class="w-6 h-6" :class="[
										filters.region === region.value
											? 'text-cool-gray-100'
											: 'text-cool-gray-30'
									]" />
									<span class="text-xs text-cool-gray-70 font-medium">{{ region.label }}</span>
								</button>
							</div>
						</div>

						<template v-for="group in Object.keys(groupedTags)" :key="group">
							<div v-if="groupedTags[group as keyof typeof groupedTags].length > 0"
								class="px-2 py-3 space-y-2">
								<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">Tags</label>
								<div class="space-y-2 max-h-48 overflow-y-auto">
									<CheckboxGroupRoot v-model="filters['tags.id']">
										<label v-for="tag in groupedTags[group as keyof typeof groupedTags]"
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
							<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">Facilities
								Used</label>
							<SearchableTagsInput v-model="filters.facility"
								:options="facilities.map(f => ({ value: f.slug, label: f.name, icon: f.icon }))"
								placeholder="Search facilities..." class="w-full" />
						</div>

						<div class="px-2 py-3 space-y-2">
							<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">Input
								Products</label>
							<SearchableTagsInput v-model="filters.item_input"
								:options="items.map(i => ({ value: i.slug, label: i.name, icon: i.icon }))"
								placeholder="Search input items..." class="w-full" />
						</div>

						<div class="px-2 py-3 space-y-2">
							<label class="text-xs font-medium text-sidebar-foreground/70 mb-2 block">Output
								Products</label>
							<SearchableTagsInput v-model="filters.item_output"
								:options="items.map(i => ({ value: i.slug, label: i.name, icon: i.icon }))"
								placeholder="Search output items..." class="w-full" />
						</div>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>

		<SidebarInset>
			<!-- Main Content -->
			<div class="flex flex-col">
				<!-- Banner Section -->
				<slot name="banner" />

				<!-- Content Area -->
				<div class="wave-bg bg-cool-gray-10 before:bg-size-[400px]">
					<div class="container mx-auto px-4 py-6">
						<!-- Controls Bar -->
						<div class="flex flex-col gap-4 mb-8">
							<Button v-if="showSidebar" variant="outline" size="sm" @click="toggleSidebar"
								class="before:hidden w-fit bg-transparent">
								{{ sidebarOpen ? 'Hide Filters' : 'Show Filters' }}
							</Button>

							<Input placeholder="Search for any tag..." class="w-full bg-white" />

							<div class="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
								<div v-if="hasActiveFilters" class="flex items-center gap-2 flex-wrap">
									<button v-for="tag in activeFilterTags" :key="tag.value"
										@click="handleClearTag(tag.filterKey, tag.value)"
										class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cool-gray-20 dark:bg-cool-gray-80 text-cool-gray-90 dark:text-cool-gray-10 text-sm hover:bg-cool-gray-30 dark:hover:bg-cool-gray-70 transition-colors">
										<span>{{ tag.label }}</span>
										<CloseIcon class="w-3 h-3" />
									</button>
									<Button variant="ghost" size="sm" @click="emit('clear-all-filters')"
										class="text-sm">
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
										@update:model-value="handleSortChange">
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
									<Button class="rounded" variant="ghost" size="icon-sm" @click="handleSortToggle"
										:title="isSortDescending ? 'Sort ascending' : 'Sort descending'">
										{{ isSortDescending ? '↑' : '↓' }}
									</Button>
								</div>
								<BlueprintPagination v-model:current-page="currentPageModel"
									v-model:per-page="perPageModel" :pagination="pagination"
									:show-per-page-selector="true" />
							</div>
						</div>

						<!-- Loading State -->
						<div v-if="loading" class="flex items-center justify-center py-12">
							<p class="text-muted-foreground">Loading blueprints...</p>
						</div>

						<!-- Error State -->
						<div v-if="error" class="flex flex-col items-center justify-center py-12">
							<p class="text-destructive mb-2">Error loading blueprints:</p>
							<pre class="text-sm text-muted-foreground">{{ error }}</pre>
						</div>

						<!-- Blueprints Grid -->
						<div v-if="!loading && !error"
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
							<BlueprintPagination v-model:current-page="currentPageModel" v-model:per-page="perPageModel"
								:pagination="pagination" :show-per-page-selector="false" />
						</div>
					</div>
				</div>
			</div>
		</SidebarInset>
	</div>
</template>
