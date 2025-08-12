import { Module } from 'vuex';
import { apiService } from '~/services/ApiService';
import { QueuedFile, UploadedFile, FileStatus } from '~/types/file';

export interface UploadServiceState {}

const uploadServiceModule: Module<UploadServiceState, any> = {
  namespaced: true,
  
  state: (): UploadServiceState => ({}),

  getters: {},

  mutations: {},

  actions: {
    async performFileUpload({ commit }, queuedFile: QueuedFile): Promise<UploadedFile> {
      return await apiService.uploadFile(queuedFile.file, {
        description: queuedFile.file.name,
      });
    },

    async uploadSingleFile({ commit, dispatch }, queuedFile: QueuedFile) {
      const fileId = queuedFile.id;
      
      try {
        // Update file status to uploading
        dispatch('fileQueue/updateFileStatus', { 
          fileId, 
          status: FileStatus.UPLOADING, 
          progress: 0 
        }, { root: true });

        const progressInterval = dispatch('fileQueue/startProgressSimulation', fileId, { root: true });
        const uploadedFile = await dispatch('performFileUpload', queuedFile);
        dispatch('fileQueue/completeFileUpload', { fileId, progressInterval }, { root: true });
        
        return uploadedFile;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        // Update file status to error
        dispatch('fileQueue/updateFileStatus', { 
          fileId, 
          status: FileStatus.ERROR, 
          error: errorMessage
        }, { root: true });
        
        throw error;
      }
    },

    async uploadQueuedFiles({ commit, dispatch, getters, rootGetters }) {
      const fileQueueState = rootGetters['fileQueue/queuedFiles'] || [];
      const pendingFiles = rootGetters['fileQueue/pendingFiles'] || [];
      
      const manualPendingFiles = fileQueueState.filter((file: any) => file.status === 'pending');
      const filesToUpload = pendingFiles.length > 0 ? pendingFiles : manualPendingFiles;
      
      if (!filesToUpload || filesToUpload.length === 0) {
        return { success: true, uploaded: 0 };
      }

      dispatch('fileQueue/setUploading', true, { root: true });
      dispatch('uploadedFiles/clearMessages', {}, { root: true });

      try {
        for (const queuedFile of filesToUpload) {
          await dispatch('uploadSingleFile', queuedFile);
        }

        await dispatch('uploadedFiles/loadFiles', {}, { root: true });
        dispatch('uploadedFiles/setSuccess', 'Files uploaded successfully!', { root: true });
        
        return { success: true, uploaded: filesToUpload.length };
      } catch (error) {
        dispatch('uploadedFiles/setError', 'Upload failed', { root: true });
        throw error;
      } finally {
        dispatch('fileQueue/setUploading', false, { root: true });
      }
    },
  },
};

export default uploadServiceModule;
