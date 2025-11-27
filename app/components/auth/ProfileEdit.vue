<script setup lang="ts">
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';

const { t } = useI18n();
const config = useSanctumConfig();

type Schema = {
    username: string
}

type ProfileResponse = {
    user: {
        id: string
        username: string
        email: string
    }
}

const successMessage = ref<string | null>(null);

// Initialize form with empty values (will be populated after fetch)
const form = usePrecognitionForm<Schema>('put', '/api/v1/profile', {
    username: '',
});

const state = form.fields;
const { data, status, error, refresh } = await useSanctumFetch<ProfileResponse>('/api/v1/profile');
const profile = computed(() => data.value?.user ?? null);
watchEffect(() => {
    if (status.value === 'success') {
        state.username = data.value?.user?.username ?? '';
    }
});

// Handle form submission
const handleSubmit = async () => {
    successMessage.value = null;
    try {
        await form.submit();

        // If no errors after submission, consider it successful
        const hasErrors = Object.keys(form.errors).length > 0;
        if (!hasErrors) {
            successMessage.value = t('components.auth.profileEdit.success');
            refresh();
        }
    } catch (error) {
        console.error('Failed to update profile:', error);
    }
};
</script>

<template>
    <form @submit.prevent="handleSubmit" class="space-y-6">
        <div v-if="status === 'pending'">
            <p>{{ t('components.auth.profileEdit.loading') }}</p>
        </div>

        <template v-else-if="profile">
            <!-- Username -->
            <div class="space-y-2">
                <Label for="username">{{ t('components.auth.profileEdit.username.label') }}</Label>
                <Input id="username" v-model="state.username" :placeholder="t('components.auth.profileEdit.username.placeholder')"
                    :aria-invalid="!!form.errors.username" />
                <p v-if="form.errors.username" class="text-xs text-destructive">
                    {{ form.errors.username[0] }}
                </p>
            </div>

            <!-- Email -->
            <div class="space-y-2">
                <Label for="email">{{ t('components.auth.profileEdit.email.label') }}</Label>
                <input id="email" type="email" :value="profile.email" disabled :placeholder="t('components.auth.profileEdit.email.placeholder')"
                    class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 h-12 md:text-sm" />
                <p class="text-xs text-cool-gray-60">{{ t('components.auth.profileEdit.email.cannotChange') }}</p>
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="text-sm text-green-600">
                {{ successMessage }}
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end pt-4">
                <Button type="submit" :disabled="form.processing" class="min-w-[120px]">
                    <span v-if="form.processing">{{ t('components.auth.profileEdit.updating') }}</span>
                    <span v-else>{{ t('components.auth.profileEdit.updateButton') }}</span>
                </Button>
            </div>
        </template>
    </form>
</template>