<script setup lang="ts">
import type { Comment } from '~/models/comment';
import { Button } from '~/components/ui/button';
import CommentItem from './CommentItem.vue';

const props = defineProps<{
	comments: Comment[];
	loading?: boolean;
	error?: string | null;
	currentUserId?: string | null;
	deletingCommentId?: string | null;
}>();

const emit = defineEmits<{
	retry: [];
	edit: [comment: Comment];
	delete: [comment: Comment];
}>();
</script>

<template>
	<div class="space-y-4">
		<div v-if="loading" class="text-center text-sm text-muted-foreground py-6">
			Loading comments...
		</div>

		<div v-else-if="error" class="flex flex-col items-center gap-3 py-6 text-center">
			<p class="text-sm text-destructive">{{ error }}</p>
			<Button size="sm" variant="outline" @click="emit('retry')">
				Try again
			</Button>
		</div>

		<div v-else-if="comments.length === 0" class="text-center text-sm text-muted-foreground py-6">
			No comments yet. Be the first to share your thoughts.
		</div>

		<CommentItem v-else v-for="comment in comments" :key="comment.id" :comment="comment"
			:can-manage="comment.user?.id === currentUserId" :is-deleting="deletingCommentId === comment.id"
			@edit="emit('edit', $event)" @delete="emit('delete', $event)" />
	</div>
</template>

