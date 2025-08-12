<template>
  <div class="uploaded-list">
    <div class="list-header">
      <p class="text-body-2 grey--text mb-6">
        View and manage your uploaded files
      </p>
    </div>

    <div v-if="files.length === 0" class="empty-state">
      <v-icon size="64" color="grey lighten-2" class="mb-4"
        >mdi-folder-open</v-icon
      >
      <p class="text-h6 grey--text">No files uploaded yet</p>
      <p class="text-body-2 grey--text">
        Upload your first file to get started
      </p>
    </div>

    <v-row v-else>
      <v-col v-for="item in files" :key="item.filename" cols="12" md="6" lg="4">
        <v-card class="file-card" outlined elevation="1" hover>
          <v-card-text class="pa-6">
            <div class="file-content">
              <div class="file-icon-wrapper">
                <div class="file-icon">
                  <img
                    v-if="item.mimetype && item.mimetype.startsWith('image/')"
                    :src="item.url"
                    :alt="item.originalName"
                    class="file-image"
                  />
                  <video
                    v-else-if="
                      item.mimetype && item.mimetype.startsWith('video/')
                    "
                    :src="item.url"
                    class="file-video"
                    preload="metadata"
                  >
                    <v-icon color="white" size="28">
                      {{ getFileIcon(item.mimetype) }}
                    </v-icon>
                  </video>
                  <v-icon v-else color="white" size="28">
                    {{ getFileIcon(item.mimetype) }}
                  </v-icon>
                </div>
              </div>

              <div class="file-info">
                <h4 class="file-name text-body-1 font-weight-medium">
                  {{ item.originalName }}
                </h4>
                <div class="file-meta">
                  <span class="file-size text-caption grey--text">
                    {{ formatFileSize(item.size) }}
                  </span>
                  <span class="file-date text-caption grey--text">
                    {{ formatDate(item.updatedAt) }}
                  </span>
                </div>
                <p
                  v-if="item.description"
                  class="file-description text-caption grey--text mt-2"
                >
                  {{ item.description }}
                </p>
              </div>

              <div class="file-actions">
                <v-btn
                  v-if="item.mimetype"
                  icon
                  small
                  class="action-btn view-btn"
                  :href="item.url"
                  target="_blank"
                  title="View file"
                >
                  <v-icon size="20">mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  class="action-btn delete-btn"
                  @click="$emit('delete', item.filename)"
                  title="Delete file"
                >
                  <v-icon size="20">mdi-delete</v-icon>
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { fileUtils } from "~/utils/fileUtils";

export default {
  name: "FileUploadUploadedList",
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

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },

    getFileIcon(mimetype) {
      return fileUtils.getFileIcon(mimetype);
    },
  },
};
</script>

<style scoped>
.uploaded-list {
  width: 100%;
}

.list-header {
  margin-bottom: 24px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 2px dashed #e0e0e0;
}

.file-card {
  height: 100%;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: none !important;
}

.file-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 100%;
}

.file-icon-wrapper {
  flex-shrink: 0;
}

.file-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.file-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}

.file-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}

.file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 56px;
}

.file-name {
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 4px;
}

.file-size {
  font-weight: 500;
}

.file-date {
  position: relative;
}

.file-date::before {
  content: "•";
  margin-right: 12px;
  color: #bdbdbd;
}

.file-description {
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  align-self: flex-start;
}

.action-btn {
  width: 32px !important;
  height: 32px !important;
  transition: all 0.2s ease;
}

.view-btn {
  background-color: #e3f2fd !important;
  color: #1976d2 !important;
}

.view-btn:hover {
  background-color: #bbdefb !important;
  transform: scale(1.1);
}

.delete-btn {
  background-color: #ffebee !important;
  color: #d32f2f !important;
}

.delete-btn:hover {
  background-color: #ffcdd2 !important;
  transform: scale(1.1);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .file-content {
    gap: 12px;
  }

  .file-icon {
    width: 48px;
    height: 48px;
  }

  .file-info {
    height: 48px;
  }
}

@media (max-width: 600px) {
  .file-card {
    margin-bottom: 16px;
  }

  .file-content {
    gap: 12px;
  }

  .file-actions {
    flex-direction: row;
    gap: 4px;
  }
}
</style>
