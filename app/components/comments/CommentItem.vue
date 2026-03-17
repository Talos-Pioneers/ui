<script setup lang="ts">
import type { Comment } from '~/models/comment';
import { Button } from '~/components/ui/button';

const { t } = useI18n();

const props = defineProps<{
	comment: Comment;
	canManage?: boolean;
	isDeleting?: boolean;
}>();

const emit = defineEmits<{
	edit: [comment: Comment];
	delete: [comment: Comment];
}>();

const displayName = computed(() => props.comment.user?.username ?? t('components.comments.item.anonymous'));
const formattedDate = computed(() => useFormatDate(props.comment.created_at));
</script>

<template>
	<div class="rounded-xl border border-border bg-card p-4 space-y-3">
		<div class="flex items-start justify-between gap-4">
			<div>
				<p class="text-sm font-semibold text-foreground">
					@{{ displayName }}
				</p>
				<p class="text-xs text-muted-foreground">
					{{ formattedDate }}
					<span v-if="comment.is_edited" class="ml-2 text-muted-foreground italic">{{ t('components.comments.item.edited') }}</span>
				</p>
			</div>
			<div v-if="canManage" class="flex items-center gap-2">
				<Button size="sm" variant="ghost" class="text-xs px-2 py-1" @click="emit('edit', comment)">
					{{ t('components.comments.item.edit') }}
				</Button>
				<Button size="sm" variant="ghost" class="text-xs px-2 py-1 text-destructive" :disabled="isDeleting"
					@click="emit('delete', comment)">
					<span v-if="isDeleting">{{ t('components.comments.item.deleting') }}</span>
					<span v-else>{{ t('components.comments.item.delete') }}</span>
				</Button>
			</div>
		</div>
		<p class="text-sm leading-relaxed text-foreground whitespace-pre-line">
			{{ comment.comment }}
		</p>
	</div>
</template>

