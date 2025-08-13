import { Module } from 'vuex';
import { apiService } from '~/services/ApiService';
import { UploadedFile } from '~/types/file';

export interface UploadedFilesState {
  uploadedFiles: UploadedFile[];
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export interface UploadedFilesModuleState extends UploadedFilesState {}

const uploadedFilesModule: Module<UploadedFilesModuleState, any> = {
  namespaced: true,
  
  state: (): UploadedFilesModuleState => ({
    uploadedFiles: [],
    isLoading: false,
    error: null,
    success: null,
  }),

  getters: {
    hasUploadedFiles: (state) => state.uploadedFiles.length > 0,
    uploadedFilesCount: (state) => state.uploadedFiles.length,
    hasError: (state) => !!state.error,
    hasSuccess: (state) => !!state.success,
  },

  mutations: {
    SET_UPLOADED_FILES(state, files: UploadedFile[]) {
      state.uploadedFiles = files;
    },
    
    ADD_UPLOADED_FILE(state, file: UploadedFile) {
      state.uploadedFiles.unshift(file);
    },
    
    REMOVE_UPLOADED_FILE(state, filename: string) {
      state.uploadedFiles = state.uploadedFiles.filter(file => file.filename !== filename);
    },

    SET_LOADING(state, isLoading: boolean) {
      state.isLoading = isLoading;
    },

    SET_ERROR(state, error: string | null) {
      state.error = error;
    },
    
    SET_SUCCESS(state, success: string | null) {
      state.success = success;
    },
    
    CLEAR_MESSAGES(state) {
      state.error = null;
      state.success = null;
    },
  },

  actions: {
    async loadFiles({ commit }) {
      commit('SET_LOADING', true);
      commit('CLEAR_MESSAGES');

      try {
        const files = await apiService.getFiles();
        commit('SET_UPLOADED_FILES', files);
      } catch (error) {
        commit('SET_UPLOADED_FILES', []);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async deleteFile({ commit }, filename: string) {
      try {
        await apiService.deleteFile(filename);
        commit('REMOVE_UPLOADED_FILE', filename);
        commit('SET_SUCCESS', 'File deleted successfully!');
      } catch (error) {
        commit('SET_ERROR', 'Failed to delete file');
        throw error;
      }
    },

    clearError({ commit }) {
      commit('SET_ERROR', null);
    },

    clearSuccess({ commit }) {
      commit('SET_SUCCESS', null);
    },

    clearMessages({ commit }) {
      commit('CLEAR_MESSAGES');
    },

    setError({ commit }, error: string) {
      commit('SET_ERROR', error);
    },

    setSuccess({ commit }, success: string) {
      commit('SET_SUCCESS', success);
    },
  },
};

export default uploadedFilesModule;
