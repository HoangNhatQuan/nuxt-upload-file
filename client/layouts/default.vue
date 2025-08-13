<template>
  <v-app>
    <v-main>
      <nuxt />
    </v-main>

    <!-- Global Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="4000"
      top
    >
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Auth Modal -->
    <AuthModal />
  </v-app>
</template>

<script>
import { mapState } from "vuex";
import AuthModal from "~/components/AuthModal.vue";

export default {
  name: "DefaultLayout",
  components: {
    AuthModal,
  },
  computed: {
    ...mapState(["snackbar"]),
  },
};
</script>
