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
    themeIcon() {
      return this.isDark ? "mdi-weather-sunny" : "mdi-weather-night";
    },
  },
  methods: {
    toggleTheme() {
      this.isDark = !this.isDark;
      this.$vuetify.theme.dark = this.isDark;
    },
  },
};
</script>
