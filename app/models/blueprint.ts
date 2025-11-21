export type Blueprint = {
	id: string;
	code: string;
	title: string;
	slug: string;
	version: string;
	description: string;
	status: string;
	region: string | null;
	facilities?: BlueprintFacility[];
	item_inputs?: BlueprintItem[];
	item_outputs?: BlueprintItem[];
	creator: {
		id: string;
		name: string;
	} | null;
	tags: BlueprintTag[];
	gallery: BlueprintGalleryItem[];
	likes_count: number;
	copies_count: number;
	comments_count: number;
	is_liked: boolean;
	created_at: string;
	updated_at: string;
};

export type BlueprintFacility = {
	id: string;
	slug: string;
	name: string;
	quantity: number;
};

export type BlueprintItem = {
	id: string;
	slug: string;
	name: string;
	quantity: number;
};

export type BlueprintTag = {
	id: string;
	name: string;
	slug: string;
	type: string;
};

export type BlueprintGalleryItem = {
	thumbnail: string;
	url: string;
	name: string;
};
