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
  
  nitro: {
    preset: 'netlify',
    routeRules: {
      '/**': { cache: { swr: true, maxAge: 120, staleMaxAge: 60, headersOnly: true } }
    },
    externals: {
      inline: ['@prisma/client', '@prisma/engines-version']
    }
  },
  
  ssr: true,

  routeRules: {
    '/**': { ssr: true }
  },

  // Ensure client-side routing works correctly
  app: {
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    },
    // This ensures the Nuxt app can handle the redirection from Netlify properly
    baseURL: '/'
  }
})
