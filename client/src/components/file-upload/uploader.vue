<script setup lang="ts">
import { ref, useToast } from '../../composables/useVueHelpers';

const props = withDefaults(
  defineProps<{
    disabled: boolean;
  }>(),
  {
    disabled: false,
  },
);

const emit = defineEmits(['add-files']);

const toast = useToast();
const inputFile = ref<HTMLInputElement | null>(null);
const dropZone = ref<HTMLLabelElement | null>(null);
const isDragOver = ref(false);

const validateFile = (file: File): boolean => {
  // Check file size (50MB limit as per server)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    toast.add({
      id: 'error_upload_file',
      title: 'Error',
      description: 'File too large. Maximum size is 50MB.',
      icon: 'i-heroicons-exclamation-triangle',
    });
    return false;
  }
  return true;
};

const handleFiles = (files: FileList | File[]) => {
  const validFiles = Array.from(files).filter(validateFile);

  if (validFiles.length > 0) {
    emit('add-files', validFiles);
  }
};

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement;

  if (!target.files?.length) return;

  handleFiles(target.files);
  inputFile.value!.value = '';
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = false;
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = false;

  if (!e.dataTransfer?.files?.length) return;

  handleFiles(e.dataTransfer.files);
};

const handleClick = () => {
  if (!props.disabled) {
    inputFile.value?.click();
  }
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
    @click="handleClick"
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
