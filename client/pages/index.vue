<template>
  <v-container class="file-upload-container">
    <Header />
    
    <!-- Debug section for testing -->
    <div v-if="!$store.state.auth?.isAuthenticated" class="mb-4">
      <v-alert type="info" class="mb-2">
        You are not authenticated. Try uploading a file or click the test button below.
      </v-alert>
      <v-btn color="primary" @click="testOpenModal">
        Test Open Auth Modal
      </v-btn>
    </div>
    
    <FileUpload />
    <Footer />
    
    <!-- Authentication Modal -->
    <AuthModal />
  </v-container>
</template>

<script>
import Header from "~/components/Header.vue";
import FileUpload from "~/components/FileUpload/index.vue";
import Footer from "~/components/Footer.vue";
import AuthModal from "~/components/AuthModal.vue";

export default {
  name: "IndexPage",
  components: {
    Header,
    FileUpload,
    Footer,
    AuthModal,
  },
  provide() {
    return {
      showAuthModal: () => {
        this.$store.commit('auth/SET_SHOW_AUTH_MODAL', true);
      },
    };
  },
  methods: {
    testOpenModal() {
      this.$store.commit('auth/SET_SHOW_AUTH_MODAL', true);
    },
  },
};
</script>

<style>
@import "~/assets/css/main.css";
</style>
