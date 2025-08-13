<template>
  <div class="py-6">
    <!-- Error Display -->
    <v-alert v-if="hasError" type="error" dismissible @click:close="clearError">
      {{ error }}
    </v-alert>

    <!-- Success Display -->
    <v-alert v-if="hasSuccess" type="success" dismissible @click:close="clearSuccess">
      {{ success }}
    </v-alert>

    <!-- File Uploader -->
    <div class="mb-6">
      <FileUploadUploader :disabled="isUploading" @add-files="handleAddFiles" />
    </div>

    <!-- File Queue -->
    <div class="mb-6">
      <FileUploadFileQueue
        :files="queuedFiles"
        @remove="removeFromQueue"
        @clear="clearQueue"
      />
    </div>



    <!-- Upload Button -->
    <div v-if="hasQueuedFiles" class="text-center mb-6">
      <v-btn
        :disabled="!canUpload"
        :loading="isUploading"
        large
        color="primary"
        @click="handleUploadClick"
      >
        <v-icon left>mdi-upload</v-icon>
        {{ uploadButtonText }}
      </v-btn>
    </div>

    <!-- Existing Files Section -->
    <FileListSection
      :files="uploadedFiles"
      :is-loading="isLoading"
      @refresh="handleLoadFiles"
      @delete="handleDeleteFile"
    />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import FileUploadUploader from "./FileUploadUploader.vue";
import FileUploadFileQueue from "./FileUploadFileQueue.vue";
import FileUploadUploadedList from "./UploadedList.vue";
import FileListSection from "./FileListSection.vue";

export default {
  name: "FileUploadContainer",
  components: {
    FileUploadUploader,
    FileUploadFileQueue,
    FileUploadUploadedList,
    FileListSection,
  },
  computed: {
    // File Queue State
    ...mapState('fileQueue', ['queuedFiles', 'isUploading']),
    
    // File Queue Getters
    ...mapGetters('fileQueue', [
      'hasQueuedFiles',
      'canUpload',
      'uploadProgress'
    ]),

    // Uploaded Files State
    ...mapState('uploadedFiles', ['uploadedFiles', 'isLoading', 'error', 'success']),
    
    // Uploaded Files Getters
    ...mapGetters('uploadedFiles', [
      'hasUploadedFiles',
      'hasError',
      'hasSuccess'
    ]),

    uploadButtonText() {
      return this.isUploading ? "Uploading..." : "Upload Files";
    },
  },
  mounted() {
    // Only load files if authenticated
    if (this.$store.state.auth?.isAuthenticated) {
      this.loadFiles();
    }
  },
  watch: {
    // Watch for authentication state changes
    '$store.state.auth.isAuthenticated': {
      immediate: true,
      handler(newValue) {}
    }
  },
  methods: {
    // File Queue Actions
    ...mapActions('fileQueue', [
      'addFilesToQueue',
      'removeFromQueue',
      'clearQueue'
    ]),

    // Uploaded Files Actions
    ...mapActions('uploadedFiles', [
      'loadFiles',
      'deleteFile',
      'clearError',
      'clearSuccess'
    ]),

    async handleAddFiles(files) {
      try {
        if (!this.$store.state.auth?.isAuthenticated) {
          this.$store.commit('auth/SET_SHOW_AUTH_MODAL', true);
          return;
        }
        
        const result = await this.addFilesToQueue(files);
        if (result.success && this.$toast) {
          this.$toast.success(`${result.count} file(s) added to upload queue.`);
        }
      } catch (error) {
        if (this.$toast) {
          this.$toast.error("Failed to add files to queue");
        }
      }
    },

    async handleLoadFiles() {
      try {
        if (!this.$store.state.auth?.isAuthenticated) {
          this.$store.commit('auth/SET_SHOW_AUTH_MODAL', true);
          return;
        }
        
        await this.loadFiles();
      } catch (error) {
        if (error.message === 'Authentication required') {
          this.$store.commit('auth/SET_SHOW_AUTH_MODAL', true);
        } else if (this.$toast) {
          this.$toast.error("Failed to load files");
        }
      }
    },

    async handleDeleteFile(fileId) {
      try {
        if (!this.$store.state.auth?.isAuthenticated) {
          this.$store.commit('auth/SET_SHOW_AUTH_MODAL', true);
          return;
        }
        
        await this.deleteFile(fileId);
      } catch (error) {
        if (error.message === 'Authentication required') {
          this.$store.commit('auth/SET_SHOW_AUTH_MODAL', true);
        } else if (this.$toast) {
          this.$toast.error("Failed to delete file");
        }
      }
    },

    async handleUploadClick() {
      try {
        if (!this.$store.state.auth?.isAuthenticated) {
          this.$store.commit('auth/SET_SHOW_AUTH_MODAL', true);
          return;
        }
        
        await this.$store.dispatch('uploadService/uploadQueuedFiles');
      } catch (error) {
        if (error.message === 'Authentication required') {
          this.$store.commit('auth/SET_SHOW_AUTH_MODAL', true);
        } else if (this.$toast) {
          this.$toast.error("Upload failed");
        }
      }
    },
  },
};
</script>
