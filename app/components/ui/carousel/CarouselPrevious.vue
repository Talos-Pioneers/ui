<script setup lang="ts">
import type { WithClassAsProps } from './interface'
import type { ButtonVariants } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useCarousel } from './useCarousel'

const props = withDefaults(
	defineProps<
		{
			variant?: ButtonVariants['variant']
			size?: ButtonVariants['size']
		} & WithClassAsProps
	>(),
	{
		variant: 'outline',
		size: 'icon',
	}
)

const { orientation, canScrollPrev, scrollPrev } = useCarousel()
</script>

<template>
	<Button
		data-slot="carousel-previous"
		:disabled="!canScrollPrev"
		:class="
			cn(
				'absolute size-10 rounded-full',
				orientation === 'horizontal'
					? 'top-1/2 -left-12 -translate-y-1/2'
					: '-top-12 left-1/2 -translate-x-1/2 rotate-90',
				props.class
			)
		"
		:variant="variant"
		:size="size"
		@click="scrollPrev"
	>
		<slot>
			<svg
				class="rotate-180"
				width="12"
				height="18"
				viewBox="0 0 12 18"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M3.06733 0L0.660664 2.40667L7.18733 8.93333L0.660664 15.4607L3.06733 17.8673L12 8.93333L3.06733 0Z"
					fill="currentColor"
				/>
			</svg>
			<span class="sr-only">Previous Slide</span>
		</slot>
	</Button>
</template>
