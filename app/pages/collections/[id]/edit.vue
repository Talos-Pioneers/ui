<script setup lang="ts">
definePageMeta({
    middleware: ['sanctum:auth'],
});
const { id } = useRoute().params;
</script>

<template>
    <div>
        <h1>Edit Collection {{ id }}</h1>
    </div>
</template>