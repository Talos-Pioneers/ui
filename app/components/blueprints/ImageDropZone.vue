<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus, X, GripVertical, ImageIcon } from 'lucide-vue-next'
import { VueDraggable } from 'vue-draggable-plus'
import type { ImageItem } from '~/composables/useImageGallery'

interface Props {
	imageItems: readonly ImageItem[]
	isDragging: boolean
	canAddMore: boolean
	maxImages: number
	thumbnailLabel?: string
	dropText?: string
	dragOrClickText?: string
	addMoreText?: string
}

const props = withDefaults(defineProps<Props>(), {
	thumbnailLabel: 'Thumbnail',
	dropText: 'Drop to upload',
	dragOrClickText: 'Drag & drop images or click to upload',
	addMoreText: 'Add more',
})

const emit = defineEmits<{
	click: []
	remove: [id: string] // Emit ID instead of index for race-condition safety
	reorder: [items: ImageItem[]]
	dragenter: []
	dragleave: []
	drop: [event: DragEvent]
}>()

// Local mutable copy for VueDraggable
const localItems = ref<ImageItem[]>([...props.imageItems])

// Sync from props when imageItems changes externally
watch(
	() => props.imageItems,
	(newItems: readonly ImageItem[]) => {
		localItems.value = [...newItems]
	},
	{ deep: true }
)

// Emit reorder when local items change via drag
const onDragUpdate = () => {
	emit('reorder', [...localItems.value])
}

// Handle drag events with proper prevention
const onDragEnter = (e: DragEvent) => {
	e.preventDefault()
	e.stopPropagation()
	emit('dragenter')
}

const onDragLeave = (e: DragEvent) => {
	e.preventDefault()
	e.stopPropagation()
	emit('dragleave')
}

const onDragOver = (e: DragEvent) => {
	e.preventDefault()
	e.stopPropagation()
}

const onDrop = (e: DragEvent) => {
	e.preventDefault()
	e.stopPropagation()
	emit('drop', e)
}

// Keyboard accessibility for drop zone
const onKeyDown = (e: KeyboardEvent) => {
	if (e.key === 'Enter' || e.key === ' ') {
		e.preventDefault()
		emit('click')
	}
}
</script>

<template>
	<!-- Grid layout that always shows - empty state has just the add cell -->
	<div
		class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
		@dragenter="onDragEnter"
		@dragleave="onDragLeave"
		@dragover="onDragOver"
		@drop="onDrop"
	>
		<!-- Existing images (draggable) -->
		<VueDraggable
			v-model="localItems"
			:animation="200"
			handle=".drag-handle"
			tag="template"
			@update="onDragUpdate"
		>
			<div
				v-for="(element, index) in localItems"
				:key="element.id"
				class="image-item relative group aspect-square rounded-lg overflow-hidden border border-cool-gray-20 dark:border-cool-gray-80 bg-cool-gray-10 dark:bg-cool-gray-90"
			>
				<img
					:src="element.preview"
					:alt="`Image ${index + 1}`"
					class="absolute inset-0 w-full h-full object-cover"
					loading="lazy"
				/>
				
				<!-- Hover overlay with actions -->
				<div
					class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
				>
					<button
						type="button"
						class="drag-handle cursor-grab active:cursor-grabbing p-2 bg-white/90 rounded hover:bg-white transition-colors"
						aria-label="Drag to reorder"
						@mousedown.stop
					>
						<GripVertical class="size-4 text-cool-gray-90" />
					</button>
					<button
						type="button"
						class="remove-button p-2 bg-white/90 rounded hover:bg-white transition-colors"
						aria-label="Remove image"
						@click.stop="emit('remove', element.id)"
					>
						<X class="size-4 text-cool-gray-90" />
					</button>
				</div>
				
				<!-- Thumbnail badge -->
				<div
					v-if="index === 0"
					class="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded z-10"
				>
					{{ thumbnailLabel }}
				</div>
			</div>
		</VueDraggable>

		<!-- Add more cell (drop zone + click to upload) - shows when can add more -->
		<div
			v-if="canAddMore"
			role="button"
			tabindex="0"
			:aria-label="imageItems.length === 0 ? dragOrClickText : addMoreText"
			class="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-all"
			:class="[
				isDragging
					? 'border-primary bg-primary/10 scale-[1.02]'
					: 'border-cool-gray-30 dark:border-cool-gray-70 hover:border-primary hover:bg-primary/5',
			]"
			@click="emit('click')"
			@keydown="onKeyDown"
		>
			<div class="text-center pointer-events-none p-4">
				<div v-if="isDragging" class="animate-pulse">
					<ImageIcon class="size-8 mx-auto mb-2 text-primary" />
					<p class="text-xs text-primary font-medium">
						{{ dropText }}
					</p>
				</div>
				<div v-else>
					<Plus class="size-8 mx-auto mb-2 text-cool-gray-50" />
					<p class="text-xs text-cool-gray-60">
						{{ imageItems.length === 0 ? dragOrClickText : addMoreText }}
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
