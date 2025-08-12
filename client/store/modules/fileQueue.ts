import { Module } from 'vuex';
import { QueuedFile, FileStatus } from '~/types/file';

export interface FileQueueState {
  queuedFiles: QueuedFile[];
  isUploading: boolean;
}

export interface FileQueueModuleState extends FileQueueState {}

const fileQueueModule: Module<FileQueueModuleState, any> = {
  namespaced: true,
  
  state: (): FileQueueModuleState => ({
    queuedFiles: [],
    isUploading: false,
  }),

  getters: {
    hasQueuedFiles: (state) => state.queuedFiles.length > 0,
    queuedFilesCount: (state) => state.queuedFiles.length,
    pendingFiles: (state) => state.queuedFiles.filter(file => file.status === 'pending'),
    uploadingFiles: (state) => state.queuedFiles.filter(file => file.status === FileStatus.UPLOADING),
    failedFiles: (state) => state.queuedFiles.filter(file => file.status === FileStatus.ERROR),
    canUpload: (state) => state.queuedFiles.length > 0 && !state.isUploading,
    uploadProgress: (state) => {
      if (state.queuedFiles.length === 0) return 0;
      const totalProgress = state.queuedFiles.reduce((sum, file) => sum + file.progress, 0);
      return Math.round(totalProgress / state.queuedFiles.length);
    },
    queuedFiles: (state) => state.queuedFiles, // Added for progress simulation
  },

  mutations: {
    ADD_QUEUED_FILE(state, file: QueuedFile) {
      state.queuedFiles.push(file);
    },
    
    REMOVE_QUEUED_FILE(state, fileId: string) {
      state.queuedFiles = state.queuedFiles.filter(file => file.id !== fileId);
    },
    
    CLEAR_QUEUE(state) {
      state.queuedFiles = [];
    },
    
    UPDATE_QUEUED_FILE_STATUS(state, { fileId, status, progress, error }: {
      fileId: string;
      status: QueuedFile['status'];
      progress?: number;
      error?: string;
    }) {
      const file = state.queuedFiles.find(f => f.id === fileId);
      if (file) {
        file.status = status;
        if (progress !== undefined) file.progress = progress;
        if (error !== undefined) file.error = error;
      }
    },

    SET_UPLOADING(state, isUploading: boolean) {
      state.isUploading = isUploading;
    },
  },

  actions: {
    async addFilesToQueue({ commit, dispatch }, files: File[]) {
      try {
        const queuedFiles = await Promise.all(
          files.map(file => dispatch('createQueuedFile', file))
        );
        
        queuedFiles.forEach(file => commit('ADD_QUEUED_FILE', file));
        
        return { success: true, count: files.length };
      } catch (error) {
        throw error;
      }
    },

    async createQueuedFile({ commit, dispatch }, file: File): Promise<QueuedFile> {
      const id = `${Date.now()}-${Math.random()}`;
      const preview = await dispatch('generateFilePreview', file);

      return {
        id,
        file,
        preview,
        status: FileStatus.PENDING,
        progress: 0,
        error: undefined,
      };
    },

    async generateFilePreview({ commit }, file: File): Promise<string> {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        return '';
      }

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
    },

    removeFromQueue({ commit }, fileId: string) {
      commit('REMOVE_QUEUED_FILE', fileId);
    },

    clearQueue({ commit }) {
      commit('CLEAR_QUEUE');
    },

    updateFileStatus({ commit }, { fileId, status, progress, error }: {
      fileId: string;
      status: QueuedFile['status'];
      progress?: number;
      error?: string;
    }) {
      commit('UPDATE_QUEUED_FILE_STATUS', { fileId, status, progress, error });
    },

    startProgressSimulation({ commit, getters }, fileId: string): number {
      return setInterval(() => {
        const file = getters.queuedFiles.find((f: QueuedFile) => f.id === fileId);
        if (file && file.progress < 90) {
          commit('UPDATE_QUEUED_FILE_STATUS', { 
            fileId, 
            progress: file.progress + Math.random() * 10
          });
        }
      }, 100) as unknown as number;
    },

    completeFileUpload({ commit, dispatch }, { fileId, progressInterval }: {
      fileId: string;
      progressInterval: number;
    }) {
      clearInterval(progressInterval);
      
      commit('UPDATE_QUEUED_FILE_STATUS', { 
        fileId, 
        status: FileStatus.SUCCESS, 
        progress: 100 
      });

      // Remove from queue after delay
      setTimeout(() => {
        dispatch('removeFromQueue', fileId);
      }, 2000);
    },

    setUploading({ commit }, isUploading: boolean) {
      commit('SET_UPLOADING', isUploading);
    },
  },
};

export default fileQueueModule;
