<script setup lang="ts">
import type { BlueprintFacility } from '~/models/blueprint';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

defineProps<{
    items: BlueprintFacility[];
}>();

const buildFacilityIcon = (facility: BlueprintFacility) => {
    if (!facility.icon) {
        return '';
    }
    return `https://assets.warfarin.wiki/v2/itemicon/${facility.icon}.png`;
};
</script>

<template>
    <div class="flex flex-wrap gap-3">
        <Tooltip v-for="item in items" :key="item.id">
            <TooltipTrigger as-child>
                <div class="shadow-inner flex items-center justify-center bg-cool-gray-10 rounded-xl p-1">
                    <img
:src="buildFacilityIcon(item)" :alt="item.name"
                        class="w-16 h-16 object-contain rounded-lg bg-cool-gray-5" >
                </div>
            </TooltipTrigger>
            <TooltipContent>
                {{ item.name }}
            </TooltipContent>
        </Tooltip>
    </div>
</template>