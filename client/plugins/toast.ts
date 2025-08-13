import Vue from "vue";
import { ToastOptions } from "~/composables/useToast";

class ToastService {
  $store: any;
  
  constructor(store: any) {
    this.$store = store;
  }

  private createSnackbar(message: string, options: ToastOptions = {}) {
    if (this.$store) {
      this.$store.commit("SET_SNACKBAR", {
        show: true,
        text: message,
        color: options.color || "primary",
      });
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
  const toastService = new ToastService(store);
  Vue.prototype.$toast = toastService;
  
  app.$toast = toastService;
  
  if (app.context) {
    app.context.$toast = toastService;
  }
};
