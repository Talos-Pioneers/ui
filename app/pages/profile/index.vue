<script setup lang="ts">
import ProfileEdit from '~/components/auth/ProfileEdit.vue';

const { t } = useI18n();

definePageMeta({
    middleware: ['sanctum:auth'],
});
</script>

<template>
    <div class="wave-bg bg-cool-gray-10 before:bg-size-[400px] min-h-screen">
        <div class="container mx-auto px-4 py-6">
            <div class="max-w-4xl mx-auto">
                <div class="bg-white rounded-lg border border-cool-gray-20 p-6 space-y-6">
                    <h1 class="font-bold text-3xl">{{ t('pages.profile.edit.title') }}</h1>
                    <ProfileEdit />
                </div>
            </div>
        </div>
    </div>
</template>