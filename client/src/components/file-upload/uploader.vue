<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    disabled: boolean;
  }>(),
  {
    disabled: false,
  },
);

const emit = defineEmits(['add-files']);


const inputFile = ref<HTMLInputElement | null>(null);
const dropZone = ref<HTMLLabelElement | null>(null);
const isDragOver = ref(false);

const validateFile = (file: File): boolean => {
  // Check file size (50MB limit as per server)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    console.error('File too large. Maximum size is 50MB.');
    return false;
  }
  return true;
};

const handleFiles = async (files: FileList | File[]) => {
  const validFiles = Array.from(files).filter(validateFile);

  if (validFiles.length > 0) {
    await emit('add-files', validFiles);
  }
};

const handleChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;

  if (!target.files?.length) return;

  await handleFiles(target.files);

  // Don't reset immediately - let the user see their selection
  // The input will be reset when they start uploading
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = false;
};

const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = false;

  if (!e.dataTransfer?.files?.length) return;

  await handleFiles(e.dataTransfer.files);
};
</script>

<template>
  <label
    ref="dropZone"
    for="dropzone-file"
    class="relative flex h-48 flex-col items-center justify-center space-y-2 rounded-lg border border-dashed border-gray-500 p-4 transition-colors md:h-64 dark:border-gray-400"
    :class="{
      'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900':
        !props.disabled,
      'cursor-not-allowed': props.disabled,
      'border-blue-500 bg-blue-50 dark:bg-blue-900/20': isDragOver,
    }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <input
      id="dropzone-file"
      ref="inputFile"
      type="file"
      multiple
      class="hidden"
      :disabled="props.disabled"
      @input="handleChange"
    />
    <template v-if="!props.disabled">
      <UIcon
        name="i-heroicons-arrow-up-tray"
        class="h-6 w-6"
        :class="{ 'text-blue-500': isDragOver }"
      />
      <p class="text-center font-medium">
        <span class="cursor-pointer text-blue-500 dark:text-blue-400"
          >Choose files</span
        >
        or drag and drop
      </p>
      <p class="text-primary-500 dark:text-primary-400 text-center text-sm">
        All file types supported (max 50MB each)
      </p>
    </template>
    <template v-else>
      <UIcon
        name="i-heroicons-arrow-path"
        class="h-6 w-6 animate-spin"
      />
      <p class="font-medium">Uploading...</p>
    </template>
  </label>
</template>
