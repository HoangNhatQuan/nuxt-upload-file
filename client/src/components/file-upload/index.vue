<template>
  <div class="py-6">
    <FileUploadBasic />
  </div>
</template>

<script setup lang="ts">
import { useUploadFile } from '../../stores/use-upload-file';

// Initialize the store when the component mounts
const uploadStore = useUploadFile();
uploadStore.initialize();
</script>
