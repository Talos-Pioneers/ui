<script setup lang="ts">
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const props = defineProps<{
  items: { value: string, label: string }[]
  placeholder?: string
  emptyText?: string
}>()

const open = ref(false)
const value = defineModel<string | string[]>()

// Helper: whether model is array or not for this session
const isArray = computed(() => Array.isArray(value.value))

// Helper: get selected labels
const selectedLabels = computed(() => {
  if (isArray.value) {
    if (!Array.isArray(value.value)) {
      return []
    }
    // For value as array, show all selected labels joined
    return props.items.filter(item => (value.value as string[]).includes(item.value)).map(i => i.label)
  } else {
    const selected = props.items.find(item => item.value === value.value)
    return selected ? [selected.label] : []
  }
})

function handleSelect(itemValue: string) {
  if (isArray.value) {
    // multi-select
    let arr = Array.isArray(value.value) ? [...value.value] : []
    if (arr.includes(itemValue)) {
      arr = arr.filter(v => v !== itemValue)
    } else {
      arr.push(itemValue)
    }
    value.value = arr
    // Keep popover open for multi-selects
  } else {
    // single select
    value.value = value.value === itemValue ? '' : itemValue
    open.value = false
  }
}

function isChecked(itemValue: string): boolean {
  if (isArray.value) {
    return Array.isArray(value.value) && value.value.includes(itemValue)
  }
  return value.value === itemValue
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="outline" role="combobox" :aria-expanded="open" class="w-[200px] justify-between">
        <span v-if="selectedLabels.length">{{ isArray ? selectedLabels.join(', ') : selectedLabels[0] }}</span>
        <span v-else>{{ placeholder }}</span>
        <ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0">
      <Command>
        <CommandInput :placeholder="placeholder ?? 'Search...'" />
        <CommandList>
          <CommandEmpty>{{ emptyText ?? 'No items found.' }}</CommandEmpty>
          <CommandGroup>
            <CommandItem v-for="item in items" :key="item.value" :value="item.value"
              @select="() => handleSelect(item.value)">
              <CheckIcon :class="cn(
                'mr-2 h-4 w-4',
                isChecked(item.value) ? 'opacity-100' : 'opacity-0',
              )" />
              {{ item.label }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
