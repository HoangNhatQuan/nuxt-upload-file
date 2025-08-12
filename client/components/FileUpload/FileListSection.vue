<template>
  <div v-if="hasFiles || isLoading">
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h5 font-weight-bold">Uploaded Files</h2>
      <v-btn :loading="isLoading" text small @click="$emit('refresh')">
        <v-icon left>mdi-refresh</v-icon>
        Refresh
      </v-btn>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <FileUploadUploadedList
      v-else
      :files="files"
      @delete="$emit('delete', $event)"
    />
  </div>

  <!-- Empty State -->
  <div v-else-if="!isLoading" class="text-center py-12">
    <v-icon size="64" color="grey lighten-1" class="mb-4">
      mdi-file-document
    </v-icon>
    <h3 class="text-h6 font-weight-medium grey--text text--darken-1 mb-2">
      No files uploaded yet
    </h3>
    <p class="grey--text">Upload your first file to get started</p>
  </div>
</template>

<script>
import FileUploadUploadedList from "./UploadedList.vue";

export default {
  name: "FileListSection",
  components: {
    FileUploadUploadedList,
  },
  props: {
    files: {
      type: Array,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    hasFiles() {
      return this.files.length > 0;
    },
  },
  emits: ['refresh', 'delete'],
};
</script>
