<template>
  <div class="header-container">
    <v-row align="center" justify="space-between">
      <v-col>
        <h1
          class="text-h5 font-weight-bold primary--text d-flex align-center css-test"
        >
          <v-icon class="mr-2">mdi-file-upload</v-icon>
          File Uploader
        </h1>
      </v-col>
      <v-col cols="auto">
        <div class="d-flex align-center">
          <!-- User Info and Sign Out -->
          <div v-if="isAuthenticated" class="d-flex align-center mr-4">
            <span class="text-body-2 mr-2">Welcome, {{ username }}!</span>
            <v-btn
              small
              outlined
              color="primary"
              @click="handleSignOut"
            >
              Sign Out
            </v-btn>
          </div>
          
          <!-- Sign In Button -->
          <div v-else class="d-flex align-center mr-4">
            <v-btn
              small
              outlined
              color="primary"
              @click="handleSignIn"
            >
              Sign In
            </v-btn>
          </div>
          
          <v-btn
            icon
            href="https://github.com/HoangNhatQuan/nuxt-upload-file"
            target="_blank"
            class="mr-2"
          >
            <GithubLogoIcon />
          </v-btn>
          <v-btn icon @click="toggleTheme">
            <v-icon>{{ themeIcon }}</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import GithubLogoIcon from "./GithubLogoIcon.vue";

export default {
  name: "Header",
  components: {
    GithubLogoIcon,
  },
  data() {
    return {
      isDark: false,
    };
  },
  computed: {
    ...mapState('auth', ['username', 'isAuthenticated']),
    themeIcon() {
      return this.isDark ? "mdi-weather-sunny" : "mdi-weather-night";
    },
  },
  methods: {
    ...mapActions('auth', ['signOut']),
    toggleTheme() {
      this.isDark = !this.isDark;
      this.$vuetify.theme.dark = this.isDark;
    },
    handleSignOut() {
      this.signOut();
      // Reload the page to clear all state
      window.location.reload();
    },
    handleSignIn() {
      this.$store.commit('auth/SET_SHOW_AUTH_MODAL', true);
    },
  },
};
</script>
