import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all' +
		'disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring' +
		'focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-no-repeat bg-center bg-cover',
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground hover:bg-primary/60 before:border-foreground/30',
				destructive:
					'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
				outline:
					'border-2 border-input bg-background hover:bg-accent/90 hover:text-accent-foreground',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80 before:border-cool-gray-40',
				ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-11.5 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
				lg: 'h-14 rounded-md px-6 has-[>svg]:px-4',
				icon: 'size-9',
				'responsive-lg': 'p-2.5 sm:p-4',
				'icon-sm': 'size-8',
				'icon-lg': 'size-10',
				'responsive-icon':
					'size-10 nav:h-11.5 nav:w-auto nav:px-4 nav:py-2 nav:has-[>svg]:px-3',
			},
			rounded: {
				default:
					"rounded-full relative before:rounded-full before:absolute before:inset-0 before:content-[''] before:m-[2px] before:border",
				base: 'rounded',
				none: 'rounded-none',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			rounded: 'default',
		},
	}
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
