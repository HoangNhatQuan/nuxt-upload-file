<template>
  <div class="py-6">
    <!-- Error Display -->
    <v-alert v-if="error" type="error" dismissible @click:close="clearError">
      {{ error }}
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
        @click="uploadQueuedFiles"
      >
        <v-icon left>mdi-upload</v-icon>
        {{ uploadButtonText }}
      </v-btn>
    </div>

    <!-- Existing Files -->
    <div v-if="hasUploadedFiles || isLoading">
      <div class="d-flex justify-space-between align-center mb-4">
        <h2 class="text-h5 font-weight-bold">Uploaded Files</h2>
        <v-btn :loading="isLoading" text small @click="loadFiles">
          <v-icon left>mdi-refresh</v-icon>
          Refresh
        </v-btn>
      </div>

      <div v-if="isLoading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64" />
      </div>

      <FileUploadUploadedList
        v-else
        :files="uploadedFiles"
        @delete="deleteFile"
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
  </div>
</template>

<script>
import FileUploadUploader from "./FileUploadUploader.vue";
import FileUploadFileQueue from "./FileUploadFileQueue.vue";
import FileUploadUploadedList from "./UploadedList.vue";
import { apiService } from "~/services/ApiService";

export default {
  name: "FileUploadContainer",
  components: {
    FileUploadUploader,
    FileUploadFileQueue,
    FileUploadUploadedList,
  },
  data() {
    return {
      uploadedFiles: [],
      queuedFiles: [],
      isUploading: false,
      isLoading: false,
      error: null,
      success: null,
    };
  },
  computed: {
    hasQueuedFiles() {
      return this.queuedFiles.length > 0;
    },
    hasUploadedFiles() {
      return this.uploadedFiles.length > 0;
    },
    canUpload() {
      return this.queuedFiles.length > 0 && !this.isUploading;
    },
    uploadButtonText() {
      return this.isUploading ? "Uploading..." : "Upload Files";
    },
  },
  mounted() {
    // Initialize component
    this.loadFiles();
  },
  methods: {
    async handleAddFiles(files) {
      try {
        for (const file of files) {
          const queuedFile = await this.createQueuedFile(file);
          this.queuedFiles.push(queuedFile);
        }

        if (this.$toast) {
          this.$toast.success(`${files.length} file(s) added to upload queue.`);
        }
      } catch (error) {
        console.error("Error adding files to queue:", error);
        if (this.$toast) {
          this.$toast.error("Failed to add files to queue");
        }
      }
    },

    async createQueuedFile(file) {
      // Generate unique ID
      const id = `${Date.now()}-${Math.random()}`;

      // Generate preview for images and videos
      let preview = "";
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        preview = await this.generatePreview(file);
      }

      // Create queued file object
      const queuedFile = {
        id,
        file,
        preview,
        status: "pending",
        progress: 0,
        error: null,
      };

      return queuedFile;
    },

    generatePreview(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.onerror = () => {
          resolve("");
        };
        reader.readAsDataURL(file);
      });
    },
    removeFromQueue(id) {
      this.queuedFiles = this.queuedFiles.filter((file) => file.id !== id);
    },
    clearQueue() {
      this.queuedFiles = [];
    },
    async uploadQueuedFiles() {
      this.isUploading = true;
      try {
        const pendingFiles = this.queuedFiles.filter(
          (file) => file.status === "pending"
        );

        if (pendingFiles.length === 0) {
          return;
        }

        // Upload each file
        for (const queuedFile of pendingFiles) {
          await this.uploadSingleFile(queuedFile);
        }

        // Refresh uploaded files list
        await this.loadFiles();

        // Show success message
        if (this.$toast) {
          this.$toast.success("Files uploaded successfully!");
        }
      } catch (error) {
        console.error("Upload error:", error);
        if (this.$toast) {
          this.$toast.error("Upload failed");
        }
      } finally {
        this.isUploading = false;
      }
    },

    async uploadSingleFile(queuedFile) {
      try {
        // Update status to uploading
        queuedFile.status = "uploading";
        queuedFile.progress = 0;

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          if (queuedFile.progress < 90) {
            queuedFile.progress += Math.random() * 10;
          }
        }, 100);

        // Real API call
        const uploadedFile = await apiService.uploadFile(queuedFile.file, {
          description: queuedFile.file.name,
        });

        clearInterval(progressInterval);
        queuedFile.progress = 100;

        // Update status to success
        queuedFile.status = "success";

        // Remove from queue after delay
        setTimeout(() => {
          this.removeFromQueue(queuedFile.id);
        }, 2000);
      } catch (error) {
        console.error("Error uploading file:", error);
        queuedFile.status = "error";
        queuedFile.error = error.message || "Upload failed";
      }
    },
    async deleteFile(filename) {
      try {
        await apiService.deleteFile(filename);

        this.uploadedFiles = this.uploadedFiles.filter(
          (file) => file.filename !== filename
        );

        // Show success message
        if (this.$toast) {
          this.$toast.success("File deleted successfully!");
        }
      } catch (error) {
        console.error("Delete error:", error);
        this.error = error.message || "Failed to delete file";
        if (this.$toast) {
          this.$toast.error("Failed to delete file");
        }
      }
    },

    async loadFiles() {
      this.isLoading = true;
      try {
        this.uploadedFiles = await apiService.getFiles();
      } catch (error) {
        console.error("Load error:", error);
        this.error = error.message || "Failed to load files";
        if (this.$toast) {
          this.$toast.error("Failed to load files");
        }
      } finally {
        this.isLoading = false;
      }
    },
    clearError() {
      this.error = null;
    },
  },
};
</script>
