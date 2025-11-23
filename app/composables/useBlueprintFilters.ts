import type { Facility } from "~/models/facility";
import type { Item } from "~/models/item";
import type { Tag } from "~/models/tag";
import { versionOptions, regionOptions } from "~/constants/blueprintOptions";

const statusOptions = [
	{ value: "draft", label: "Draft" },
	{ value: "published", label: "Published" },
	{ value: "archived", label: "Archived" },
];

export function useBlueprintFilters(
	filters: Ref<Record<string, any>>,
	facilities: ComputedRef<Facility[]>,
	items: ComputedRef<Item[]>,
	tags: ComputedRef<Tag[]>,
	includeStatus = false
) {
	const activeFilterTags = computed(() => {
		const filterTags: Array<{ key: string; value: any }> = [];

		Object.entries(filters.value).forEach(([key, value]) => {
			if (
				value === null ||
				value === "" ||
				(Array.isArray(value) && value.length === 0)
			) {
				return;
			}

			if (key === "status" && includeStatus) {
				const status = statusOptions.find((s) => s.value === value);
				filterTags.push({
					key,
					value:
						status?.label ??
						String(value).charAt(0).toUpperCase() + String(value).slice(1),
				});
				return;
			}

			if (key === "region") {
				const region = regionOptions.find((r) => r.value === value);
				filterTags.push({ key, value: region?.label ?? String(value) });
				return;
			}

			if (key === "version") {
				const version = versionOptions.find((v) => v.value === value);
				filterTags.push({ key, value: version?.label ?? String(value) });
				return;
			}

			if (key === "tags.id" && Array.isArray(value)) {
				for (const item of value) {
					const tag = tags.value.find((t) => t.id == item);
					filterTags.push({ key, value: tag?.name ?? String(item) });
				}
				return;
			}

			if (key === "facility" && Array.isArray(value)) {
				for (const item of value) {
					const facility = facilities.value.find((f) => f.slug == item);
					filterTags.push({ key, value: facility?.name ?? String(item) });
				}
				return;
			}

			if (key === "item_input" && Array.isArray(value)) {
				for (const item of value) {
					const factoryItem = items.value.find((i) => i.slug == item);
					filterTags.push({ key, value: factoryItem?.name ?? String(item) });
				}
				return;
			}

			if (key === "item_output" && Array.isArray(value)) {
				for (const item of value) {
					const factoryItem = items.value.find((i) => i.slug == item);
					filterTags.push({ key, value: factoryItem?.name ?? String(item) });
				}
				return;
			}
		});

		return filterTags;
	});

	return {
		activeFilterTags,
	};
}
