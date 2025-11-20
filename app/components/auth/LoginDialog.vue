<script setup lang="ts">
import { Dialog, DialogContent } from '~/components/ui/dialog'
import LoginForm from './LoginForm.vue'
import CloseIcon from '~/components/icons/CloseIcon.vue'
import { useLoginModal } from '~/composables/useLoginModal'
import buttonWaveImage from '@/assets/img/button-waves.png'

const { isOpen, close } = useLoginModal()
</script>

<template>
  <Dialog :open="isOpen" @update:open="(val) => !val && close()">
    <DialogContent class="p-0 border-0 bg-transparent shadow-none max-w-md w-full">
      <div class="relative rounded-lg overflow-hidden">
        <!-- Top half - light grey with wave pattern -->
        <!-- <div class="absolute top-0 left-0 right-0 h-1/2 bg-[#F5F5F3] dark:bg-[#1a1a1a]" :style="{
          backgroundImage: `url(${buttonWaveImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
        }"></div> -->

        <!-- Bottom half - cyan with wave pattern -->
        <!-- <div class="absolute bottom-0 left-0 right-0 h-1/2 bg-[#00D9FF]" :style="{
          backgroundImage: `url(${buttonWaveImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
        }"></div> -->

        <!-- Content with padding -->
        <div class="relative p-8 pt-12 bg-white rounded">
          <LoginForm />
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
