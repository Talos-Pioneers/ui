<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import type { Blueprint } from '~/models/blueprint';

const props = defineProps<{
    blueprint: Blueprint;
}>();

const { copy, copied } = useClipboard();

const { locale } = useI18n();

const previewImage = computed(() => {
    return props.blueprint.gallery && props.blueprint.gallery.length > 0 && props.blueprint.gallery[0]
        ? props.blueprint.gallery[0].thumbnail
        : null;
});

const copyBlueprintCode = async () => {
    await copy(props.blueprint.code);
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale.value, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatNumber = (num: number): string => {
    return formatValuation(num, { locale: locale.value });
};
</script>

<template>
    <div>
        <!-- Header Section with Preview Image -->
        <div>
            <div v-if="previewImage">
                <img :src="previewImage" :alt="blueprint.title" />
            </div>
            <div v-else>
                <span>NOT FOUND</span>
            </div>
            <div>
                <CopyIcon @click="copyBlueprintCode" />
            </div>
        </div>

        <!-- Content Section -->
        <div>
            <h2>{{ blueprint.title }}</h2>
            <div>
                <div>
                    <p v-if="blueprint.creator">
                        by {{ blueprint.creator.name }}
                    </p>
                    <p v-else>by Unknown</p>
                </div>
                <div>
                    <div>
                        <span>{{ formatDate(blueprint.created_at) }}</span>
                    </div>
                    <div>
                        <span>{{ formatDate(blueprint.updated_at) }}</span>
                    </div>
                </div>
            </div>
        </div>
        <!-- Region and Actions -->
        <div class="region-actions-section">
            <div class="region-info" v-if="blueprint.region">
                <RegionIcon />
                <span>{{ blueprint.region }}</span>
            </div>
            <div>
                <button title="Add to Collection">
                    <AddCollectionIcon />
                </button>
                <button title="Open external link">
                    <ShareIcon />
                </button>
                <button title="More options">
                    <VerticalElipsis />
                </button>
            </div>
        </div>

        <!-- Statistics -->
        <div class="statistics-section">
            <div class="stat-item">
                <CopiesIcon />
                <span>{{ formatNumber(blueprint.copies_count) }}</span>
            </div>
            <div class="stat-item">
                <LikesIcon />
                <span>{{ formatNumber(blueprint.likes_count) }}</span>
            </div>
            <div class="stat-item">
                <CommentsIcon />
                <span>{{ formatNumber(blueprint.comments_count) }}</span>
            </div>
        </div>

        <div>
            <span>Blueprint</span>
            <template v-for="(tag, index) in blueprint.tags" :key="tag.slug">
                <span v-if="index > 0">|</span>
                <span>{{ tag.name }}</span>
            </template>
        </div>
    </div>
</template>
