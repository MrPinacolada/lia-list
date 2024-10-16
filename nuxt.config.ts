export default defineNuxtConfig({
  app: {
    baseURL: "/lia-list/",
    head: {
      title: "Lia list",
    },
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
  modules: ["@nuxt/fonts", "@nuxtjs/google-fonts"],
  googleFonts: {
    families: {
      "DM+Sans": "200..700",
    },
  },
  router: {
    base: "/lia-list/",
  },
  target: "static",
  ssr: false,
});
