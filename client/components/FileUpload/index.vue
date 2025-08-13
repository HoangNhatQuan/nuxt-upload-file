<template>
  <div class="py-6">
    <FileUploadContainer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FileUploadContainer from "./FileUploadContainer.vue";

export default defineComponent({
  name: "FileUpload",
  components: {
    FileUploadContainer,
  },
});
</script>
