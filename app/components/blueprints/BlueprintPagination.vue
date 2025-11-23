<script setup lang="ts">
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis } from '~/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

type PaginationMeta = {
	current_page: number;
	from: number | null;
	last_page: number;
	per_page: number;
	to: number | null;
	total: number;
};

const props = withDefaults(defineProps<{
	pagination: PaginationMeta | null;

	showPerPageSelector?: boolean;
}>(), {
	showPerPageSelector: true,
});
const perPage = defineModel<number>('perPage', { required: true });
const currentPage = defineModel<number>('currentPage', { required: true });


const getPageNumbers = computed(() => {
	if (!props.pagination) return [];

	const current = props.pagination.current_page;
	const last = props.pagination.last_page;
	const pages: (number | 'ellipsis')[] = [];

	if (last <= 7) {
		for (let i = 1; i <= last; i++) {
			pages.push(i);
		}
	} else {
		pages.push(1);
		if (current > 3) {
			pages.push('ellipsis');
		}
		for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) {
			pages.push(i);
		}
		if (current < last - 2) {
			pages.push('ellipsis');
		}
		pages.push(last);
	}

	return pages;
});

const perPageOptions = [
	{ value: '10', label: '10' },
	{ value: '15', label: '15' },
	{ value: '20', label: '20' },
	{ value: '25', label: '25' },
	{ value: '50', label: '50' },
];
</script>

<template>
	<div v-if="pagination" class="flex flex-col md:flex-row items-center justify-center gap-4">
		<!-- Per Page Selector (hidden on mobile) -->
		<div v-if="showPerPageSelector" class="hidden md:flex items-center gap-2">
			<label class="text-sm text-muted-foreground whitespace-nowrap">Show per page</label>
			<Select v-model="perPage">
				<SelectTrigger class="w-[80px]">
					{{ perPage }}
				</SelectTrigger>
				<SelectContent>
					<SelectItem v-for="option in perPageOptions" :key="option.value" :value="option.value">
						{{ option.label }}
					</SelectItem>
				</SelectContent>
			</Select>
		</div>

		<!-- Pagination -->
		<Pagination v-if="pagination.last_page > 1" :total="pagination.total" :items-per-page="pagination.per_page"
			:page="pagination.current_page" @update:page="currentPage = $event">
			<template #default="{ page, pageCount }">
				<PaginationContent>
					<PaginationPrevious class="bg-transparent hover:bg-cool-gray-20 border-none before:hidden"
						:disabled="pagination.current_page <= 1" @click="currentPage = pagination.current_page - 1" />
					<template v-for="pageNum in getPageNumbers" :key="pageNum">
						<PaginationEllipsis v-if="pageNum === 'ellipsis'" />
						<PaginationItem
							class="border-none before:hidden data-[selected=true]:bg-cool-gray-20 data-[selected=true]:hover:bg-cool-gray-30 bg-transparent hover:bg-cool-gray-20"
							v-else :value="pageNum" :is-active="pageNum === pagination.current_page"
							@click="currentPage = pageNum">
							{{ pageNum }}
						</PaginationItem>
					</template>
					<PaginationNext class="bg-transparent hover:bg-cool-gray-20 border-none before:hidden"
						:disabled="pagination.current_page >= pagination.last_page"
						@click="currentPage = pagination.current_page + 1" />
				</PaginationContent>
			</template>
		</Pagination>
	</div>
</template>
