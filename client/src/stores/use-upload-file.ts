import { defineStore } from 'pinia';
import { onMounted } from 'vue';

import { useApi } from '../composables/useApi';
import { useFileUtils } from '../composables/useFileUtils';
import type { UploadedFile, QueuedFile, UploadResult } from '../types/file';
import { FileStatus } from '../types/file';

// Constants
const PROGRESS_UPDATE_INTERVAL = 100;
const PROGRESS_SIMULATION_DELAY = 500;
const SUCCESS_REMOVAL_DELAY = 2000;
const PROGRESS_INCREMENT = 10;
const MAX_PROGRESS_BEFORE_COMPLETE = 90;

// Utility functions
const generateUniqueId = (): string => `${Date.now()}-${Math.random()}`;

const simulateProgress = (queuedFile: QueuedFile): Promise<void> => {
  return new Promise((resolve) => {
    const progressInterval = setInterval(() => {
      if (queuedFile.progress < MAX_PROGRESS_BEFORE_COMPLETE) {
        queuedFile.progress =
          Math.round(
            (queuedFile.progress + Math.random() * PROGRESS_INCREMENT) * 100,
          ) / 100;
      }
    }, PROGRESS_UPDATE_INTERVAL);

    setTimeout(() => {
      clearInterval(progressInterval);
      queuedFile.progress = 100;
      resolve();
    }, PROGRESS_SIMULATION_DELAY);
  });
};

export const useUploadFile = defineStore('upload-file', {
  // State
  state: () => ({
    uploadedFiles: [] as UploadedFile[],
    queuedFiles: [] as QueuedFile[],
    isUploading: false,
    error: null as string | null,
    isLoading: false,
  }),

  // Getters
  getters: {
    pendingFilesCount: (state) =>
      state.queuedFiles.filter((qf) => qf.status === FileStatus.PENDING).length,

    hasQueuedFiles: (state) => state.queuedFiles.length > 0,

    uploadingFilesCount: (state) =>
      state.queuedFiles.filter((qf) => qf.status === FileStatus.UPLOADING)
        .length,

    successfulFilesCount: (state) =>
      state.queuedFiles.filter((qf) => qf.status === FileStatus.SUCCESS).length,

    errorFilesCount: (state) =>
      state.queuedFiles.filter((qf) => qf.status === FileStatus.ERROR).length,

    pendingFiles: (state) =>
      state.queuedFiles.filter((qf) => qf.status === FileStatus.PENDING),

    uploadingFiles: (state) =>
      state.queuedFiles.filter((qf) => qf.status === FileStatus.UPLOADING),

    successfulFiles: (state) =>
      state.queuedFiles.filter((qf) => qf.status === FileStatus.SUCCESS),

    errorFiles: (state) =>
      state.queuedFiles.filter((qf) => qf.status === FileStatus.ERROR),
  },

  // Actions
  actions: {
    // Error handling
    setError(message: string) {
      this.error = message;
    },

    clearError() {
      this.error = null;
    },

    handleApiError(err: unknown, defaultMessage: string): string {
      const errorMessage = err instanceof Error ? err.message : defaultMessage;
      console.error(`${defaultMessage}:`, err);
      return errorMessage;
    },

    // File operations
    async loadFiles(): Promise<void> {
      const { getFiles } = useApi();

      this.isLoading = true;
      this.clearError();

      try {
        const response = await getFiles();
        this.uploadedFiles = response.files;
      } catch (err) {
        const errorMessage = this.handleApiError(err, 'Failed to load files');
        this.setError(errorMessage);
      } finally {
        this.isLoading = false;
      }
    },

    async createQueuedFile(file: File): Promise<QueuedFile> {
      const { generatePreview, generateUniqueFileName } = useFileUtils();

      const preview = await generatePreview(file);

      const queuedFile: QueuedFile = {
        id: generateUniqueId(),
        file,
        preview,
        status: FileStatus.PENDING,
        progress: 0,
      };

      // Handle duplicate file names
      const existingFile = this.uploadedFiles.find(
        (uploaded) => uploaded.originalName === file.name,
      );

      if (existingFile) {
        const uniqueFileName = generateUniqueFileName(file.name);
        queuedFile.file = new File([file], uniqueFileName, {
          type: file.type,
        });
      }

      return queuedFile;
    },

    async addToQueue(files: File[]): Promise<void> {
      const newQueuedFiles = await Promise.all(
        files.map((file) => this.createQueuedFile(file)),
      );

      this.queuedFiles = [...this.queuedFiles, ...newQueuedFiles];
    },

    removeFromQueue(id: string): void {
      this.queuedFiles = this.queuedFiles.filter((qf) => qf.id !== id);
    },

    clearQueue(): void {
      this.queuedFiles = [];
    },

    async uploadSingleFile(queuedFile: QueuedFile): Promise<UploadResult> {
      const { uploadFile } = useApi();

      if (queuedFile.status !== FileStatus.PENDING) {
        return { success: false, error: 'File is not in pending status' };
      }

      queuedFile.status = FileStatus.UPLOADING;
      queuedFile.progress = 0;

      try {
        await uploadFile(queuedFile.file);
        await simulateProgress(queuedFile);

        queuedFile.status = FileStatus.SUCCESS;
        return { success: true };
      } catch (err) {
        queuedFile.status = FileStatus.ERROR;
        queuedFile.error = this.handleApiError(err, 'Upload failed');
        return { success: false, error: queuedFile.error };
      }
    },

    async uploadQueuedFiles(): Promise<void> {
      if (this.queuedFiles.length === 0) return;

      this.isUploading = true;
      this.clearError();

      try {
        const pendingFiles = this.queuedFiles.filter(
          (qf) => qf.status === FileStatus.PENDING,
        );

        const uploadResults = await Promise.all(
          pendingFiles.map((file) => this.uploadSingleFile(file)),
        );

        const hasSuccessfulUploads = uploadResults.some(
          (result) => result.success,
        );

        if (hasSuccessfulUploads) {
          await this.loadFiles();
        }

        // Remove successful uploads after delay
        setTimeout(() => {
          this.queuedFiles = this.queuedFiles.filter(
            (qf) => qf.status !== FileStatus.SUCCESS,
          );
        }, SUCCESS_REMOVAL_DELAY);
      } catch (err) {
        const errorMessage = this.handleApiError(err, 'Upload error');
        this.setError(errorMessage);
      } finally {
        this.isUploading = false;
      }
    },

    async deleteFile(filename: string): Promise<void> {
      const { deleteFile: apiDeleteFile } = useApi();

      this.clearError();

      try {
        await apiDeleteFile(filename);
        this.uploadedFiles = this.uploadedFiles.filter(
          (file) => file.filename !== filename,
        );
      } catch (err) {
        const errorMessage = this.handleApiError(err, 'Delete failed');
        this.setError(errorMessage);
      }
    },

    // Initialize store
    initialize() {
      onMounted(() => {
        this.loadFiles();
      });
    },
  },
});
