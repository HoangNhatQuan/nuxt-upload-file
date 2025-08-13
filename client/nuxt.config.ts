import colors from "vuetify/es5/util/colors";

const config = {
  ssr: false,
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: "File Uploader",
    title: "File Uploader",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "File uploader built with Nuxt.js and Vuetify",
      },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#1976D2" },
  /*
   ** Global CSS
   */
  css: ["@/assets/css/main.css"],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: ["~/plugins/toast"],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ["@nuxt/typescript-build", "@nuxtjs/vuetify"],
  /*
   ** Nuxt.js modules
   */
  modules: ["@nuxtjs/axios"],
  /*
   ** Axios module configuration
   */
  axios: {
    baseURL: process.env.NUXT_API_BASE_URL || "https://nuxt-upload-file.vercel.app/api",
  },
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    customVariables: ["~/assets/variables.scss"],
    theme: {
      light: true,
      themes: {
        light: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config: any, ctx: any) {
      // Performance optimizations
      if (ctx.isClient) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: "all",
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: "vendors",
                chunks: "all",
              },
              vuetify: {
                test: /[\\/]node_modules[\\/]vuetify[\\/]/,
                name: "vuetify",
                chunks: "all",
              },
            },
          },
        };
      }
    },
    // Enable source maps for development
    sourceMap: process.env.NODE_ENV === "development",
    // Optimize bundle size
    optimization: {
      minimize: process.env.NODE_ENV === "production",
    },
  },
  // Performance optimizations
  render: {
    bundleRenderer: {
      shouldPreload: (file: string, type: string) => {
        return ["script", "style", "font"].includes(type);
      },
    },
  },
  // Enable modern build for better performance
  modern: process.env.NODE_ENV === "production",
};

export default config;
