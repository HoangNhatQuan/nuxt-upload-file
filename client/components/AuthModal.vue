<template>
  <v-dialog v-model="isOpen" persistent max-width="400">
    <v-card class="auth-modal">
      <!-- Header -->
      <v-card-title class="text-h5 text-center pa-6 pb-4">
        {{ isSignIn ? 'Login' : 'Sign Up' }}
      </v-card-title>

      <!-- Form -->
      <v-card-text class="pa-6 pt-0">
        <v-form ref="form" v-model="isFormValid">
          <!-- Username Field -->
          <v-text-field
            v-model="form.username"
            :rules="usernameRules"
            label="Username"
            placeholder="Username"
            outlined
            dense
            :error-messages="error"
            @input="clearError"
          />

          <!-- Password Field -->
          <v-text-field
            v-model="form.password"
            :rules="passwordRules"
            label="Password"
            placeholder="Password"
            type="password"
            outlined
            dense
            :error-messages="error"
            @input="clearError"
          />

          <!-- Forgot Password Link (Sign In only) -->
          <div v-if="isSignIn" class="text-right mb-4">
            <v-btn
              text
              small
              color="primary"
              class="text-caption"
              @click="handleForgotPassword"
            >
              Forgot Password?
            </v-btn>
          </div>

          <!-- Submit Button -->
          <v-btn
            block
            large
            color="primary"
            :loading="isLoading"
            :disabled="!isFormValid || isLoading"
            @click="handleSubmit"
            class="mb-4"
          >
            {{ isSignIn ? 'Login' : 'Sign Up' }}
          </v-btn>

          <!-- Toggle Mode -->
          <div class="text-center">
            <span class="text-body-2">
              {{ isSignIn ? 'Not a member?' : 'Already have an account?' }}
            </span>
            <v-btn
              text
              small
              color="primary"
              class="ml-1"
              @click="toggleMode"
            >
              {{ isSignIn ? 'Signup' : 'Login' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'AuthModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      form: { username: '', password: '' },
      isFormValid: false,
      isSignIn: true,
    };
  },
  computed: {
    ...mapState('auth', ['isLoading', 'error', 'showAuthModal']),
    isOpen: {
      get() {
        return this.showAuthModal;
      },
      set(value) {
        this.$store.commit('auth/SET_SHOW_AUTH_MODAL', value);
      },
    },
    usernameRules() {
      return [
        (v) => !!v || 'Username is required',
        (v) => v.length >= 3 || 'Username must be at least 3 characters',
        (v) => v.length <= 50 || 'Username must be less than 50 characters',
        (v) => /^[a-zA-Z0-9_-]+$/.test(v) || 'Username can only contain letters, numbers, underscores, and hyphens',
      ];
    },
    passwordRules() {
      return [
        (v) => !!v || 'Password is required',
        (v) => v.length >= 8 || 'Password must be at least 8 characters',
        (v) => /[a-zA-Z]/.test(v) || 'Password must contain at least one letter',
        (v) => /\d/.test(v) || 'Password must contain at least one number',
      ];
    },
  },
  methods: {
    ...mapActions('auth', ['signIn', 'signUp', 'clearError']),
    
    async handleSubmit() {
      if (!this.isFormValid) return;

      const result = this.isSignIn
        ? await this.signIn(this.form)
        : await this.signUp(this.form);

      if (result.success) {
        this.$store.commit('auth/SET_SHOW_AUTH_MODAL', false);
        this.form = { username: '', password: '' };
      }
    },

    toggleMode() {
      this.isSignIn = !this.isSignIn;
      this.clearError();
      this.form = { username: '', password: '' };
    },

    handleForgotPassword() {
      // TODO: Implement forgot password functionality
      console.log('Forgot password clicked');
    },
  },
  watch: {
    error(newError) {
      if (newError) {
        // Trigger form validation to show error state
        this.$nextTick(() => {
          const formRef = this.$refs.form;
          if (formRef) {
            formRef.validate();
          }
        });
      }
    },
    showAuthModal(newValue) {
      console.log('AuthModal: showAuthModal changed to:', newValue);
    },
  },
};
</script>

<style scoped>
.auth-modal {
  border-radius: 12px;
}

.auth-modal .v-card__title {
  font-weight: 600;
  color: #1976d2;
}

.auth-modal .v-text-field {
  margin-bottom: 16px;
}

.auth-modal .v-btn--block {
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  height: 48px;
}

.auth-modal .v-btn--text {
  text-transform: none;
  font-weight: 500;
}
</style>
