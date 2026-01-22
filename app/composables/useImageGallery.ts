import { shallowRef, ref, onUnmounted } from 'vue'
import { toast } from 'vue-sonner'

/**
 * Error types for proper tracking (not dependent on i18n strings)
 */
export type FileErrorType = 'invalid_type' | 'too_large' | 'create_url_failed'

/**
 * Image item representing either a new upload or an existing image
 * Uses unique ID for stable identification during async operations
 */
export interface ImageItem {
	id: string // Unique identifier for stable references
	file?: File
	preview: string // Object URL for new files, regular URL for existing
	isExisting: boolean
	url?: string // For existing images
	mediaId?: string // Media ID for existing images
}

/**
 * Options for the image gallery composable
 */
export interface UseImageGalleryOptions {
	/** Maximum number of images allowed (default: 5) */
	maxImages?: number
	/** Maximum file size in bytes (default: 30MB) */
	maxFileSizeBytes?: number
	/** Allowed MIME types */
	allowedMimeTypes?: string[]
	/** Allowed file extensions */
	allowedExtensions?: string[]
	/** i18n translation function */
	t: (key: string, params?: Record<string, unknown>) => string
	/** Callback when gallery changes */
	onGalleryChange?: () => void
	/** Callback for form validation */
	onValidate?: (field: string) => void
	/** Callback to forget form error */
	onForgetError?: (field: string) => void
}

/**
 * Size constants for clarity
 */
const MB = 1024 * 1024

/**
 * Default configuration matching API validation rules
 * NOTE: SVG is intentionally excluded due to XSS vulnerability.
 * SVG files can contain embedded JavaScript that executes when rendered.
 * See: CVE-2025-21616, OWASP File Upload Cheat Sheet
 * If SVG support is needed, sanitize server-side with DOMPurify.
 */
const DEFAULT_MAX_IMAGES = 5
const DEFAULT_MAX_FILE_SIZE_BYTES = 30 * MB // 30MB
const DEFAULT_ALLOWED_MIME_TYPES = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/bmp',
	'image/webp',
]
const DEFAULT_ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']

/**
 * Generate unique ID for image items.
 * Uses crypto.randomUUID() when available (requires secure context/HTTPS).
 * Falls back to timestamp + random for SSR, older browsers, or non-HTTPS.
 */
const generateImageId = (): string => {
	// Check globalThis for SSR compatibility, and verify randomUUID exists
	// Note: crypto.randomUUID requires secure context (HTTPS) in browsers
	if (
		typeof globalThis !== 'undefined' &&
		globalThis.crypto &&
		typeof globalThis.crypto.randomUUID === 'function'
	) {
		try {
			return `img_${globalThis.crypto.randomUUID()}`
		} catch {
			// Falls through to fallback if crypto fails (e.g., non-secure context)
		}
	}
	// Fallback for SSR, older browsers, or non-HTTPS environments
	return `img_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Composable for managing image gallery with drag-and-drop, validation,
 * preview generation, and proper memory management.
 *
 * Features:
 * - URL.createObjectURL for efficient previews (no base64 overhead)
 * - Proper cleanup on unmount only (not on deactivate - DOM stays visible)
 * - File deduplication by name+size+lastModified
 * - Controlled VueDraggable pattern (no direct v-model mutation)
 * - Race-condition-safe removal using unique IDs
 * - Full TypeScript support
 *
 * @example
 * ```vue
 * const { imageItems, isDragging, processFiles, removeImage, ... } = useImageGallery({
 *   t: useI18n().t,
 *   onGalleryChange: () => syncGalleryToForm(),
 * })
 * ```
 */
export function useImageGallery(options: UseImageGalleryOptions) {
	const {
		maxImages = DEFAULT_MAX_IMAGES,
		maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE_BYTES,
		allowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES,
		allowedExtensions = DEFAULT_ALLOWED_EXTENSIONS,
		t,
		onGalleryChange,
		onValidate,
		onForgetError,
	} = options

	// Reactive state - use shallowRef for array since we replace wholesale on reorder
	const imageItems = shallowRef<ImageItem[]>([])
	const isDragging = ref(false)
	const isProcessing = ref(false)
	const fileInputRef = ref<HTMLInputElement | null>(null)

	// Track failed files for UI feedback
	const failedFiles = shallowRef<Array<{ name: string; reason: FileErrorType }>>([])

	// Lifecycle tracking - use object to allow reset
	const lifecycle = { isUnmounted: false }

	/**
	 * Revoke all object URLs to prevent memory leaks.
	 * Only revokes blob: URLs (new uploads), not existing image URLs.
	 * Internal function - not exposed to consumers.
	 */
	const revokeAllObjectURLs = () => {
		imageItems.value.forEach((item) => {
			if (!item.isExisting && item.preview.startsWith('blob:')) {
				URL.revokeObjectURL(item.preview)
			}
		})
	}

	// Cleanup ONLY on unmount - NOT on deactivate!
	// onDeactivated keeps DOM visible, so revoking URLs would show broken images
	onUnmounted(() => {
		lifecycle.isUnmounted = true
		revokeAllObjectURLs()
		// Also clean up any URLs from removed items that weren't revoked yet
		pendingUrlRevocations.forEach((url) => URL.revokeObjectURL(url))
		pendingUrlRevocations.length = 0 // Clear array
	})

	/**
	 * Allowed URL protocols for XSS prevention.
	 * Only these protocols are considered safe for image sources.
	 * NOTE: data: URLs are excluded because they can contain malicious SVGs:
	 * e.g., data:image/svg+xml;base64,... with embedded JavaScript.
	 */
	const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'blob:']

	/**
	 * Allowed hostnames for existing image URLs.
	 * Prevents SSRF attacks by restricting external URLs to known asset domains.
	 * Empty array means all hostnames are allowed (for backward compatibility).
	 */
	const ALLOWED_IMAGE_HOSTNAMES = [
		'assets.warfarin.wiki',
		'cdn.talospioneers.com', // Add your actual CDN domain(s)
		'localhost', // For local development
	]

	/**
	 * Validate that a URL is safe to use as an image source.
	 * Prevents XSS attacks via javascript: or other malicious protocols.
	 * For http/https URLs, also validates against allowed hostnames to prevent SSRF.
	 */
	const isValidImageUrl = (url: string): boolean => {
		if (!url || typeof url !== 'string') return false
		try {
			// Use a base URL for relative URLs
			const parsed = new URL(url, 'https://placeholder.local')
			
			// Check protocol first
			if (!SAFE_URL_PROTOCOLS.includes(parsed.protocol)) {
				return false
			}
			
			// For blob: URLs, always allow (they're local)
			if (parsed.protocol === 'blob:') {
				return true
			}
			
			// For http/https, validate hostname against allowlist
			// This prevents SSRF if URLs are processed server-side
			if (ALLOWED_IMAGE_HOSTNAMES.length > 0) {
				const isAllowedHost = ALLOWED_IMAGE_HOSTNAMES.some(
					(allowed) => parsed.hostname === allowed || parsed.hostname.endsWith(`.${allowed}`)
				)
				if (!isAllowedHost) {
					console.warn(`Image URL hostname not in allowlist: ${parsed.hostname}`)
					return false
				}
			}
			
			return true
		} catch {
			// Invalid URL format
			return false
		}
	}

	/**
	 * Generate a unique key for file deduplication.
	 * Uses name + size + lastModified for collision resistance.
	 * Note: This can be bypassed by renaming files - content hashing would be
	 * more robust but too expensive for client-side use.
	 */
	const getFileKey = (file: File): string => {
		return `${file.name}:${file.size}:${file.lastModified}`
	}

	/**
	 * Check if a file already exists in a given items array.
	 * Accepts items array to allow checking against in-progress batch additions.
	 */
	const isDuplicateIn = (file: File, items: ImageItem[]): boolean => {
		const key = getFileKey(file)
		return items.some((item) => {
			if (item.file) {
				return getFileKey(item.file) === key
			}
			return false
		})
	}

	/**
	 * Validate a single file.
	 * Returns error type enum for proper tracking (not dependent on i18n).
	 */
	const validateFile = (file: File): { valid: boolean; errorType?: FileErrorType; errorMessage?: string } => {
		// Check file type by MIME type
		if (!allowedMimeTypes.includes(file.type)) {
			const extension = file.name.split('.').pop()?.toLowerCase()
			if (!extension || !allowedExtensions.includes(extension)) {
				return {
					valid: false,
					errorType: 'invalid_type',
					errorMessage: t('pages.blueprints.gallery.invalidFileType', {
						name: file.name,
						types: allowedExtensions.join(', '),
					}),
				}
			}
		}

		// Check file size
		if (file.size > maxFileSizeBytes) {
			const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
			const maxMB = (maxFileSizeBytes / (1024 * 1024)).toFixed(0)
			return {
				valid: false,
				errorType: 'too_large',
				errorMessage: t('pages.blueprints.gallery.fileTooLarge', {
					name: file.name,
					size: sizeMB,
					max: maxMB,
				}),
			}
		}

		return { valid: true }
	}

	/**
	 * Process and add valid files to the gallery.
	 * Uses URL.createObjectURL for efficient, synchronous preview generation.
	 * Batches error notifications to prevent toast spam.
	 * Tracks error types by enum (not i18n strings) for reliable categorization.
	 */
	const processFiles = (files: File[]) => {
		// Guard against operations after unmount
		if (lifecycle.isUnmounted) return

		isProcessing.value = true
		failedFiles.value = [] // Reset failed files

		const remainingSlots = maxImages - imageItems.value.length

		if (remainingSlots <= 0) {
			toast.error(t('pages.blueprints.gallery.maxImagesReached', { max: maxImages }))
			isProcessing.value = false
			return
		}

		const filesToProcess = files.slice(0, remainingSlots)
		const errors: string[] = []
		const newFailedFiles: Array<{ name: string; reason: FileErrorType }> = []
		let duplicateCount = 0
		let skippedCount = 0

		if (files.length > remainingSlots) {
			skippedCount = files.length - remainingSlots
		}

		// Build new array to trigger shallowRef reactivity
		const newItems = [...imageItems.value]

		filesToProcess.forEach((file) => {
			// Check for duplicates against BOTH existing items AND items being added in this batch
			// This prevents the same file dropped twice in one drag from being added twice
			if (isDuplicateIn(file, newItems)) {
				duplicateCount++
				return
			}

			const validation = validateFile(file)
			if (!validation.valid) {
				errors.push(validation.errorMessage!)
				newFailedFiles.push({ name: file.name, reason: validation.errorType! })
				return
			}

			// Use URL.createObjectURL with error handling
			try {
				const objectUrl = URL.createObjectURL(file)
				newItems.push({
					id: generateImageId(),
					file,
					preview: objectUrl,
					isExisting: false,
				})
			} catch (err) {
				// createObjectURL can fail in edge cases (storage quota, revoked file handle)
				console.error('Failed to create object URL for file:', file.name, err)
				errors.push(t('pages.blueprints.gallery.createUrlFailed', {
					name: file.name,
				}))
				newFailedFiles.push({ name: file.name, reason: 'create_url_failed' })
			}
		})

		// Update array (triggers shallowRef reactivity)
		imageItems.value = newItems
		failedFiles.value = newFailedFiles

		// Guard against operations after unmount (async boundary)
		if (lifecycle.isUnmounted) {
			isProcessing.value = false
			return
		}

		// Notify of changes
		onGalleryChange?.()

		// Batched notifications to prevent toast spam
		const notifications: string[] = []

		if (skippedCount > 0) {
			notifications.push(
				t('pages.blueprints.gallery.someImagesSkipped', {
					skipped: skippedCount,
					max: maxImages,
				})
			)
		}

		if (duplicateCount > 0) {
			notifications.push(
				t('pages.blueprints.gallery.duplicatesSkipped', { count: duplicateCount })
			)
		}

		// Combine ALL feedback into a single toast to prevent spam
		// Priority: errors > warnings
		if (errors.length > 0) {
			// Build combined message with errors first, then warnings
			const displayErrors = errors.slice(0, 3)
			const moreCount = errors.length - 3
			let message = displayErrors.join('\n')
			if (moreCount > 0) {
				message += `\n${t('pages.blueprints.gallery.andMoreErrors', { count: moreCount })}`
			}
			if (notifications.length > 0) {
				message += `\n\n${notifications.join(' ')}`
			}
			toast.error(message)
		} else if (notifications.length > 0) {
			// Only warnings, no errors
			toast.warning(notifications.join(' '))
		}

		// Trigger form validation
		onValidate?.('gallery')
		isProcessing.value = false
	}

	/**
	 * Handle file selection from input element
	 */
	const handleFileSelect = (event: Event) => {
		const target = event.target as HTMLInputElement
		if (target.files) {
			processFiles(Array.from(target.files))
		}
		// Reset input to allow re-selecting the same file
		if (target) {
			target.value = ''
		}
	}

	/**
	 * Check if a drag event is from external files (not internal VueDraggable reordering)
	 */
	const isExternalFileDrag = (e: DragEvent): boolean => {
		if (!e.dataTransfer) return false
		return Array.from(e.dataTransfer.types).includes('Files')
	}

	/**
	 * Handle drag enter event
	 */
	const handleDragEnter = (e: DragEvent) => {
		if (!isExternalFileDrag(e)) return
		e.preventDefault()
		e.stopPropagation()
		isDragging.value = true
	}

	/**
	 * Handle drag leave event
	 */
	const handleDragLeave = (e: DragEvent) => {
		if (!isExternalFileDrag(e)) return
		e.preventDefault()
		e.stopPropagation()
		// Only set to false if leaving the drop zone entirely
		const relatedTarget = e.relatedTarget as Node | null
		const currentTarget = e.currentTarget as Node
		if (!currentTarget.contains(relatedTarget)) {
			isDragging.value = false
		}
	}

	/**
	 * Handle drag over event
	 */
	const handleDragOver = (e: DragEvent) => {
		if (!isExternalFileDrag(e)) return
		e.preventDefault()
		e.stopPropagation()
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'copy'
		}
	}

	/**
	 * Handle drop event
	 */
	const handleDrop = (e: DragEvent) => {
		if (!isExternalFileDrag(e)) return
		e.preventDefault()
		e.stopPropagation()
		isDragging.value = false

		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			const droppedFiles = Array.from(e.dataTransfer.files)
			processFiles(droppedFiles)
		}
	}

	// Track blob URLs that need cleanup - revoked only on clearAll or unmount
	// Revoking on individual removal breaks user interactions (right-click save, etc.)
	// Capped at MAX_PENDING_REVOCATIONS to prevent unbounded memory growth
	const MAX_PENDING_REVOCATIONS = 50
	const pendingUrlRevocations: string[] = [] // Use array for FIFO ordering

	/**
	 * Remove an image from the gallery by its unique ID.
	 * Uses ID instead of index to prevent race conditions when
	 * multiple rapid deletions occur.
	 *
	 * Note: Blob URLs are NOT revoked immediately on removal to preserve
	 * user interactions (right-click save, drag to desktop, etc.).
	 * They are cleaned up on clearAll() or component unmount.
	 */
	const removeImage = (imageId: string) => {
		// Find the item by ID (stable reference)
		const index = imageItems.value.findIndex((item) => item.id === imageId)
		if (index === -1) return // Already removed

		const item = imageItems.value[index]

		// Track blob URL for later cleanup (on clearAll or unmount)
		// Uses FIFO eviction when exceeding MAX_PENDING_REVOCATIONS to prevent unbounded growth
		if (!item?.isExisting && item?.preview?.startsWith('blob:')) {
			// Evict oldest URLs if at capacity (FIFO)
			while (pendingUrlRevocations.length >= MAX_PENDING_REVOCATIONS) {
				const oldestUrl = pendingUrlRevocations.shift()
				if (oldestUrl) URL.revokeObjectURL(oldestUrl)
			}
			pendingUrlRevocations.push(item.preview)
		}

		// Remove from array and create new reference (triggers shallowRef reactivity)
		const newItems = [...imageItems.value]
		newItems.splice(index, 1)
		imageItems.value = newItems
		onGalleryChange?.()
		onForgetError?.('gallery')
	}

	/**
	 * Remove an image by index (legacy support).
	 * Converts index to ID for race-condition-safe removal.
	 * @deprecated Use removeImage(id) instead for race-condition safety
	 */
	const removeImageByIndex = (index: number) => {
		const item = imageItems.value[index]
		if (item) {
			removeImage(item.id)
		}
	}

	/**
	 * Handler for VueDraggable reorder events.
	 * Note: vue-draggable-plus mutates the array in-place before emitting.
	 * We create a new array reference to ensure shallowRef reactivity.
	 */
	const onImageReorder = (newOrder: ImageItem[]) => {
		// Create new array reference for shallowRef reactivity
		imageItems.value = [...newOrder]
		onGalleryChange?.()
	}

	/**
	 * Initialize gallery with existing images (for edit mode).
	 * Validates input, enforces maxImages limit, and checks URL safety.
	 */
	const initializeWithExisting = (
		existingImages: Array<{ url: string; thumbnail?: string; id?: string }>
	) => {
		// Reset state for fresh initialization
		failedFiles.value = []
		pendingUrlRevocations.length = 0 // Clear array

		// Enforce maxImages limit to prevent API bugs from corrupting state
		const limitedImages = existingImages.slice(0, maxImages)

		if (existingImages.length > maxImages) {
			console.warn(
				`initializeWithExisting received ${existingImages.length} images, limiting to ${maxImages}`
			)
		}

		imageItems.value = limitedImages
			.filter((img) => {
				const url = img.url || img.thumbnail
				// Validate that image has a URL
				if (!url) {
					console.warn('Skipping image with no URL:', img)
					return false
				}
				// Validate URL protocol for XSS prevention
				if (!isValidImageUrl(url)) {
					console.warn('Skipping image with unsafe URL protocol:', url)
					return false
				}
				return true
			})
			.map((img) => ({
				id: img.id ? `existing_${img.id}` : generateImageId(),
				preview: img.url || img.thumbnail || '',
				url: img.url,
				isExisting: true,
				mediaId: img.id,
			}))
	}

	/**
	 * Get only new files (for form submission)
	 */
	const getNewFiles = (): File[] => {
		return imageItems.value
			.filter((item) => !item.isExisting && item.file)
			.map((item) => item.file!)
	}

	/**
	 * Get all files including existing (for display purposes)
	 */
	const getAllFiles = (): File[] => {
		return imageItems.value.filter((item) => item.file).map((item) => item.file!)
	}

	/**
	 * Clear all images from the gallery and revoke all blob URLs.
	 */
	const clearAll = () => {
		// Collect all blob URLs from current items
		const urlsToRevoke = imageItems.value
			.filter((item) => !item.isExisting && item.preview.startsWith('blob:'))
			.map((item) => item.preview)

		// Clear state
		imageItems.value = []
		failedFiles.value = []
		onGalleryChange?.()

		// Revoke all blob URLs (current items + previously removed items)
		urlsToRevoke.forEach((url) => URL.revokeObjectURL(url))
		pendingUrlRevocations.forEach((url) => URL.revokeObjectURL(url))
		pendingUrlRevocations.length = 0 // Clear array
	}

	/**
	 * Check if gallery can accept more images
	 */
	const canAddMore = (): boolean => {
		return imageItems.value.length < maxImages
	}

	/**
	 * Get remaining slots count
	 */
	const remainingSlots = (): number => {
		return Math.max(0, maxImages - imageItems.value.length)
	}

	return {
		// State
		imageItems,
		isDragging,
		isProcessing,
		fileInputRef,
		failedFiles, // Track files that failed to process for UI feedback

		// Configuration
		maxImages,
		allowedExtensions,

		// File operations
		processFiles,
		handleFileSelect,
		removeImage,
		removeImageByIndex, // Legacy support
		clearAll,
		initializeWithExisting,
		getNewFiles,
		getAllFiles,
		canAddMore,
		remainingSlots,

		// Drag-and-drop handlers
		handleDragEnter,
		handleDragLeave,
		handleDragOver,
		handleDrop,

		// VueDraggable handler
		onImageReorder,
	}
}
