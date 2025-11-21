<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import type { Blueprint } from '~/models/blueprint';
import ClockIcon from '../icons/ClockIcon.vue';
import CalendarIcon from '../icons/CalendarIcon.vue';
import CopyIcon from '../icons/CopyIcon.vue';
import RegionIcon from '../icons/RegionIcon.vue';
import AddCollectionIcon from '../icons/AddCollectionIcon.vue';
import ShareIcon from '../icons/ShareIcon.vue';
import VerticalElipsis from '../icons/VerticalElipsis.vue';
import CopiesIcon from '../icons/CopiesIcon.vue';
import LikesIcon from '../icons/LikesIcon.vue';
import CommentsIcon from '../icons/CommentsIcon.vue';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import ReportButton from '~/components/ReportButton.vue';

const props = defineProps<{
    blueprint: Blueprint;
}>();

const emit = defineEmits<{
    'filter-tag': [tagId: string];
    'filter-region': [region: string];
    'filter-author': [authorId: string];
}>();

const { copy, copied } = useClipboard();

const { locale } = useI18n();

const dropdownOpen = ref(false);

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

const handleTagClick = (tagId: string) => {
    emit('filter-tag', tagId);
};

const handleRegionClick = () => {
    if (props.blueprint.region) {
        emit('filter-region', props.blueprint.region);
    }
};

const handleAuthorClick = () => {
    if (props.blueprint.creator) {
        emit('filter-author', props.blueprint.creator.id);
    }
};

const handleReported = () => {
    dropdownOpen.value = false;
};
</script>

<template>
    <div
        class="blueprint-card group overflow-hidden rounded-lg bg-white dark:bg-[var(--color-cool-gray-90)] shadow-sm hover:shadow-md transition-shadow">
        <!-- Header Section with Preview Image -->
        <div class="relative aspect-4/3 bg-cool-gray-90 overflow-hidden">
            <div v-if="previewImage" class="w-full h-full">
                <img :src="previewImage" :alt="blueprint.title" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-full h-full flex items-center justify-center relative">
                <div class="absolute inset-0 bg-cool-gray-90"></div>
                <div class="absolute inset-0 bg-[url('@/assets/img/input-pattern.svg')] opacity-10"></div>
                <div class="relative z-10 flex flex-col items-center justify-center">
                    <div class="absolute w-32 h-32 rounded-full border border-cool-gray-30 opacity-20"></div>
                    <span class="relative text-white text-4xl font-bold">NOT FOUND</span>
                </div>
                <div class="absolute bottom-4 right-4 z-10">
                    <CopyIcon class="w-5 h-5 text-cool-gray-30" />
                </div>
            </div>
            <div v-if="previewImage" class="absolute bottom-4 right-4 z-10">
                <button @click="copyBlueprintCode"
                    class="p-2 bg-white/80 dark:bg-cool-gray-90/80 rounded hover:bg-white transition-colors"
                    :title="copied ? 'Copied!' : 'Copy blueprint code'">
                    <CopyIcon class="w-5 h-5 text-cool-gray-70" />
                </button>
            </div>
        </div>

        <!-- Content Section -->
        <div class="p-4 space-y-3 bg-white dark:bg-cool-gray-90 rounded-b-lg">
            <!-- Title and Author -->
            <div>
                <h2 class="text-xl font-bold text-cool-gray-90 mb-1 line-clamp-2">
                    {{ blueprint.title }}
                </h2>
                <div class="flex items-center justify-between gap-2">
                    <p v-if="blueprint.creator" @click="handleAuthorClick"
                        class="text-sm text-cool-gray-70 cursor-pointer hover:text-cool-gray-90 transition-colors">
                        by {{ blueprint.creator.name }}
                    </p>
                    <p v-else class="text-sm text-cool-gray-70">by Unknown</p>
                    <div class="flex items-center gap-3 text-xs text-cool-gray-60">
                        <div class="flex items-center gap-1">
                            <ClockIcon class="w-4 h-4" />
                            <span>{{ formatDate(blueprint.created_at) }}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <CalendarIcon class="w-4 h-4" />
                            <span>{{ formatDate(blueprint.updated_at) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Region and Actions -->
            <div class="flex items-center justify-between">
                <div v-if="blueprint.region" @click="handleRegionClick"
                    class="flex items-center gap-1.5 text-sm text-cool-gray-80 cursor-pointer hover:text-cool-gray-90 transition-colors">
                    <RegionIcon class="w-4 h-4" />
                    <span>{{ blueprint.region }}</span>
                </div>
                <div v-else class="flex-1"></div>
                <div class="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <button
                                class="p-1.5 hover:bg-cool-gray-20 dark:hover:bg-cool-gray-80 rounded transition-colors"
                                title="Add to Collection">
                                <AddCollectionIcon class="w-4 h-4 text-cool-gray-70" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Add to Collection</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <button
                                class="p-1.5 hover:bg-cool-gray-20 dark:hover:bg-cool-gray-80 rounded transition-colors"
                                title="Open external link">
                                <ShareIcon class="w-4 h-4 text-cool-gray-70" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Open external link</p>
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenu v-model:open="dropdownOpen">
                        <Tooltip>
                            <TooltipTrigger as-child>
                                <DropdownMenuTrigger as-child>
                                    <button class="p-1.5 hover:bg-cool-gray-20 rounded transition-colors"
                                        title="More options">
                                        <VerticalElipsis class="w-4 h-4 text-cool-gray-70" />
                                    </button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>More options</p>
                            </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent>
                            <ReportButton reportable-type="App\Models\Blueprint" :reportable-id="blueprint.id"
                                item-name="blueprint" @reported="handleReported">
                                <template #default="{ handleReport, isReporting }">
                                    <DropdownMenuItem @click="handleReport" :disabled="isReporting">
                                        <span v-if="isReporting">Reporting...</span>
                                        <span v-else>Report Blueprint</span>
                                    </DropdownMenuItem>
                                </template>
                            </ReportButton>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <!-- Statistics -->
            <div class="flex items-center gap-4 text-sm text-cool-gray-80">
                <div class="flex items-center gap-1.5">
                    <CopiesIcon class="w-4 h-4" />
                    <span>{{ formatNumber(blueprint.copies_count) }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <LikesIcon class="w-4 h-4" />
                    <span>{{ formatNumber(blueprint.likes_count) }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <CommentsIcon class="w-4 h-4" />
                    <span>{{ formatNumber(blueprint.comments_count) }}</span>
                </div>
            </div>

            <!-- Tags -->
            <div class="flex items-center gap-2 flex-wrap">
                <button v-if="blueprint.tags.length > 0" @click="handleTagClick(blueprint?.tags?.[0]?.id ?? '')"
                    class="px-2 py-1 text-xs font-medium bg-cool-gray-20 text-cool-gray-90 rounded hover:bg-cool-gray-30 transition-colors cursor-pointer">
                    {{ blueprint?.tags?.[0]?.name }}
                </button>
                <template v-for="(tag, index) in blueprint.tags.slice(1)" :key="tag.slug">
                    <span class="text-cool-gray-60 text-xs">|</span>
                    <span @click="handleTagClick(tag.id)"
                        class="text-xs text-cool-gray-80 cursor-pointer hover:text-cool-gray-90 transition-colors">
                        {{ tag.name }}
                    </span>
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped>
.blueprint-card {
    @apply transition-all duration-200;
}
</style>
