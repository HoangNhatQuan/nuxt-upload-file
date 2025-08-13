import { authStorage } from '~/utils/authStorage';
import { authService, SignInRequest, SignUpRequest } from '~/services/AuthService';

export interface AuthState {
  username: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  showAuthModal: boolean;
}

export const state = (): AuthState => ({
  username: authStorage.getUsername(),
  isAuthenticated: !!authStorage.getUsername(),
  isLoading: false,
  error: null,
  showAuthModal: false,
});

export const mutations = {
  SET_USERNAME(state: AuthState, username: string | null) {
    state.username = username;
    state.isAuthenticated = !!username;
    
    // Save to storage when username is set
    if (username) {
      authStorage.setUsername(username);
    } else {
      authStorage.clear();
    }
  },
  SET_LOADING(state: AuthState, isLoading: boolean) {
    state.isLoading = isLoading;
  },
  SET_ERROR(state: AuthState, error: string | null) {
    state.error = error;
  },
  CLEAR_ERROR(state: AuthState) {
    state.error = null;
  },
  SET_SHOW_AUTH_MODAL(state: AuthState, show: boolean) {
    state.showAuthModal = show;
  },
};

export const actions = {
  async signIn({ commit }: any, request: SignInRequest) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await authService.signIn(request);
      commit('SET_USERNAME', response.data.username);
      return { success: true };
    } catch (error: any) {
      commit('SET_ERROR', error.message || 'Sign in failed');
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async signUp({ commit }: any, request: SignUpRequest) {
    commit('SET_LOADING', true);
    commit('CLEAR_ERROR');

    try {
      const response = await authService.signUp(request);
      commit('SET_USERNAME', response.data.username);
      return { success: true };
    } catch (error: any) {
      commit('SET_ERROR', error.message || 'Sign up failed');
      return { success: false, error: error.message };
    } finally {
      commit('SET_LOADING', false);
    }
  },

  signOut({ commit }: any) {
    commit('SET_USERNAME', null);
    authStorage.clear();
  },

  clearError({ commit }: any) {
    commit('CLEAR_ERROR');
  },
};

export const getters = {
  username: (state: AuthState) => state.username,
  isAuthenticated: (state: AuthState) => state.isAuthenticated,
  isLoading: (state: AuthState) => state.isLoading,
  error: (state: AuthState) => state.error,
  showAuthModal: (state: AuthState) => state.showAuthModal,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
