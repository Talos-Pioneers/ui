<script setup lang="ts">
import type { WithClassAsProps } from './interface'
import type { ButtonVariants } from '@/components/ui/button'
import { ArrowRight } from 'lucide-vue-next'
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

const { orientation, canScrollNext, scrollNext } = useCarousel()
</script>

<template>
	<Button
		data-slot="carousel-next"
		:disabled="!canScrollNext"
		:class="
			cn(
				'absolute size-10 rounded-full',
				orientation === 'horizontal'
					? 'top-1/2 -right-12 -translate-y-1/2'
					: '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
				props.class
			)
		"
		:variant="variant"
		:size="size"
		@click="scrollNext"
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
					d="M8.93267 0L11.34 2.40667L4.81333 8.93333L11.34 15.4607L8.93267 17.8673L0 8.93333L8.93267 0Z"
					fill="currentColor"
				/>
			</svg>
			<span class="sr-only">Next Slide</span>
		</slot>
	</Button>
</template>
