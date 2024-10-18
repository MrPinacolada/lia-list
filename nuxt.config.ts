import Aura from "@primevue/themes/aura";

export default defineNuxtConfig({
  app: {
    baseURL: "/lia-list/",
    buildAssetsDir: "/lia-list/_nuxt/",
  },
  router: {
    base: "/lia-list/",
  },
  components: [
    {
      path: "~/components",
      global: true,
    },
  ],
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  css: ["~/assets/styles/_global.scss"],
  modules: ["@nuxt/fonts", "@nuxtjs/google-fonts", "@primevue/nuxt-module"],
  googleFonts: {
    families: {
      "DM+Sans": "200..700",
    },
  },
  primevue: {
    options: {
      theme: {
        preset: Aura,
      },
    },
  },
  target: "static",
  ssr: false,
});
