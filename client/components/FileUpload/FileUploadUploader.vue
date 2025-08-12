<template>
  <div>
    <v-card
      ref="dropZone"
      class="upload-zone"
      :class="{ dragover: isDragOver, disabled: disabled }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="inputFile"
        type="file"
        multiple
        class="d-none"
        :disabled="disabled"
        @change="handleChange"
      />

      <div class="text-center">
        <template v-if="!disabled">
          <v-icon
            size="48"
            :color="isDragOver ? 'primary' : 'grey'"
            class="mb-4"
          >
            mdi-cloud-upload
          </v-icon>
          <p class="text-h6 font-weight-medium mb-2">
            <span class="primary--text cursor-pointer">Choose files</span>
            or drag and drop
          </p>
          <p class="text-body-2 grey--text">
            All file types supported (max 5MB each)
          </p>
        </template>
        <template v-else>
          <v-progress-circular
            indeterminate
            color="primary"
            size="48"
            class="mb-4"
          />
          <p class="text-h6 font-weight-medium">Uploading...</p>
        </template>
      </div>
    </v-card>
  </div>
</template>

<script>
import { fileUtils } from "~/utils/fileUtils";

export default {
  name: "FileUploadUploader",
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isDragOver: false,
    };
  },
  methods: {
    validateFile(file) {
      const validation = fileUtils.validateFile(file);
      if (!validation.isValid) {
        if (this.$toast) {
          this.$toast.error(`${file.name}: ${validation.error}`);
        }
      }
      return validation.isValid;
    },

    async handleFiles(files) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(this.validateFile);

      if (validFiles.length > 0) {
        this.$emit("add-files", validFiles);

        const successMessage = `${validFiles.length} file(s) added to upload queue.`;
        if (this.$toast) {
          this.$toast.success(successMessage);
        }
      }
    },

    handleChange(e) {
      const target = e.target;

      if (!target.files?.length) {
        return;
      }

      this.handleFiles(target.files);
      target.value = "";
    },

    handleDragOver(e) {
      e.preventDefault();
      this.isDragOver = true;
    },

    handleDragLeave(e) {
      e.preventDefault();
      this.isDragOver = false;
    },

    async handleDrop(e) {
      e.preventDefault();
      this.isDragOver = false;

      if (!e.dataTransfer?.files?.length) return;

      await this.handleFiles(e.dataTransfer.files);
    },

    triggerFileInput() {
      if (!this.disabled) {
        this.$refs.inputFile.click();
      }
    },
  },
};
</script>

<style scoped>
.upload-zone {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: none !important;
}

.upload-zone:hover:not(.disabled) {
  border-color: #1976d2 !important;
}

.upload-zone.dragover {
  border-color: #1976d2 !important;
  background-color: #e3f2fd !important;
}

.upload-zone.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
