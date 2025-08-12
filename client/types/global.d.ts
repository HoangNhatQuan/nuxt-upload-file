// Global type declarations for the frontend project

declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}

declare module "vuetify/es5/util/colors" {
  const colors: any;
  export default colors;
}

// Extend Vue interface for plugins
declare module "vue/types/vue" {
  interface Vue {
    $toast: {
      success(message: string): void;
      error(message: string): void;
      info(message: string): void;
      warning(message: string): void;
    };
  }
}

// Extend Nuxt context
declare module "@nuxt/types" {
  interface Context {
    $toast: {
      success(message: string): void;
      error(message: string): void;
      info(message: string): void;
      warning(message: string): void;
    };
  }
}

// Global variables
declare global {
  interface Window {
    $nuxt: any;
  }
}
