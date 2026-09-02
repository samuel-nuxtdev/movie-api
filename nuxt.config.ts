// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  runtimeConfig: {
      apiSecretKey: process.env.API_SECRET_KEY,
        public: {
      apiBase: '/api',
    }
  },
  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 100
      }
    }
  },
  nitro: {
    preset: 'node-server' 
  },
  })
