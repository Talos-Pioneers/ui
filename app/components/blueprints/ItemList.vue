<script setup lang="ts">
import type { BlueprintItem } from '~/models/blueprint';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

defineProps<{
    items: BlueprintItem[];
}>();

const buildItemIcon = (item: BlueprintItem) => {
    if (!item.icon) {
        return '';
    }
    return `https://assets.warfarin.wiki/v2/itemicon/${item.icon}.png`;
};
</script>

<template>
    <TooltipProvider>
        <div class="flex flex-wrap gap-3">
            <Tooltip v-for="item in items" :key="item.id">
                <TooltipTrigger as-child>
                    <div class="shadow-inner flex items-center justify-center bg-cool-gray-10 rounded-xl p-1">
                        <img
:src="buildItemIcon(item)" :alt="item.name"
                            class="w-16 h-16 object-contain rounded-lg bg-cool-gray-5" >
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    {{ item.name }}
                </TooltipContent>
            </Tooltip>
        </div>
    </TooltipProvider>
</template>