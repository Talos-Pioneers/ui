export type Tag = {
	id: string;
	name: string;
	slug: string;
	type: string;
	permissions: {
		can_edit: boolean;
		can_delete: boolean;
	};
	created_at: string;
	updated_at: string;
};
