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
  routeRules: {
    '/api/stream/trending' : { swr: 86400 },
     '/api/stream/search' : { swr: 86400 },
    '/api/stream/series-episodes': { swr: 86400 },
    '/api/stream/movie-details' : { swr: 86400 },
    '/api/stream/ranking-list' : { swr: 86400 },
      '/api/stream/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-AUTH-KEY'    
      }
    }
  }
})
