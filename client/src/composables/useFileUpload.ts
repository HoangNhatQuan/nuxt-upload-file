import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import { useUploadFile } from '../stores/use-upload-file';

export const useFileUpload = () => {
  const uploadStore = useUploadFile();

  // Destructure store state with reactivity
  const {
    uploadedFiles,
    queuedFiles,
    isUploading,
    isLoading,
    error,
    pendingFilesCount,
    hasQueuedFiles,
    uploadingFilesCount,
    successfulFilesCount,
    errorFilesCount,
  } = storeToRefs(uploadStore);

  // Computed properties for UI logic
  const canUpload = computed(() => {
    return (
      hasQueuedFiles.value && pendingFilesCount.value > 0 && !isUploading.value
    );
  });

  const uploadButtonText = computed(() => {
    if (isUploading.value) return 'Uploading...';
    return `Upload ${pendingFilesCount.value} Files`;
  });

  const hasUploadedFiles = computed(() => uploadedFiles.value.length > 0);

  // File operations
  const addFiles = async (files: File[]) => {
    await uploadStore.addToQueue(files);
  };

  const removeFromQueue = (id: string) => {
    uploadStore.removeFromQueue(id);
  };

  const clearQueue = () => {
    uploadStore.clearQueue();
  };

  const uploadFiles = async () => {
    await uploadStore.uploadQueuedFiles();
  };

  const deleteFile = async (filename: string) => {
    await uploadStore.deleteFile(filename);
  };

  const refreshFiles = async () => {
    await uploadStore.loadFiles();
  };

  const clearError = () => {
    uploadStore.clearError();
  };

  return {
    // State
    uploadedFiles,
    queuedFiles,
    isUploading,
    isLoading,
    error,

    // Computed
    pendingFilesCount,
    hasQueuedFiles,
    uploadingFilesCount,
    successfulFilesCount,
    errorFilesCount,
    canUpload,
    uploadButtonText,
    hasUploadedFiles,

    // Actions
    addFiles,
    removeFromQueue,
    clearQueue,
    uploadFiles,
    deleteFile,
    refreshFiles,
    clearError,
  };
};
