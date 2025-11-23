<script setup lang="ts">
import { Button } from '~/components/ui/button';

const props = withDefaults(
	defineProps<{
		modelValue: string;
		isSubmitting?: boolean;
		placeholder?: string;
		submitLabel?: string;
		maxLength?: number;
		rows?: number;
		disabled?: boolean;
		error?: string | null;
	}>(),
	{
		submitLabel: 'Post Comment',
		maxLength: 5000,
		rows: 4,
	}
);

const emit = defineEmits<{
	'update:modelValue': [value: string];
	submit: [];
}>();

const remainingCharacters = computed(() => {
	const length = props.modelValue?.length ?? 0;
	return Math.max(props.maxLength - length, 0);
});

const handleSubmit = () => {
	if (props.disabled || props.isSubmitting) {
		return;
	}
	emit('submit');
};
</script>

<template>
	<div class="space-y-2">
		<textarea :rows="rows"
			class="w-full rounded-xl border border-cool-gray-30 dark:border-cool-gray-70 bg-white dark:bg-cool-gray-95 px-4 py-3 text-sm text-cool-gray-95 dark:text-white placeholder:text-cool-gray-50 focus:border-primary outline-none transition disabled:opacity-70 disabled:cursor-not-allowed"
			:placeholder="placeholder ?? 'Share your feedback with the community...'" :maxlength="maxLength"
			:value="modelValue" :disabled="disabled || isSubmitting" @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
			@keydown.meta.enter.prevent="handleSubmit" @keydown.ctrl.enter.prevent="handleSubmit" />
		<p v-if="error" class="text-xs text-destructive">{{ error }}</p>
		<div class="flex items-center justify-between text-xs text-cool-gray-60">
			<span>{{ remainingCharacters }} characters left</span>
			<Button size="sm" :disabled="disabled || isSubmitting || !modelValue.trim()" @click="handleSubmit">
				<span v-if="isSubmitting">Posting...</span>
				<span v-else>{{ submitLabel }}</span>
			</Button>
		</div>
	</div>
</template>

