import { ref } from 'vue';
import { useAuth } from '~/composables/useAuth';

export function useAuthGuard() {
  const { isAuthenticated } = useAuth();
  const showAuthModal = ref(false);

  const requireAuth = (action: () => void | Promise<void>) => {
    if (isAuthenticated.value) {
      return action();
    } else {
      showAuthModal.value = true;
      return Promise.reject(new Error('Authentication required'));
    }
  };

  const closeAuthModal = () => {
    showAuthModal.value = false;
  };

  return {
    showAuthModal,
    requireAuth,
    closeAuthModal,
  };
}
