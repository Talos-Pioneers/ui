<script setup lang="ts">
import type { Comment } from '~/models/comment'
import { Button } from '~/components/ui/button'
import CommentItem from './CommentItem.vue'

const { t } = useI18n()

const props = defineProps<{
	comments: Comment[]
	loading?: boolean
	error?: string | null
	currentUserId?: string | null
	deletingCommentId?: string | null
}>()

const emit = defineEmits<{
	retry: []
	edit: [comment: Comment]
	delete: [comment: Comment]
}>()
</script>

<template>
	<div class="space-y-4">
		<div v-if="loading" class="flex items-center justify-center py-6">
			<div class="size-64 lottie-throbber">
				<Lottie name="throbber" />
			</div>
		</div>

		<div
			v-else-if="error"
			class="flex flex-col items-center gap-3 py-6 text-center"
		>
			<p class="text-sm text-destructive">{{ error }}</p>
			<Button size="sm" variant="outline" @click="emit('retry')">
				{{ t('components.comments.list.tryAgain') }}
			</Button>
		</div>

		<div
			v-else-if="comments.length === 0"
			class="text-center text-sm text-muted-foreground py-6"
		>
			{{ t('components.comments.list.empty') }}
		</div>

		<CommentItem
			v-for="comment in comments"
			v-else
			:key="comment.id"
			:comment="comment"
			:can-manage="
				comment.permissions.can_edit || comment.permissions.can_delete
			"
			:is-deleting="deletingCommentId === comment.id"
			@edit="emit('edit', $event)"
			@delete="emit('delete', $event)"
		/>
	</div>
</template>
