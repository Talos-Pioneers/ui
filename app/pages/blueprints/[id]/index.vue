<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import { toast } from 'vue-sonner';
import { Button } from '~/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '~/components/ui/carousel';
import type { UnwrapRefCarouselApi } from '~/components/ui/carousel/interface';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import CommentComposer from '~/components/comments/CommentComposer.vue';
import AddCollectionIcon from '~/components/icons/AddCollectionIcon.vue';
import ShareIcon from '~/components/icons/ShareIcon.vue';
import VerticalElipsis from '~/components/icons/VerticalElipsis.vue';
import CommentList from '~/components/comments/CommentList.vue';
import CopyIcon from '~/components/icons/CopyIcon.vue';
import LikesIcon from '~/components/icons/LikesIcon.vue';
import CopiesIcon from '~/components/icons/CopiesIcon.vue';
import CommentsIcon from '~/components/icons/CommentsIcon.vue';
import CalendarIcon from '~/components/icons/CalendarIcon.vue';
import ClockIcon from '~/components/icons/ClockIcon.vue';
import RegionIcon from '~/components/icons/RegionIcon.vue';
import NotFoundImage from '~/assets/img/not-found-placeholder.png';
import type { Blueprint, BlueprintFacility, BlueprintItem, BlueprintTag } from '~/models/blueprint';
import type { Comment } from '~/models/comment';
import { regionOptions } from '~/constants/blueprintOptions';

type BlueprintResponse = {
    data: Blueprint;
};

type CommentListResponse = {
    data: Comment[];
    meta: {
        current_page: number;
        last_page: number;
    };
};

const route = useRoute();
const router = useRouter();
const loginModal = useLoginModal();
const { user, isAuthenticated } = useSanctumAuth();
const sanctumClient = useSanctumClient();
const { copy } = useClipboard();
const blueprintId = computed(() => route.params.id as string);

const { data: blueprintResponse, status: blueprintStatus, error: blueprintError, refresh: refreshBlueprint } =
    await useSanctumFetch<BlueprintResponse>(
        () => `/api/v1/blueprints/${blueprintId.value}`
    );

const blueprint = computed(() => blueprintResponse.value?.data ?? null);

watchEffect(() => {
    if (!blueprint.value) {
        return;
    }
    useHead({
        title: `${blueprint.value.title} • Talos Pioneers`,
    });
});

const commentsPage = ref(1);
const shouldResetComments = ref(true);

const { data: commentsResponse, status: commentsStatus, error: commentsError, refresh: refreshComments } =
    await useSanctumFetch<CommentListResponse>(
        () => `/api/v1/blueprints/${blueprintId.value}/comments`,
        () => ({
            method: 'get',
            query: { page: String(commentsPage.value) },
        }),
        {
            watch: [commentsPage],
        }
    );

const comments = ref<Comment[]>([]);

watch(
    () => commentsResponse.value?.data,
    (newComments) => {
        if (!newComments) {
            return;
        }
        if (commentsPage.value === 1 || shouldResetComments.value) {
            comments.value = [...newComments];
        } else {
            const existingIds = new Set(comments.value.map(comment => comment.id));
            const filtered = newComments.filter(comment => !existingIds.has(comment.id));
            comments.value = [...comments.value, ...filtered];
        }
        shouldResetComments.value = false;
    },
    { immediate: true }
);

const totalComments = computed(() => blueprint.value?.comments_count ?? comments.value.length);
const hasMoreComments = computed(() => {
    const meta = commentsResponse.value?.meta;
    if (!meta) {
        return false;
    }
    return meta.current_page < meta.last_page;
});

const galleryApi = ref<UnwrapRefCarouselApi | null>(null);
const activeSlide = ref(0);

const handleCarouselInit = (api: UnwrapRefCarouselApi) => {
    galleryApi.value = api;
    activeSlide.value = api.selectedScrollSnap();
    api.on('select', () => {
        activeSlide.value = api.selectedScrollSnap();
    });
};

const goToSlide = (index: number) => {
    galleryApi.value?.scrollTo(index);
};

const buildFacilityIcon = (facility: BlueprintFacility) => {
    return facility.icon
        ? `https://static.warfarin.wiki/v1/buildingimage/${facility.icon}.webp`
        : NotFoundImage;
};

const buildItemIcon = (item: BlueprintItem) => {
    return item.icon
        ? `https://static.warfarin.wiki/v1/itemicon/${item.icon}.webp`
        : NotFoundImage;
};

const stats = computed(() => {
    if (!blueprint.value) {
        return [];
    }
    return [
        {
            label: 'Likes',
            value: useFormatCompactNumber(blueprint.value.likes_count),
            icon: LikesIcon,
        },
        {
            label: 'Copies',
            value: useFormatCompactNumber(blueprint.value.copies_count),
            icon: CopiesIcon,
        },
        {
            label: 'Comments',
            value: useFormatCompactNumber(blueprint.value.comments_count),
            icon: CommentsIcon,
        },
    ];
});

const isTogglingLike = ref(false);
const isCopyingCode = ref(false);
const galleryItems = computed(() => blueprint.value?.gallery ?? []);
const galleryDisplayItems = computed(() => {
    const items = galleryItems.value;
    if (items.length > 0) {
        return items;
    }
    return [{
        thumbnail: NotFoundImage,
        url: NotFoundImage,
        name: blueprint.value?.title ?? 'Blueprint preview',
    }];
});
const formattedCreatedAt = computed(() => blueprint.value ? useFormatDate(blueprint.value.created_at) : '');
const formattedUpdatedAt = computed(() => blueprint.value ? useFormatDate(blueprint.value.updated_at) : '');

const handleToggleLike = async () => {
    if (!blueprint.value || isTogglingLike.value) {
        return;
    }

    if (!isAuthenticated.value) {
        loginModal.open();
        return;
    }

    isTogglingLike.value = true;
    try {
        const response = await sanctumClient<{ liked: boolean; likes_count: number }>(`/api/v1/blueprints/${blueprint.value.id}/like`, {
            method: 'post',
        });
        if (blueprintResponse.value?.data) {
            blueprintResponse.value.data.is_liked = response.liked;
            blueprintResponse.value.data.likes_count = response.likes_count;
        }
    } catch (error) {
        const { code } = useSanctumError(error);
        if (code === 401) {
            loginModal.open();
        } else {
            toast.error('Unable to update like right now.');
        }
    } finally {
        isTogglingLike.value = false;
    }
};

const handleCopyCode = async () => {
    if (!blueprint.value) {
        return;
    }

    await copy(blueprint.value.code);
    toast.success('Blueprint code copied to clipboard');

    if (!isAuthenticated.value || isCopyingCode.value) {
        return;
    }

    isCopyingCode.value = true;
    try {
        const response = await sanctumClient<{ copies_count: number; message: string }>(`/api/v1/blueprints/${blueprint.value.id}/copy`, {
            method: 'post',
        });
        if (blueprintResponse.value?.data) {
            blueprintResponse.value.data.copies_count = response.copies_count;
        }
    } catch (error) {
        const { code } = useSanctumError(error);
        if (code === 429) {
            toast.error('You have already copied this blueprint today.');
        } else if (code === 401) {
            loginModal.open();
        } else {
            toast.error('Unable to track copy right now.');
        }
    } finally {
        isCopyingCode.value = false;
    }
};

const navigateToTag = (tag: BlueprintTag) => {
    router.push({
        path: '/',
        query: {
            'filter[tags.id]': tag.id,
        },
    });
};

const commentInput = ref('');
const isSubmittingComment = ref(false);
const commentErrorMessage = ref<string | null>(null);
const editingCommentId = ref<string | null>(null);
const editingContent = ref('');
const deletingCommentId = ref<string | null>(null);

const invalidateComments = async () => {
    shouldResetComments.value = true;
    commentsPage.value = 1;
    await refreshComments();
    await refreshBlueprint();
};

const submitComment = async () => {
    if (!blueprint.value) {
        return;
    }

    if (!isAuthenticated.value) {
        loginModal.open();
        return;
    }

    if (!commentInput.value.trim() || isSubmittingComment.value) {
        return;
    }

    commentErrorMessage.value = null;
    isSubmittingComment.value = true;
    try {
        await sanctumClient(`/api/v1/blueprints/${blueprint.value.id}/comments`, {
            method: 'post',
            body: {
                comment: commentInput.value,
            },
        });
        commentInput.value = '';
        toast.success('Comment submitted for review.');
        await invalidateComments();
    } catch (error) {
        const { isValidationError, bag, code } = useSanctumError(error);
        if (code === 429) {
            commentErrorMessage.value = 'You can only post 1 comment per minute. Please try again later.';
        } else if (isValidationError) {
            commentErrorMessage.value = bag[0]?.message ?? 'Unable to submit comment.';
        } else if (code === 401) {
            loginModal.open();
        } else {
            commentErrorMessage.value = 'Unable to submit comment right now.';
        }
    } finally {
        isSubmittingComment.value = false;
    }
};

const requestEditComment = (comment: Comment) => {
    if (comment.user?.id !== user.value?.id) {
        return;
    }
    editingCommentId.value = comment.id;
    editingContent.value = comment.comment;
};

const cancelEdit = () => {
    editingCommentId.value = null;
    editingContent.value = '';
};

const saveCommentEdit = async () => {
    if (!blueprint.value || !editingCommentId.value || !editingContent.value.trim()) {
        return;
    }
    isSubmittingComment.value = true;
    try {
        await sanctumClient(`/api/v1/blueprints/${blueprint.value.id}/comments/${editingCommentId.value}`, {
            method: 'put',
            body: {
                comment: editingContent.value,
            },
        });
        toast.success('Comment updated.');
        cancelEdit();
        await invalidateComments();
    } catch (error) {
        const { isValidationError, bag } = useSanctumError(error);
        if (isValidationError) {
            commentErrorMessage.value = bag[0]?.message ?? 'Unable to update comment.';
        } else {
            commentErrorMessage.value = 'Unable to update comment right now.';
        }
    } finally {
        isSubmittingComment.value = false;
    }
};

const deleteComment = async (comment: Comment) => {
    if (!blueprint.value || comment.user?.id !== user.value?.id) {
        return;
    }
    deletingCommentId.value = comment.id;
    try {
        await sanctumClient(`/api/v1/blueprints/${blueprint.value.id}/comments/${comment.id}`, {
            method: 'delete',
        });
        toast.success('Comment deleted.');
        await invalidateComments();
    } catch (error) {
        toast.error('Unable to delete comment right now.');
    } finally {
        deletingCommentId.value = null;
    }
};

const loadMoreComments = () => {
    if (!hasMoreComments.value) {
        return;
    }
    shouldResetComments.value = false;
    commentsPage.value += 1;
};

const retryCommentsFetch = () => {
    shouldResetComments.value = true;
    refreshComments();
};

const isBlueprintLoading = computed(() => blueprintStatus.value === 'pending');
const blueprintLoadError = computed(() => blueprintStatus.value === 'error' ? blueprintError.value : null);

const isCommentsLoading = computed(() => commentsStatus.value === 'pending' && commentsPage.value === 1 && comments.length === 0);
const commentsLoadError = computed(() => commentsStatus.value === 'error' ? 'Unable to load comments.' : commentsError.value as string | null);

const dropdownOpen = ref(false);
const handleReported = () => {
    dropdownOpen.value = false;
};
const { handleDelete } = await useBlueprintDelete();
</script>

<template>
    <div class="bg-cool-gray-5 dark:bg-cool-gray-95 min-h-screen py-8">
        <div class="container mx-auto px-4">
            <div v-if="isBlueprintLoading" class="py-20 text-center text-muted-foreground">
                Loading blueprint details...
            </div>

            <div v-else-if="blueprintLoadError" class="py-20 text-center">
                <p class="text-destructive mb-4">Unable to load this blueprint.</p>
                <Button variant="outline" @click="refreshBlueprint">Try again</Button>
            </div>

            <div v-else-if="!blueprint" class="py-20 text-center">
                <p class="text-muted-foreground">Blueprint not found.</p>
            </div>

            <div v-else class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
                <div class="space-y-8">
                    <section class="space-y-4">
                        <div
                            class="relative rounded-lg overflow-hidden border border-cool-gray-20 dark:border-cool-gray-80 bg-white dark:bg-cool-gray-95">
                            <Carousel class="relative" @init-api="handleCarouselInit">
                                <CarouselContent>
                                    <CarouselItem v-for="(image, index) in galleryDisplayItems" :key="index">
                                        <img :src="image.url || image.thumbnail" :alt="image.name"
                                            class="w-full h-full object-center object-contain" />
                                    </CarouselItem>
                                </CarouselContent>
                                <CarouselPrevious class="absolute left-4 top-1/2 -translate-y-1/2" />
                                <CarouselNext class="absolute right-4 top-1/2 -translate-y-1/2" />
                            </Carousel>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button v-for="(image, index) in galleryDisplayItems" :key="`thumb-${index}`" type="button"
                                @click="goToSlide(index)" class="rounded-xl border transition-colors overflow-hidden"
                                :class="activeSlide === index ? 'border-primary' : 'border-transparent hover:border-cool-gray-40'">
                                <img :src="image.thumbnail || image.url" :alt="image.name"
                                    class="w-full object-cover" />
                            </button>
                        </div>
                    </section>

                    <section
                        class="rounded-lg border border-cool-gray-20 dark:border-cool-gray-80 bg-white dark:bg-cool-gray-95 p-6 space-y-6">
                        <div class="flex items-center justify-between">
                            <h1 class="font-bold text-3xl">{{ blueprint.title }}</h1>
                            <div class="flex items-center gap-1">
                                <Tooltip>
                                    <TooltipTrigger as-child>
                                        <Button class="before:border-none rounded-lg" size="icon-sm"
                                            title="Add to Collection" variant="ghost">
                                            <AddCollectionIcon class="size-7.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Add to Collection</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger as-child>
                                        <Button class="before:border-none rounded-lg" size="icon-sm"
                                            title="Open external link" variant="ghost">
                                            <ShareIcon class="size-7.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Open external link</p>
                                    </TooltipContent>
                                </Tooltip>
                                <DropdownMenu v-model:open="dropdownOpen">
                                    <DropdownMenuTrigger as-child>
                                        <Button class="before:border-none rounded-lg" size="icon-sm" variant="ghost">
                                            <VerticalElipsis class="size-7.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <ReportButton reportable-type="App\Models\Blueprint"
                                            :reportable-id="blueprint.id" item-name="blueprint"
                                            @reported="handleReported">
                                            <template #default="{ handleReport, isReporting }">
                                                <DropdownMenuItem @click="handleReport" :disabled="isReporting">
                                                    <span v-if="isReporting">Reporting...</span>
                                                    <span v-else>Report Blueprint</span>
                                                </DropdownMenuItem>
                                            </template>
                                        </ReportButton>
                                        <DropdownMenuItem v-if="blueprint.permissions.can_delete"
                                            @click="handleDelete(blueprint)">
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem v-if="blueprint.permissions.can_edit" as-child>
                                            <NuxtLinkLocale :to="`/blueprints/${blueprint.id}/edit`"></NuxtLinkLocale>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div class="flex justify-between items-center gap-3">
                            <div class="flex items-center gap-3">
                                <div v-for="stat in stats" :key="stat.label" class=" flex items-center gap-3">
                                    <component :is="stat.icon" class="size-4.5 text-cool-gray-70" />
                                    <p class="font-medium text-cool-gray-90">{{
                                        stat.value }}</p>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-4 text-sm text-cool-gray-70">
                                <div class="flex items-center gap-2">
                                    <ClockIcon class="w-4 h-4" />
                                    Created {{ formattedCreatedAt }}
                                </div>
                                <div class="flex items-center gap-2">
                                    <CalendarIcon class="w-4 h-4" />
                                    Updated {{ formattedUpdatedAt }}
                                </div>
                            </div>
                        </div>

                        <hr class="border-cool-gray-20">

                        <div>
                            <p class="text-sm text-cool-gray-80 leading-relaxed whitespace-pre-line">
                                {{ blueprint.description || 'No description provided for this blueprint.' }}
                            </p>
                        </div>
                    </section>

                    <section
                        class="rounded-lg border border-cool-gray-20 dark:border-cool-gray-80 bg-white dark:bg-cool-gray-95 p-6 space-y-6">
                        <div class="flex items-center justify-between flex-wrap gap-3">
                            <h3 class="text-xl font-semibold">Comments ({{ totalComments }})</h3>
                        </div>

                        <div v-if="editingCommentId" class="space-y-3">
                            <h4 class="text-sm font-semibold">Editing your comment</h4>
                            <CommentComposer v-model="editingContent" :is-submitting="isSubmittingComment"
                                submit-label="Save Changes" :error="commentErrorMessage" @submit="saveCommentEdit" />
                            <Button variant="ghost" size="sm" @click="cancelEdit">Cancel</Button>
                        </div>
                        <div v-else>
                            <CommentComposer v-if="isAuthenticated" v-model="commentInput"
                                :is-submitting="isSubmittingComment" :error="commentErrorMessage"
                                @submit="submitComment" />
                            <div v-else
                                class="rounded-2xl border border-dashed border-cool-gray-30 dark:border-cool-gray-70 p-6 text-center space-y-3">
                                <p class="text-sm text-cool-gray-70">Sign in to join the conversation.</p>
                                <Button @click="loginModal.open">Sign In to Comment</Button>
                            </div>
                        </div>

                        <CommentList :comments="comments" :loading="isCommentsLoading"
                            :error="commentsLoadError ?? undefined" :current-user-id="user?.id"
                            :deleting-comment-id="deletingCommentId" @retry="retryCommentsFetch"
                            @edit="requestEditComment" @delete="deleteComment" />

                        <div v-if="hasMoreComments" class="text-center">
                            <Button variant="outline" :disabled="commentsStatus === 'pending'"
                                @click="loadMoreComments">
                                <span v-if="commentsStatus === 'pending'">Loading...</span>
                                <span v-else>Load more comments</span>
                            </Button>
                        </div>
                    </section>
                </div>

                <aside class="space-y-6">
                    <div class="rounded-xl border border-cool-gray-20 bg-white dark:bg-cool-gray-95 p-6 space-y-5">
                        <div class="grid grid-cols-2 gap-2.5 w-full">
                            <Button class="w-full justify-between before:hidden" rounded="base" @click="handleCopyCode">
                                <CopyIcon class="size-4.5" />
                                Copy Code
                            </Button>
                            <Button :variant="blueprint.is_liked ? 'default' : 'outline'" rounded="base"
                                class="w-full justify-between before:hidden" :disabled="isTogglingLike"
                                @click="handleToggleLike">
                                <LikesIcon class="w-4 h-4" />
                                <span v-if="isTogglingLike">Saving...</span>
                                <span v-else>{{ blueprint.is_liked ? 'Liked' : 'Like' }}</span>
                            </Button>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold mb-2.5">Details</h3>
                            <div class="space-y-3 text-sm text-cool-gray-80">
                                <div class="flex items-center justify-between">
                                    <span class="text-cool-gray-60">Author</span>
                                    <span>{{ blueprint.creator?.name ?? 'Anonymous Pioneer' }}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-cool-gray-60">Region</span>
                                    <span>{{regionOptions.find(r => r.value === blueprint?.region)?.label ?? 'Any'
                                    }}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-cool-gray-60">Version</span>
                                    <span class="uppercase">{{ blueprint.version }}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-cool-gray-60">Status</span>
                                    <span class="capitalize">{{ blueprint.status }}</span>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <div v-if="blueprint.tags.length">
                            <h3 class="text-lg font-semibold mb-2.5">Tags</h3>
                            <div class="flex flex-wrap gap-2">
                                <button v-for="tag in blueprint.tags" :key="tag.id" type="button"
                                    class="px-3 py-1.5 rounded-full border border-cool-gray-30 dark:border-cool-gray-70 text-sm hover:bg-cool-gray-10 dark:hover:bg-cool-gray-80 transition-colors"
                                    @click="navigateToTag(tag)">
                                    {{ tag.name }}
                                </button>
                            </div>
                        </div>
                        <hr>
                        <div>
                            <h3 class="text-lg font-semibold mb-2.5">Facilities Used</h3>
                            <div v-if="blueprint.facilities?.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div v-for="facility in blueprint.facilities" :key="facility.id"
                                    class="flex items-center gap-4 rounded-2xl border border-cool-gray-20 dark:border-cool-gray-80 p-4">
                                    <img :src="buildFacilityIcon(facility)" :alt="facility.name"
                                        class="w-16 h-16 object-contain rounded-lg bg-cool-gray-5" />
                                    <div>
                                        <p class="font-semibold text-cool-gray-95 dark:text-white">{{ facility.name }}
                                        </p>
                                        <p class="text-sm text-cool-gray-60">x{{ facility.quantity }}</p>
                                    </div>
                                </div>
                            </div>
                            <p v-else class="text-sm text-muted-foreground">No facilities provided.</p>
                        </div>

                        <div>
                            <h3 class="text-lg font-semibold mb-2.5">Input Products</h3>
                            <div v-if="blueprint.item_inputs?.length" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div v-for="item in blueprint.item_inputs" :key="item.id"
                                    class="rounded-2xl border border-cool-gray-20 dark:border-cool-gray-80 p-4 flex flex-col items-center text-center gap-3">
                                    <img :src="buildItemIcon(item)" :alt="item.name"
                                        class="w-16 h-16 object-contain rounded-lg bg-cool-gray-5" />
                                    <div>
                                        <p class="font-medium text-cool-gray-95 dark:text-white">{{ item.name }}</p>
                                        <p class="text-sm text-cool-gray-60">x{{ item.quantity }}</p>
                                    </div>
                                </div>
                            </div>
                            <p v-else class="text-sm text-muted-foreground">No input products provided.</p>
                        </div>

                        <div>
                            <h3 class="text-lg font-semibold mb-2.5">Output Products</h3>
                            <div v-if="blueprint.item_outputs?.length" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div v-for="item in blueprint.item_outputs" :key="item.id"
                                    class="rounded-2xl border border-cool-gray-20 dark:border-cool-gray-80 p-4 flex flex-col items-center text-center gap-3">
                                    <img :src="buildItemIcon(item)" :alt="item.name"
                                        class="w-16 h-16 object-contain rounded-lg bg-cool-gray-5" />
                                    <div>
                                        <p class="font-medium text-cool-gray-95 dark:text-white">{{ item.name }}</p>
                                        <p class="text-sm text-cool-gray-60">x{{ item.quantity }}</p>
                                    </div>
                                </div>
                            </div>
                            <p v-else class="text-sm text-muted-foreground">No output products provided.</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    </div>
</template>