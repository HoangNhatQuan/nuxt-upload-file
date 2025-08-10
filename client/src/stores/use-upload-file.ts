import { defineStore } from 'pinia';
import { onMounted, ref } from 'vue';

import type { UploadedFile } from '../apis/api';
import { ApiService } from '../apis/api';

export interface QueuedFile {
  id: string;
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export const useUploadFile = defineStore('upload-file', () => {
  const uploadedFiles = ref<UploadedFile[]>([]);
  const queuedFiles = ref<QueuedFile[]>([]);
  const isUploading = ref(false);
  const error = ref<string | null>(null);
  const isLoading = ref(false);

  // Load existing files
  const loadFiles = async () => {
    isLoading.value = true;
    try {
      const response = await ApiService.getFiles();
      uploadedFiles.value = response.files;
    } catch (err) {
      console.error('Failed to load files:', err);
      error.value = 'Failed to load files';
    } finally {
      isLoading.value = false;
    }
  };

  // Add files to queue
  const addToQueue = (files: File[]) => {
    const newQueuedFiles: QueuedFile[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      status: 'pending',
      progress: 0,
    }));

    // Check for duplicates and handle naming conflicts
    newQueuedFiles.forEach((queuedFile) => {
      const existingFile = uploadedFiles.value.find(
        (uploaded) => uploaded.originalName === queuedFile.file.name,
      );

      if (existingFile) {
        // Generate unique name with suffix
        const nameParts = queuedFile.file.name.split('.');
        const ext = nameParts.pop();
        const baseName = nameParts.join('.');
        queuedFile.file = new File(
          [queuedFile.file],
          `${baseName}_${Date.now()}.${ext}`,
          { type: queuedFile.file.type },
        );
      }
    });

    queuedFiles.value = [...queuedFiles.value, ...newQueuedFiles];
  };

  // Remove file from queue
  const removeFromQueue = (id: string) => {
    queuedFiles.value = queuedFiles.value.filter((qf) => qf.id !== id);
  };

  // Clear all queued files
  const clearQueue = () => {
    queuedFiles.value = [];
  };

  // Upload queued files
  const uploadQueuedFiles = async () => {
    if (queuedFiles.value.length === 0) return;

    isUploading.value = true;
    error.value = null;

    try {
      let hasSuccessfulUploads = false;

      for (const queuedFile of queuedFiles.value) {
        if (queuedFile.status === 'pending') {
          queuedFile.status = 'uploading';
          queuedFile.progress = 0;

          try {
            // Simulate progress
            const progressInterval = setInterval(() => {
              if (queuedFile.progress < 90) {
                queuedFile.progress += Math.random() * 10;
              }
            }, 100);

            const response = await ApiService.uploadFile(queuedFile.file);

            clearInterval(progressInterval);
            queuedFile.progress = 100;
            queuedFile.status = 'success';
            hasSuccessfulUploads = true;
          } catch (err) {
            queuedFile.status = 'error';
            queuedFile.error =
              err instanceof Error ? err.message : 'Upload failed';
          }
        }
      }

      // Refresh the file list only if there were successful uploads
      if (hasSuccessfulUploads) {
        await loadFiles();
      }

      // Remove successful uploads from queue after a delay
      setTimeout(() => {
        queuedFiles.value = queuedFiles.value.filter(
          (qf) => qf.status !== 'success',
        );
      }, 2000);
    } catch (err) {
      console.error('Upload error:', err);
      error.value = err instanceof Error ? err.message : 'Upload failed';
    } finally {
      isUploading.value = false;
    }
  };

  // Delete uploaded file
  const deleteFile = async (filename: string) => {
    try {
      await ApiService.deleteFile(filename);
      uploadedFiles.value = uploadedFiles.value.filter(
        (file) => file.filename !== filename,
      );
    } catch (err) {
      console.error('Delete error:', err);
      error.value = err instanceof Error ? err.message : 'Delete failed';
    }
  };

  // Generate preview for images
  const generatePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        resolve('');
      }
    });
  };

  // Initialize store
  onMounted(() => {
    loadFiles();
  });

  return {
    uploadedFiles,
    queuedFiles,
    isUploading,
    isLoading,
    error,
    loadFiles,
    addToQueue,
    removeFromQueue,
    clearQueue,
    uploadQueuedFiles,
    deleteFile,
    generatePreview,
  };
});
