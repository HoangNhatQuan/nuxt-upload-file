<script setup lang="ts">
import { useFileUpload } from '../../composables/useFileUpload';

const {
  // State
  uploadedFiles,
  queuedFiles,
  isUploading,
  isLoading,
  error,

  // Computed
  canUpload,
  uploadButtonText,
  hasUploadedFiles,
  hasQueuedFiles,

  // Actions
  addFiles,
  removeFromQueue,
  clearQueue,
  uploadFiles,
  deleteFile,
  refreshFiles,
  clearError,
} = useFileUpload();
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
      @close="clearError"
    />

    <!-- File Uploader -->
    <FileUploadUploader
      :disabled="isUploading"
      @add-files="addFiles"
    />

    <!-- File Queue -->
    <FileUploadFileQueue
      :files="queuedFiles"
      @remove="removeFromQueue"
      @clear="clearQueue"
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
        @click="uploadFiles"
      >
        {{ uploadButtonText }}
      </UButton>
    </div>

    <!-- Existing Files -->
    <div
      v-if="hasUploadedFiles || isLoading"
      class="space-y-4"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Uploaded Files</h2>
        <UButton
          :loading="isLoading"
          variant="ghost"
          size="sm"
          icon="i-heroicons-arrow-path"
          @click="refreshFiles"
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
        @delete="deleteFile"
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
