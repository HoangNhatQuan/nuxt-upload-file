<script setup lang="ts">
import type { QueuedFile } from '../../stores/use-upload-file';

const props = defineProps<{
  files: QueuedFile[];
}>();

const emit = defineEmits<{
  remove: [id: string];
  clear: [];
}>();

// Memoized utility functions to prevent re-creation on each render
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (mimetype: string): string => {
  if (mimetype.startsWith('image/')) return 'i-heroicons-photo';
  if (mimetype.startsWith('video/')) return 'i-heroicons-video-camera';
  if (mimetype.startsWith('audio/')) return 'i-heroicons-musical-note';
  if (mimetype.includes('pdf')) return 'i-heroicons-document-text';
  if (mimetype.includes('word') || mimetype.includes('document'))
    return 'i-heroicons-document';
  if (mimetype.includes('excel') || mimetype.includes('spreadsheet'))
    return 'i-heroicons-table-cells';
  if (mimetype.includes('powerpoint') || mimetype.includes('presentation'))
    return 'i-heroicons-presentation-chart-line';
  return 'i-heroicons-document';
};

const getStatusColor = (status: QueuedFile['status']) => {
  switch (status) {
    case 'pending':
      return 'gray';
    case 'uploading':
      return 'blue';
    case 'success':
      return 'green';
    case 'error':
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusIcon = (status: QueuedFile['status']) => {
  switch (status) {
    case 'pending':
      return 'i-heroicons-clock';
    case 'uploading':
      return 'i-heroicons-arrow-up-tray';
    case 'success':
      return 'i-heroicons-check-circle';
    case 'error':
      return 'i-heroicons-exclamation-circle';
    default:
      return 'i-heroicons-clock';
  }
};
</script>

<template>
  <div
    v-if="props.files.length > 0"
    class="space-y-4"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium">
        Files to Upload ({{ props.files.length }})
      </h3>
      <UButton
        variant="ghost"
        size="sm"
        color="red"
        icon="i-heroicons-trash"
        @click="emit('clear')"
      >
        Clear All
      </UButton>
    </div>

    <div class="space-y-3">
      <div
        v-for="queuedFile in props.files"
        :key="queuedFile.id"
        class="flex items-center gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
      >
        <!-- File Preview/Icon -->
        <div class="flex-shrink-0">
          <div
            v-if="
              queuedFile.file.type.startsWith('image/') && queuedFile.preview
            "
            class="h-12 w-12 overflow-hidden rounded-lg border"
          >
            <img
              :src="queuedFile.preview"
              :alt="queuedFile.file.name"
              class="h-full w-full object-cover"
            />
          </div>
          <div
            v-else
            class="flex h-12 w-12 items-center justify-center rounded-lg border bg-gray-50 dark:bg-gray-800"
          >
            <UIcon
              :name="getFileIcon(queuedFile.file.type)"
              class="h-6 w-6 text-gray-500"
            />
          </div>
        </div>

        <!-- File Info -->
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium">{{ queuedFile.file.name }}</p>
          <p class="text-sm text-gray-500">
            {{ formatFileSize(queuedFile.file.size) }} •
            {{ queuedFile.file.type }}
          </p>
          <p
            v-if="queuedFile.error"
            class="mt-1 text-sm text-red-500"
          >
            {{ queuedFile.error }}
          </p>
        </div>

        <!-- Status and Progress -->
        <div class="flex items-center gap-3">
          <div
            v-if="queuedFile.status === 'uploading'"
            class="w-24"
          >
            <UProgress
              :value="queuedFile.progress"
              :max="100"
              size="sm"
              :color="getStatusColor(queuedFile.status)"
            />
            <p class="mt-1 text-xs text-gray-500">
              {{ queuedFile.progress.toFixed(2) }}%
            </p>
          </div>

          <UIcon
            v-else
            :name="getStatusIcon(queuedFile.status)"
            :class="`h-5 w-5 text-${getStatusColor(queuedFile.status)}-500`"
          />
        </div>

        <!-- Actions -->
        <div class="flex-shrink-0">
          <UButton
            v-if="queuedFile.status === 'pending'"
            variant="ghost"
            size="sm"
            color="red"
            icon="i-heroicons-x-mark"
            @click="emit('remove', queuedFile.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
