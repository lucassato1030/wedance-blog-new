// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
  },
  typescript: {
    strict: true
  },
  vite: {
    resolve: {
      alias: {
        '.prisma': './node_modules/.prisma',
      },
    },
  },
  
  // Configure Nitro specifically for Netlify hosting
  nitro: {
    preset: 'netlify',
    // Add this to ensure proper SSR handling
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  },
  
  // Explicitly enable SSR
  ssr: true,

  // Update route rules to make sure root path is properly handled
  routeRules: {
    '/**': { ssr: true },
    '/': { prerender: true }
  }
})
