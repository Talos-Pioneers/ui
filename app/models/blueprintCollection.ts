export type BlueprintCollection = {
	id: string;
	title: string;
	slug: string;
	description: string;
	status: string;
	creator: {
		id: string;
		name: string;
	} | null;
	blueprints?: BlueprintCollectionBlueprint[];
	blueprints_count?: number;
	created_at: string;
	updated_at: string;
};

export type BlueprintCollectionBlueprint = {
	id: string;
	title: string;
	slug: string;
	code: string;
};
