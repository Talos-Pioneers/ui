<script setup lang="ts">
import {
	ComboboxAnchor,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxItemIndicator,
	ComboboxPortal,
	ComboboxRoot,
	ComboboxTrigger,
	ComboboxViewport,
	ComboboxVirtualizer,
	useFilter,
} from 'reka-ui'
import {
	TagsInput,
	TagsInputInput,
	TagsInputItem,
	TagsInputItemDelete,
	TagsInputItemText,
} from '@/components/ui/tags-input'

import { computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import CheckmarkIcon from '~/components/icons/CheckmarkIcon.vue'

interface SearchableOption {
	value: string
	label: string
	icon?: string | null
	category?: string
}

const props = withDefaults(
	defineProps<{
		options: SearchableOption[]
		placeholder?: string
		class?: string
		displayTags?: boolean
		withPattern?: boolean
		clearQueryOnSelect?: boolean
	}>(),
	{
		displayTags: true,
		withPattern: false,
		clearQueryOnSelect: true,
	}
)

const { contains } = useFilter({ sensitivity: 'base' })

const query = defineModel<string>('query', { default: '' })

const modelValue = defineModel<string[]>({ default: [] })

const filteredOptions = computed(() => {
	const queryOption = {
		value: 'search:' + query.value,
		label: query.value,
		icon: null,
		category: 'Search',
	}
	return query.value === ''
		? props.options
		: [
				queryOption,
				...props.options.filter(
					(option) =>
						contains(option.label, query.value) ||
						(option.category &&
							contains(option.category, query.value))
				),
			]
})
</script>
<template>
	<ComboboxRoot
		v-model="modelValue"
		multiple
		ignore-filter
		open-on-click
		:class="cn('relative', props.class)"
	>
		<ComboboxAnchor>
			<TagsInput
				v-model="modelValue"
				delimiter=""
				:with-pattern="props.withPattern"
				class="px-3 py-2 min-h-10.5 [&_svg:not([class*='text-'])]:text-muted-foreground"
			>
				<template v-if="props.displayTags">
					<TagsInputItem
						v-for="item in modelValue"
						:key="item.toString()"
						:value="item.toString()"
					>
						<span
							class="py-0.5 px-2 text-sm rounded bg-transparent"
							>{{
								props.options.find((opt) => opt.value === item)
									?.label ?? item
							}}</span
						>
						<!-- turns out you can just not use TagsInputItemText lol -->
						<TagsInputItemDelete />
					</TagsInputItem>
				</template>

				<ComboboxInput v-model="query" as-child>
					<TagsInputInput
						:placeholder="placeholder ?? 'Search...'"
						class="focus:outline-none flex-1 bg-transparent px-0 placeholder:text-muted-foreground"
						@keydown.enter.prevent
					/>
				</ComboboxInput>

				<ComboboxTrigger
					class="group order-last self-center ml-auto shrink-0"
					tabindex="-1"
				>
					<ChevronDown
						class="size-4 opacity-50 transition-transform duration-150 group-data-[state=open]:rotate-180"
					/>
				</ComboboxTrigger>
			</TagsInput>
		</ComboboxAnchor>

		<ComboboxPortal>
			<ComboboxContent
				position="popper"
				body-lock
				disable-outside-pointer-events
				class="z-50 w-[var(--reka-combobox-trigger-width)] bg-popover text-popover-foreground rounded-none border py-1 shadow-md overflow-hidden"
				:side-offset="4"
			>
				<ComboboxViewport
					class="max-h-[300px] scroll-py-1 px-1 overflow-x-hidden overflow-y-auto"
					style="scrollbar-width: thin"
				>
					<p
						v-if="!filteredOptions.length"
						class="px-2 py-1.5 text-sm text-muted-foreground"
					>
						No results
					</p>
					<ComboboxVirtualizer
						v-else
						v-slot="{ option }"
						:options="filteredOptions"
						:text-content="(opt: any) => opt.label"
						:estimate-size="36"
					>
						<ComboboxItem
							class="w-full data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
							:value="option.value"
							@select="
								() => {
									if (props.clearQueryOnSelect) {
										query = ''
									}
								}
							"
						>
							<img
								v-if="option.icon"
								:src="option.icon"
								:alt="option.label"
								class="size-6 object-contain rounded-sm"
							/>
							<span class="truncate">
								{{ option.label }}
							</span>
							<span
								v-if="option.category"
								class="shrink-0 text-[10px] leading-none px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
							>
								{{ option.category }}
							</span>
							<ComboboxItemIndicator
								class="ml-auto inline-flex items-center justify-center"
							>
								<CheckmarkIcon />
							</ComboboxItemIndicator>
						</ComboboxItem>
					</ComboboxVirtualizer>
				</ComboboxViewport>
			</ComboboxContent>
		</ComboboxPortal>
	</ComboboxRoot>
</template>
