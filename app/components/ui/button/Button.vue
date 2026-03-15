<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from "."
import { Primitive } from "reka-ui"
import { cn } from "@/lib/utils"
import { buttonVariants } from "."
import buttonWaveImage from '@/assets/img/button-waves.png';

interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"]
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
  rounded?: ButtonVariants["rounded"],
  withWave?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
  withWave: true,
})

const showWave = computed(() => props.withWave && props.variant !== 'ghost' && props.variant !== 'link')
</script>

<template>
  <Primitive data-slot="button" :as="as" :as-child="asChild"
    :class="cn(buttonVariants({ variant, size, rounded }), props.class)"
    :style="{ backgroundImage: showWave ? `url(${buttonWaveImage})` : undefined }">
    <slot />
  </Primitive>
</template>
