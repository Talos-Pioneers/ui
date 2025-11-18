<script setup lang="ts">
import ProfileEdit from '~/components/auth/ProfileEdit.vue';

definePageMeta({
    middleware: ['sanctum:auth'],
});
</script>

<template>
    <div>
        <ProfileEdit />
    </div>
</template>