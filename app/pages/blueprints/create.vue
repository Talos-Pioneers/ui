<script setup lang="ts">
import { Plus, X, GripVertical } from 'lucide-vue-next';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { SearchableTagsInput } from '~/components/ui/tags-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { VueDraggable } from 'vue-draggable-plus';
import { toast } from 'vue-sonner';
import type { Facility } from '~/models/facility';
import type { Item } from '~/models/item';
import type { Tag } from '~/models/tag';
import { versionOptions } from '~/constants/blueprintOptions';

definePageMeta({
    middleware: ['sanctum:auth'],
});

const router = useRouter();
const config = useSanctumConfig();
const sanctumClient = useSanctumClient();

// Form schema matching StoreBlueprintRequest
type Schema = {
    code: string;
    title: string;
    version: string;
    description: string | null;
    tags: number[];
    facilities: Array<{ id: number; quantity: number }>;
    item_inputs: Array<{ id: number; quantity: number }>;
    item_outputs: Array<{ id: number; quantity: number }>;
    gallery: File[];
};

// Initialize form with Precognition
const form = usePrecognitionForm<Schema>('post', '/api/v1/blueprints', {
    code: '',
    title: '',
    version: 'cbt_3',
    description: null,
    tags: [],
    facilities: [],
    item_inputs: [],
    item_outputs: [],
    gallery: [],
});

const state = form.fields;

// Fetch facilities, items, and tags
const { data: facilitiesData } = await useSanctumFetch<{ data: Facility[] }>('/api/v1/facilities');
const { data: itemsData } = await useSanctumFetch<{ data: Item[] }>('/api/v1/items');
const { data: tagsData } = await useSanctumFetch<{ data: Tag[] }>('/api/v1/tags');

const facilities = computed(() => facilitiesData.value?.data ?? []);
const items = computed(() => itemsData.value?.data ?? []);
const tags = computed(() => tagsData.value?.data ?? []);

// Map to options for SearchableTagsInput (using slugs as values)
const facilityOptions = computed(() =>
    facilities.value.map(f => ({ value: f.slug, label: f.name }))
);

const itemOptions = computed(() =>
    items.value.map(i => ({ value: i.slug, label: i.name }))
);

const tagOptions = computed(() =>
    tags.value.map(t => ({ value: t.slug, label: t.name }))
);

// Local state for SearchableTagsInput (using slugs)
const tagsSlugs = ref<string[]>([]);
const facilitiesSlugs = ref<string[]>([]);
const itemInputsSlugs = ref<string[]>([]);
const itemOutputsSlugs = ref<string[]>([]);

// Image upload state - use a reactive object to maintain file-preview mapping
interface ImageItem {
    file: File;
    preview: string;
}

const imageItems = ref<ImageItem[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Handle file selection
const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
        const newFiles = Array.from(target.files);

        // Create previews for new files
        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    imageItems.value.push({
                        file,
                        preview: e.target.result as string,
                    });
                }
            };
            reader.readAsDataURL(file);
        });
    }
    // Reset input
    if (target) {
        target.value = '';
    }
};

// Remove image
const removeImage = (index: number) => {
    imageItems.value.splice(index, 1);
};

// Handle image reordering
const handleImageReorder = (newOrder: ImageItem[]) => {
    imageItems.value = newOrder;
};

// Convert slugs to IDs and prepare form data
const prepareFormData = (): FormData => {
    const formData = new FormData();

    // Basic fields
    formData.append('code', state.code);
    formData.append('title', state.title);
    formData.append('version', state.version);
    if (state.description) {
        formData.append('description', state.description);
    }

    // Convert tag slugs to IDs
    const tagIds = tagsSlugs.value
        .map(slug => tags.value.find(t => t.slug === slug)?.id)
        .filter((id): id is string => id !== undefined)
        .map(id => Number(id));
    tagIds.forEach(id => {
        formData.append('tags[]', String(id));
    });

    // Convert facility slugs to IDs with quantities (default to 1)
    const facilitiesData = facilitiesSlugs.value
        .map(slug => {
            const facility = facilities.value.find(f => f.slug === slug);
            return facility ? { id: Number(facility.id), quantity: 1 } : null;
        })
        .filter((f): f is { id: number; quantity: number } => f !== null);
    facilitiesData.forEach((facility, index) => {
        formData.append(`facilities[${index}][id]`, String(facility.id));
        formData.append(`facilities[${index}][quantity]`, String(facility.quantity));
    });

    // Convert item input slugs to IDs with quantities (default to 1)
    const itemInputsData = itemInputsSlugs.value
        .map(slug => {
            const item = items.value.find(i => i.slug === slug);
            return item ? { id: Number(item.id), quantity: 1 } : null;
        })
        .filter((i): i is { id: number; quantity: number } => i !== null);
    itemInputsData.forEach((item, index) => {
        formData.append(`item_inputs[${index}][id]`, String(item.id));
        formData.append(`item_inputs[${index}][quantity]`, String(item.quantity));
    });

    // Convert item output slugs to IDs with quantities (default to 1)
    const itemOutputsData = itemOutputsSlugs.value
        .map(slug => {
            const item = items.value.find(i => i.slug === slug);
            return item ? { id: Number(item.id), quantity: 1 } : null;
        })
        .filter((i): i is { id: number; quantity: number } => i !== null);
    itemOutputsData.forEach((item, index) => {
        formData.append(`item_outputs[${index}][id]`, String(item.id));
        formData.append(`item_outputs[${index}][quantity]`, String(item.quantity));
    });

    // Add gallery images - Laravel expects gallery[] format
    imageItems.value.forEach((item) => {
        formData.append('gallery[]', item.file);
    });

    return formData;
};

// Submit handler
const submit = async () => {
    try {
        // For file uploads, we need to use FormData directly
        const formData = prepareFormData();

        // Use Sanctum client to submit FormData
        const response = await sanctumClient<{ data: { id: string } }>('/api/v1/blueprints', {
            method: 'POST',
            body: formData,
        });

        toast.success('Blueprint created successfully!');
        router.push(`/blueprints/${response.data.id}`);
    } catch (error: any) {
        const { isValidationError, bag } = useSanctumError(error);

        if (isValidationError) {
            // Precognition will automatically set errors, but we can show a toast
            const firstError = bag[0];
            if (firstError) {
                toast.error(firstError.message || 'Please fix the validation errors.');
            } else {
                toast.error('Please fix the validation errors.');
            }
        } else {
            toast.error('Failed to create blueprint. Please try again.');
        }
    }
};
</script>

<template>
    <div class="wave-bg bg-cool-gray-10 before:bg-size-[400px] min-h-screen">
        <div class="container mx-auto px-4 py-6">
            <div class="max-w-4xl mx-auto">
                <div
                    class="bg-white dark:bg-cool-gray-95 rounded-lg border border-cool-gray-20 dark:border-cool-gray-80 p-6 space-y-6">
                    <h1 class="font-bold text-3xl">Create a blueprint</h1>

                    <form @submit.prevent="submit" class="space-y-6">
                        <!-- Image Upload Section -->
                        <div class="space-y-2">
                            <Label>Images</Label>
                            <div class="space-y-4">
                                <!-- Upload Area -->
                                <div v-if="imageItems.length === 0"
                                    class="border-2 border-dashed border-cool-gray-30 dark:border-cool-gray-70 rounded-lg p-8 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                                    @click="fileInputRef?.click()">
                                    <div class="text-center">
                                        <Plus class="size-12 mx-auto mb-2 text-cool-gray-50" />
                                        <p class="text-sm text-cool-gray-60">Click to upload images</p>
                                    </div>
                                </div>

                                <!-- Image Gallery with Drag and Drop -->
                                <VueDraggable v-if="imageItems.length > 0" v-model="imageItems" :animation="200"
                                    handle=".drag-handle" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                                    @update:model-value="handleImageReorder">
                                    <div v-for="(item, index) in imageItems" :key="index"
                                        class="relative group aspect-square rounded-lg overflow-hidden border border-cool-gray-20 dark:border-cool-gray-80">
                                        <img :src="item.preview" :alt="`Preview ${index + 1}`"
                                            class="w-full h-full object-cover" />
                                        <div
                                            class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                                            <button type="button"
                                                class="drag-handle cursor-grab active:cursor-grabbing p-2 bg-white/90 rounded hover:bg-white transition-colors"
                                                @mousedown.stop>
                                                <GripVertical class="size-4 text-cool-gray-90" />
                                            </button>
                                            <button type="button"
                                                class="p-2 bg-white/90 rounded hover:bg-white transition-colors"
                                                @click="removeImage(index)">
                                                <X class="size-4 text-cool-gray-90" />
                                            </button>
                                        </div>
                                        <div v-if="index === 0"
                                            class="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                            Thumbnail
                                        </div>
                                    </div>
                                </VueDraggable>

                                <!-- Add More Images Button -->
                                <button v-if="imageItems.length > 0" type="button"
                                    class="flex items-center gap-2 px-4 py-2 border border-cool-gray-30 dark:border-cool-gray-70 rounded-lg hover:border-primary transition-colors text-sm"
                                    @click="fileInputRef?.click()">
                                    <Plus class="size-4" />
                                    Add more images
                                </button>

                                <input ref="fileInputRef" type="file" accept="image/*" multiple class="hidden"
                                    @change="handleFileSelect" />

                                <p class="text-xs text-cool-gray-60">
                                    The first image in the gallery will be used as a thumbnail.
                                </p>
                            </div>
                        </div>

                        <!-- Title -->
                        <div class="space-y-2">
                            <Label for="title">Title</Label>
                            <Input id="title" v-model="state.title" placeholder="Title"
                                :aria-invalid="!!form.errors.title" />
                            <p v-if="form.errors.title" class="text-xs text-destructive">
                                {{ form.errors.title }}
                            </p>
                        </div>

                        <!-- Description -->
                        <div class="space-y-2">
                            <Label for="description">Description</Label>
                            <textarea id="description" v-model="state.description" rows="6"
                                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                                placeholder="Description" :aria-invalid="!!form.errors.description" />
                            <p v-if="form.errors.description" class="text-xs text-destructive">
                                {{ form.errors.description }}
                            </p>
                        </div>

                        <!-- Share Code -->
                        <div class="space-y-2">
                            <Label for="code">Share Code</Label>
                            <Input id="code" v-model="state.code" placeholder="Enter blueprint code..."
                                :aria-invalid="!!form.errors.code" />
                            <p v-if="form.errors.code" class="text-xs text-destructive">
                                {{ form.errors.code }}
                            </p>
                        </div>

                        <!-- Version -->
                        <div class="space-y-2">
                            <Label for="version">Version</Label>
                            <Select v-model="state.version">
                                <SelectTrigger id="version">
                                    <SelectValue placeholder="Select a version..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem v-for="option in versionOptions.filter(opt => opt.value)"
                                        :key="option.value" :value="option.value">
                                        {{ option.label }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p v-if="form.errors.version" class="text-xs text-destructive">
                                {{ form.errors.version }}
                            </p>
                        </div>

                        <!-- Tags -->
                        <div class="space-y-2">
                            <Label>Tags</Label>
                            <SearchableTagsInput v-model="tagsSlugs" :options="tagOptions" placeholder="Search..."
                                class="w-full" />
                            <p v-if="form.errors.tags" class="text-xs text-destructive">
                                {{ form.errors.tags }}
                            </p>
                        </div>

                        <!-- Facilities Used -->
                        <div class="space-y-2">
                            <Label>Facilities Used</Label>
                            <SearchableTagsInput v-model="facilitiesSlugs" :options="facilityOptions"
                                placeholder="Search..." class="w-full" />
                            <p v-if="form.errors.facilities" class="text-xs text-destructive">
                                {{ form.errors.facilities }}
                            </p>
                        </div>

                        <!-- Input Products -->
                        <div class="space-y-2">
                            <Label>Input Products</Label>
                            <SearchableTagsInput v-model="itemInputsSlugs" :options="itemOptions"
                                placeholder="Search..." class="w-full" />
                            <p v-if="form.errors.item_inputs" class="text-xs text-destructive">
                                {{ form.errors.item_inputs }}
                            </p>
                        </div>

                        <!-- Output Products -->
                        <div class="space-y-2">
                            <Label>Output Products</Label>
                            <SearchableTagsInput v-model="itemOutputsSlugs" :options="itemOptions"
                                placeholder="Search..." class="w-full" />
                            <p v-if="form.errors.item_outputs" class="text-xs text-destructive">
                                {{ form.errors.item_outputs }}
                            </p>
                        </div>

                        <!-- Submit Button -->
                        <div class="flex justify-end pt-4">
                            <Button type="submit" :disabled="form.processing" class="min-w-[120px]">
                                <span v-if="form.processing">Publishing...</span>
                                <span v-else>Publish</span>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
