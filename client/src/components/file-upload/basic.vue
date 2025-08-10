<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import { useUploadFile } from '../../stores/use-upload-file';

const uploadFileStore = useUploadFile();

const {
  uploadedFiles,
  queuedFiles,
  isUploading,
  isLoading,
  error,
  pendingFilesCount,
  hasQueuedFiles,
} = storeToRefs(uploadFileStore);

const handleAddFiles = async (files: File[]) => {
  await uploadFileStore.addToQueue(files);
};

const handleRemoveFromQueue = (id: string) => {
  uploadFileStore.removeFromQueue(id);
};

const handleClearQueue = () => {
  uploadFileStore.clearQueue();
};

const handleUpload = () => {
  uploadFileStore.uploadQueuedFiles();
};

const canUpload = computed(() => {
  return (
    hasQueuedFiles.value && pendingFilesCount.value > 0 && !isUploading.value
  );
});

const uploadButtonText = computed(() =>
  isUploading.value
    ? 'Uploading...'
    : `Upload ${pendingFilesCount.value} Files`,
);
</script>

<template>
  <div class="space-y-6 py-6">
    <!-- Error Display -->
    <UAlert
      v-if="error"
      color="red"
      variant="soft"
      :title="error"
      class="mb-4"
    />

    <!-- File Uploader -->
    <FileUploadUploader
      :disabled="isUploading"
      @add-files="handleAddFiles"
    />

    <!-- File Queue -->
    <FileUploadFileQueue
      :files="queuedFiles"
      @remove="handleRemoveFromQueue"
      @clear="handleClearQueue"
    />

    <!-- Upload Button -->
    <div
      v-if="hasQueuedFiles"
      class="flex justify-center"
    >
      <UButton
        :disabled="!canUpload"
        :loading="isUploading"
        size="lg"
        color="blue"
        icon="i-heroicons-arrow-up-tray"
        @click="handleUpload"
      >
        {{ uploadButtonText }}
      </UButton>
    </div>

    <!-- Existing Files -->
    <div
      v-if="uploadedFiles.length > 0 || isLoading"
      class="space-y-4"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Uploaded Files</h2>
        <UButton
          :loading="isLoading"
          variant="ghost"
          size="sm"
          icon="i-heroicons-arrow-path"
          @click="uploadFileStore.loadFiles"
        >
          Refresh
        </UButton>
      </div>

      <div
        v-if="isLoading"
        class="flex justify-center py-8"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="h-8 w-8 animate-spin"
        />
      </div>

      <FileUploadUploadedList
        v-else
        :files="uploadedFiles"
        @delete="uploadFileStore.deleteFile"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!isLoading"
      class="py-12 text-center"
    >
      <UIcon
        name="i-heroicons-document"
        class="mx-auto mb-4 h-12 w-12 text-gray-400"
      />
      <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
        No files uploaded yet
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        Upload your first file to get started
      </p>
    </div>
  </div>
</template>
