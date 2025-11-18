<script setup lang="ts">
definePageMeta({
    middleware: ['sanctum:auth'],
});
</script>

<template>
    <div>
        <h1>Profile Blueprints</h1>
    </div>
</template>