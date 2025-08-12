import Vue from "vue";
import { ToastOptions } from "~/composables/useToast";

class ToastService {
  $store: any;
  private createSnackbar(message: string, options: ToastOptions = {}) {
    // Use Vuex store to show snackbar
    if (this.$store) {
      this.$store.commit("SET_SNACKBAR", {
        show: true,
        text: message,
        color: options.color || "primary",
      });
    } else {
      // Fallback to console log
      console.log("Snackbar:", { message, ...options });
    }
  }

  success(message: string, options?: ToastOptions) {
    this.createSnackbar(message, {
      ...options,
      color: "success",
    });
  }

  error(message: string, options?: ToastOptions) {
    this.createSnackbar(message, {
      ...options,
      color: "error",
    });
  }

  warning(message: string, options?: ToastOptions) {
    this.createSnackbar(message, {
      ...options,
      color: "warning",
    });
  }

  info(message: string, options?: ToastOptions) {
    this.createSnackbar(message, {
      ...options,
      color: "info",
    });
  }
}

export default ({ app, store }: { app: any; store: any }) => {
  const toastService = new ToastService();

  // Bind store to toast service
  toastService.$store = store;

  app.$toast = toastService;
};
