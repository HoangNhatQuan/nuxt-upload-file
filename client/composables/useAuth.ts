import { ref, computed, watch, readonly } from 'vue';
import { authStorage } from '~/utils/authStorage';
import { authService, SignInRequest, SignUpRequest } from '~/services/AuthService';
import { useToast } from '~/composables/useToast';

export interface AuthState {
  username: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  signIn: (request: SignInRequest) => Promise<boolean>;
  signUp: (request: SignUpRequest) => Promise<boolean>;
  signOut: () => void;
  clearError: () => void;
}

export function useAuth() {
  const toast = useToast();
  
  // Reactive state
  const username = ref<string | null>(authStorage.getUsername());
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed properties
  const isAuthenticated = computed(() => username.value !== null);

  // Watch for username changes and sync with storage
  watch(username, (newUsername) => {
    if (newUsername) {
      authStorage.setUsername(newUsername);
    } else {
      authStorage.clear();
    }
  });

  // Actions
  const signIn = async (request: SignInRequest): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authService.signIn(request);
      username.value = response.data.username;
      toast.success('Successfully signed in!');
      return true;
    } catch (err: any) {
      error.value = err.message || 'Sign in failed';
      toast.error(error.value || 'Sign in failed');
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const signUp = async (request: SignUpRequest): Promise<boolean> => {
    isLoading.value = true;
    error.value = '';

    try {
      const response = await authService.signUp(request);
      username.value = response.data.username;
      toast.success('Account created successfully!');
      return true;
    } catch (err: any) {
      error.value = err.message || 'Sign up failed';
      toast.error(error.value || 'Sign up failed');
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const signOut = () => {
    username.value = null;
    error.value = null;
    toast.info('Signed out successfully');
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    username: readonly(username),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Actions
    signIn,
    signUp,
    signOut,
    clearError,
  };
}
