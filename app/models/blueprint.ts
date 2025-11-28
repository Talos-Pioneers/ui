export type Blueprint = {
	id: string
	code: string
	title: string
	slug: string
	version: string
	description: string
	status: string
	region: string | null
	server_region?: string | null
	facilities?: BlueprintFacility[]
	item_inputs?: BlueprintItem[]
	item_outputs?: BlueprintItem[]
	creator: {
		id: string
		name: string
	} | null
	tags: BlueprintTag[]
	gallery: BlueprintGalleryItem[]
	likes_count: number
	copies_count: number
	comments_count: number
	is_liked: boolean
	permissions: {
		can_edit: boolean
		can_delete: boolean
	}
	created_at: string
	updated_at: string
	is_anonymous?: boolean
}

export type BlueprintFacility = {
	id: string
	slug: string
	name: string
	icon?: string | null
	quantity: number
}

export type BlueprintItem = {
	id: string
	slug: string
	name: string
	icon?: string | null
	quantity: number
}

export type BlueprintTag = {
	id: string
	name: string
	slug: string
	type: string
}

export type BlueprintGalleryItem = {
	id?: string
	thumbnail: string
	url: string
	name: string
}

export type PaginationMeta = {
	current_page: number
	from: number | null
	last_page: number
	per_page: number
	to: number | null
	total: number
}
