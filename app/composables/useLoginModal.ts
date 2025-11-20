export const useLoginModal = () => {
  const isOpen = useState('login-modal-open', () => false)

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen: readonly(isOpen),
    open,
    close,
    toggle,
  }
}

