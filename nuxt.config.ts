// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  vite: {
    resolve: {
      alias: {
        '.prisma': './node_modules/.prisma',
      },
    },
  },
  modules: ['@nuxtjs/tailwindcss'],
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
  },
  typescript: {
    strict: true
  },
  nitro: {
    preset: 'netlify',
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
      ]
    }
  },
})
