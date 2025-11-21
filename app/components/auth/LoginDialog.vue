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
        <div class="relative p-8 pt-12 bg-linear-to-b wave-bg from-cool-gray-10 from-50% to-primary rounded-[0.5rem]">
          <LoginForm />
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
