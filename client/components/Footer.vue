<template>
  <div class="footer-container">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" class="text-center">
          <p class="text-body-2 grey--text">
            &copy; {{ new Date().getFullYear() }}
            <span class="font-weight-medium">Quan Hoang</span>. All rights
            reserved.
          </p>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "Footer",
};
</script>
