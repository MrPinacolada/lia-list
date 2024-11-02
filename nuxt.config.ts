import Aura from "@primevue/themes/aura";

export default defineNuxtConfig({
  app: {
    baseURL: "/lia-list/",
    buildAssetsDir: "/lia-list/_nuxt/",
    head: {
      title: "Habit Tracker",
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
      meta: [
        {
          property: "og:image",
          content: "https://mrpinacolada.github.io/lia-list/logo.webp",
        },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Habit Tracker",
        },
        {
          name: "twitter:description",
          content: "Track your habits as simple as that",
        },
        {
          name: "twitter:image",
          content: "https://mrpinacolada.github.io/lia-list/logo.webp",
        },
      ],
    },
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
