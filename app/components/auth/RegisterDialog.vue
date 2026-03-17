<script setup lang="ts">
import { Dialog, DialogContent } from '~/components/ui/dialog'
import RegisterForm from './RegisterForm.vue'
import { useRegisterModal } from '~/composables/useRegisterModal'
import { useLoginModal } from '~/composables/useLoginModal'

const { isOpen, close } = useRegisterModal()
const { open: openLogin } = useLoginModal()
const route = useRoute()

const handleSwitchToLogin = () => {
  close()
  openLogin()
}

watch(() => route.path, () => {
  if (isOpen.value) close()
})
</script>

<template>
    <Dialog :open="isOpen" @update:open="(val) => !val && close()">
        <DialogContent class="login-dialog p-0 border-0 bg-transparent shadow-none max-w-md w-full">
            <div class="relative rounded-lg overflow-hidden">
                <div
                    class="relative px-10 pb-8 pt-12 wave-bg login-modal-bg rounded-[0.5rem]">
                    <RegisterForm @switch-to-login="handleSwitchToLogin" @navigate-away="close()" />
                </div>
            </div>
        </DialogContent>
    </Dialog>
</template>

<style>
.login-dialog [data-slot="dialog-close"] {
  background-color: var(--login-close-bg);
  border-color: var(--login-close-border);
  opacity: 1;
}
.login-dialog [data-slot="dialog-close"]:hover {
  opacity: 0.7;
}
.login-dialog [data-slot="dialog-close"] svg {
  color: var(--login-close-icon);
  stroke: var(--login-close-icon);
}
</style>
