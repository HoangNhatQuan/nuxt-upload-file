<template>
  <div v-if="files.length > 0">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6 font-weight-medium">
        Files to Upload ({{ files.length }})
      </h3>
      <v-btn text small color="error" @click="$emit('clear')">
        <v-icon left>mdi-delete</v-icon>
        Clear All
      </v-btn>
    </div>

    <div class="space-y-3">
      <v-card
        v-for="(file, index) in files"
        :key="index"
        class="file-card mb-3"
        outlined
      >
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-center">
            <!-- File Preview/Icon -->
            <div class="flex-shrink-0 mr-4">
              <div
                v-if="
                  file.file.type &&
                  (file.file.type.startsWith('image/') ||
                    file.file.type.startsWith('video/')) &&
                  file.preview
                "
                class="file-icon"
                :style="`background-image: url(${file.preview})`"
              >
                <v-icon
                  v-if="file.file.type.startsWith('video/')"
                  color="white"
                  size="24"
                >
                  mdi-play
                </v-icon>
              </div>
              <div v-else class="file-icon">
                <v-icon color="white">{{ getFileIcon(file.file.type) }}</v-icon>
              </div>
            </div>

            <!-- File Info -->
            <div class="file-info flex-grow-1 min-width-0">
              <p class="file-name text-body-1 font-weight-medium truncate">
                {{ file.file.name }}
              </p>
              <p class="file-size text-caption grey--text">
                {{ formatFileSize(file.file.size) }} •
                {{ file.file.type || "Unknown type" }}
              </p>

              <!-- Progress Bar -->
              <div v-if="file.status === 'uploading'" class="mt-2">
                <v-progress-linear
                  :value="file.progress"
                  color="primary"
                  height="4"
                  rounded
                />
                <p class="text-caption grey--text mt-1">
                  Uploading... {{ Math.round(file.progress) }}%
                </p>
              </div>

              <!-- Status Messages -->
              <div v-if="file.status === 'success'" class="mt-2">
                <v-chip small color="success" text-color="white">
                  <v-icon left small>mdi-check</v-icon>
                  Uploaded
                </v-chip>
              </div>

              <p v-if="file.error" class="text-caption error--text mt-1">
                <v-icon left small>mdi-alert-circle</v-icon>
                {{ file.error }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex-shrink-0">
              <v-btn
                v-if="file.status === 'pending'"
                icon
                small
                color="error"
                @click="$emit('remove', file.id)"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
import { fileUtils } from "~/utils/fileUtils";

export default {
  name: "FileUploadFileQueue",
  props: {
    files: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    formatFileSize(bytes) {
      return fileUtils.formatFileSize(bytes);
    },

    getFileIcon(mimetype) {
      return fileUtils.getFileIcon(mimetype);
    },
  },
};
</script>

<style scoped>
.min-width-0 {
  min-width: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-info .file-name {
  margin-bottom: 0 !important;
}
.file-info .file-size {
  margin-bottom: 0 !important;
}

.file-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
