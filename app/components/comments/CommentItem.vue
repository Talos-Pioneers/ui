<script setup lang="ts">
import type { Comment } from '~/models/comment';
import { Button } from '~/components/ui/button';

const props = defineProps<{
	comment: Comment;
	canManage?: boolean;
	isDeleting?: boolean;
}>();

const emit = defineEmits<{
	edit: [comment: Comment];
	delete: [comment: Comment];
}>();

const displayName = computed(() => props.comment.user?.username ?? 'Anonymous Pioneer');
const formattedDate = computed(() => useFormatDate(props.comment.created_at));
</script>

<template>
	<div class="rounded-xl border border-cool-gray-20 dark:border-cool-gray-80 bg-white dark:bg-cool-gray-95 p-4 space-y-3">
		<div class="flex items-start justify-between gap-4">
			<div>
				<p class="text-sm font-semibold text-cool-gray-95 dark:text-white">
					@{{ displayName }}
				</p>
				<p class="text-xs text-cool-gray-60">
					{{ formattedDate }}
					<span v-if="comment.is_edited" class="ml-2 text-cool-gray-50 italic">(edited)</span>
				</p>
			</div>
			<div v-if="canManage" class="flex items-center gap-2">
				<Button size="sm" variant="ghost" class="text-xs px-2 py-1" @click="emit('edit', comment)">
					Edit
				</Button>
				<Button size="sm" variant="ghost" class="text-xs px-2 py-1 text-destructive" :disabled="isDeleting"
					@click="emit('delete', comment)">
					<span v-if="isDeleting">Deleting...</span>
					<span v-else>Delete</span>
				</Button>
			</div>
		</div>
		<p class="text-sm leading-relaxed text-cool-gray-80 dark:text-cool-gray-10 whitespace-pre-line">
			{{ comment.comment }}
		</p>
	</div>
</template>

