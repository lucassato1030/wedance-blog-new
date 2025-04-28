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
    alias: {
      '.prisma': './node_modules/.prisma'
    },
    externals: {
      inline: ['@prisma/client', '@prisma/engines-version']
    }
  },
  
  ssr: true,

  routeRules: {
    '/**': { ssr: true }
  }
})
