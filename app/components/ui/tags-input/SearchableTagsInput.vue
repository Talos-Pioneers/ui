<script setup lang="ts">
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
  useFilter
} from 'reka-ui'
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText
} from '@/components/ui/tags-input'

import {computed, ref, watch} from 'vue'
import {Button} from "~/components/ui/button";
import {ChevronDown} from "lucide-vue-next";
import {cn} from "~/lib/utils";
import CheckmarkIcon from "~/components/icons/CheckmarkIcon.vue";

interface SearchableOption {
  value: string
  label: string
  icon?: string | null
}

const props = withDefaults(defineProps<{
  options: SearchableOption[]
  placeholder?: string
  class?: string
  displayTags?: boolean
}>(), {
  displayTags: true
})

const {contains} = useFilter({sensitivity: 'base'})

const query = ref('')

const modelValue = defineModel<string[]>({default: []})

const filteredOptions = computed(() =>
    query.value === ''
        ? props.options
        : props.options.filter(option => contains(option.label, query.value)),
)

</script>
<template>
  <ComboboxRoot v-model="modelValue" multiple ignore-filter :class="cn('relative', props.class)">
    <ComboboxAnchor>
      <TagsInput v-model="modelValue" delimiter="">
        <template v-if="props.displayTags">
          <TagsInputItem v-for="item in modelValue" :key="item.toString()" :value="item.toString()">
            <span class="py-0.5 px-2 text-sm rounded bg-transparent">{{
                props.options.find(opt => opt.value ===
                    item)?.label ?? "balls"
              }}</span>
            <!-- turns out you can just not use TagsInputItemText lol -->
            <TagsInputItemDelete/>
          </TagsInputItem>
        </template>

        <ComboboxInput v-model="query" as-child>
          <TagsInputInput :placeholder="placeholder ?? 'Search...'"
                          class="focus:outline-none flex-1 rounded !bg-transparent px-1" @keydown.enter.prevent/>
        </ComboboxInput>

        <ComboboxTrigger as-child>
          <Button size="icon-sm" variant="ghost" class="order-last self-start ml-auto before:hidden" type="button">
            <ChevronDown class="size-3.5"/>
          </Button>
        </ComboboxTrigger>
      </TagsInput>

    </ComboboxAnchor>

    <ComboboxContent
        class="absolute z-10 w-full max-w-[418px] bg-white rounded will-change-[opacity,transform] border-1 max-h-[300px] mt-2 py-1"
        align-flip prioritize-position>
      <ComboboxViewport class="scroll-py-1 px-1 overflow-x-hidden overflow-y-scroll" style="scrollbar-width: thin;">
        <ComboboxGroup>
          <ComboboxLabel v-if="!(filteredOptions?.length)" class="bg-white px-2 py-1.5 text-sm">
            No results
          </ComboboxLabel>

          <ComboboxItem v-for="(option, index) in filteredOptions" :key="index"
                        class="data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                        :value="option.value" @select="() => { query = '' }">
            <img v-if="option.icon" :src="option.icon" :alt="option.label" class="size-6 object-contain rounded-sm"/>
            <span>
              {{ option.label }}
            </span>
            <ComboboxItemIndicator class="ml-auto inline-flex items-center justify-center">
              <CheckmarkIcon/>
            </ComboboxItemIndicator>
          </ComboboxItem>
        </ComboboxGroup>
      </ComboboxViewport>
    </ComboboxContent>
  </ComboboxRoot>
</template>