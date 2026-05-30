// vite.config.js — Build configuration for FlashCart Partner Portal.
// Same approach as the main app: React plugin + manual chunks for performance.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split heavy/independent libraries for better caching and faster first load.
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/database'],
          maps: ['leaflet', 'react-leaflet'],
          charts: ['recharts'],
        },
      },
    },
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
  },
  preview: { port: 4174 },
  server: { port: 5174, host: true },
})
