export type Comment = {
	id: string;
	comment: string;
	is_approved: boolean;
	is_edited: boolean;
	user: {
		id: string;
		username: string;
	} | null;
	commentable: {
		type: string;
		id: string;
	};
	replies?: Comment[];
	replies_count?: number;
	permissions: {
		can_edit: boolean;
		can_delete: boolean;
	};
	created_at: string;
	updated_at: string;
};
