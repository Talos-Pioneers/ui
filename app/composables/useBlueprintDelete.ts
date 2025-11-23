import { toast } from "vue-sonner";
import type { Blueprint } from "~/models/blueprint";

const useBlueprintDelete = async () => {
	const { isAuthenticated } = useSanctumAuth();
	const loginModal = useLoginModal();

	const handleDelete = async (blueprint: Blueprint) => {
		const form = usePrecognitionForm(
			"delete",
			`/api/v1/blueprints/${blueprint.id}`,
			{}
		);
		try {
			await form.submit();
			close();
		} catch (error) {
			const err = useSanctumError(error);
			console.log(err);
			if (err.code === 403 && !isAuthenticated.value) {
				loginModal.open();
				return;
			}

			toast.error("Failed to delete blueprint.");
		}
	};

	return {
		handleDelete,
	};
};

export default useBlueprintDelete;
