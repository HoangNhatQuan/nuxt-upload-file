<template>
  <v-container class="file-upload-container">
    <Header />
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
    testStorage() {
      const username = localStorage.getItem('app.auth.username');
      alert(`Storage test: ${username || 'No username found'}`);
    },
    clearStorage() {
      localStorage.removeItem('app.auth.username');
      this.$store.commit('auth/SET_USERNAME', null);
      alert('Storage cleared');
    },
    getStorageStatus() {
      const username = localStorage.getItem('app.auth.username');
      return username ? `Found: ${username}` : 'Empty';
    },
  },
};
</script>

<style>
@import "~/assets/css/main.css";
</style>
