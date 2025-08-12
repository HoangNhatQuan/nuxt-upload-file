<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    files: UploadedFile[];
  }>(),
  {
    files: () => [],
  },
);

const emit = defineEmits<{
  delete: [filename: string];
}>();

// Memoized utility functions to prevent re-creation on each render
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const getFileIcon = (mimetype?: string): string => {
  if (!mimetype) return 'i-heroicons-document';
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
</script>

<template>
  <div>
    <p class="font-medium">Uploaded Files</p>
    <p class="text-primary-500 dark:text-primary-400 text-sm">
      View the uploaded files here
    </p>
    <div class="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
      <div
        v-for="item in props.files"
        :key="item.filename"
        class="flex items-center gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
      >
        <div
          class="border-primary/30 flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border bg-gray-50 dark:bg-gray-800"
        >
          <img
            v-if="item.mimetype?.startsWith('image/')"
            :src="`https://ougcutnevvvrbucgxgla.supabase.co/storage/v1/object/public/kinobi/${item.filename}`"
            :alt="item.originalName"
            class="h-full w-full object-cover"
          />
          <UIcon
            v-else
            :name="getFileIcon(item.mimetype)"
            class="h-6 w-6 text-gray-500"
          />
        </div>
        <div class="flex-1">
          <p class="mb-1 font-medium">{{ item.originalName }}</p>
          <p class="text-primary-500 dark:text-primary-400 text-sm">
            {{ formatFileSize(item.size) }} - {{ formatDate(item.updatedAt) }}
          </p>
          <p
            v-if="item.description"
            class="mt-1 text-xs text-gray-600 dark:text-gray-400"
          >
            {{ item.description }}
          </p>
        </div>
        <div class="flex gap-2">
          <UButton
            v-if="item.mimetype?.startsWith('image/')"
            :to="item.url"
            target="_blank"
            variant="ghost"
            size="sm"
            icon="i-heroicons-eye"
          />
          <UButton
            variant="ghost"
            size="sm"
            color="red"
            icon="i-heroicons-trash"
            @click="emit('delete', item.filename)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
