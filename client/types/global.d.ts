// Global type declarations for the frontend project

declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}

declare module "vuetify/es5/util/colors" {
  const colors: any;
  export default colors;
}

interface ToastOptions {
  timeout?: number;
  color?: string;
  icon?: string;
}

// Toast service interface
interface IToastService {
  success(message: string, options?: ToastOptions): void;
  error(message: string, options?: ToastOptions): void;
  warning(message: string, options?: ToastOptions): void;
  info(message: string, options?: ToastOptions): void;
}

// Extend Vue interface for plugins
declare module "vue/types/vue" {
  interface Vue {
    $toast: IToastService;
  }
}

declare module "@nuxt/types" {
  interface Context {
    $toast: IToastService;
  }
}

// Global variables
declare global {
  interface Window {
    $nuxt: any;
  }
}
