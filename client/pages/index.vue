<template>
  <v-container class="file-upload-container">
    <Header />
    <FileUpload />
    <Footer />
  </v-container>
</template>

<script>
import Header from "~/components/Header.vue";
import FileUpload from "~/components/FileUpload/index.vue";
import Footer from "~/components/Footer.vue";

export default {
  name: "IndexPage",
  components: {
    Header,
    FileUpload,
    Footer,
  },
};
</script>

<style>
@import "~/assets/css/main.css";
</style>
