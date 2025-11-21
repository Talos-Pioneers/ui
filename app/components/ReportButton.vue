<script setup lang="ts">
import { toast } from 'vue-sonner';

const props = defineProps<{
    reportableType: 'App\\Models\\Blueprint' | 'App\\Models\\BlueprintCollection';
    reportableId: string;
    itemName?: string; // Optional name for better error messages (e.g., "blueprint", "collection")
}>();

const emit = defineEmits<{
    'reported': [];
    'error': [message: string];
}>();

const isReporting = ref(false);

const itemTypeName = computed(() => {
    return props.itemName || (props.reportableType === 'App\\Models\\Blueprint' ? 'blueprint' : 'collection');
});

type Schema = {
    reportable_type: 'App\\Models\\Blueprint' | 'App\\Models\\BlueprintCollection';
    reportable_id: string;
    reason: string;
}
const reportForm = usePrecognitionForm<Schema>('post', '/api/v1/reports', {
    reportable_type: props.reportableType,
    reportable_id: props.reportableId,
    reason: '',
});

const handleReport = async () => {
    isReporting.value = true;

    try {
        await reportForm.submit();

        toast.success('Report submitted successfully.');
        emit('reported');
    } catch (error: any) {
        const { isValidationError, code, bag } = useSanctumError(error);
        let errorMessage = 'Failed to submit report. Please try again.';

        // Check if it's a duplicate report (422 with message)
        if (code === 422) {
            const message = error?.response?._data?.message || error?.data?.message;
            errorMessage = message || `You have already reported this ${itemTypeName.value}.`;
        } else if (isValidationError) {
            errorMessage = bag[0]?.message || 'Failed to submit report.';
        }

        toast.error(errorMessage);
        emit('error', errorMessage);
    } finally {
        isReporting.value = false;
    }
};
</script>

<template>
    <slot :handle-report="handleReport" :is-reporting="isReporting">
        <button @click="handleReport" :disabled="isReporting"
            class="w-full text-left px-2 py-1.5 text-sm hover:bg-cool-gray-20 dark:hover:bg-cool-gray-80 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="isReporting">Reporting...</span>
            <span v-else>Report</span>
        </button>
    </slot>
</template>
