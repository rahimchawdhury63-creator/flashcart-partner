/**
 * =============================================================================
 * FLASHCART PARTNER PORTAL — Vite Configuration
 * =============================================================================
 * 
 * Purpose: Configure Vite bundler for the FlashCart partner/vendor dashboard.
 * 
 * Key decisions:
 * - Same base config as main app for consistency
 * - OneSignal SDK is loaded via index.html script tag, not bundled
 * - Separate chunk strategy optimized for dashboard patterns
 * - Path alias '@' for clean imports
 * 
 * Developer: Rizwan Rahim Chowdhury
 * Powered by: Bangladesh Software Development Community (BSDC)
 * =============================================================================
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  /* --- Plugins --- */
  plugins: [
    react() /* Enable React JSX transform and Fast Refresh */
  ],

  /* --- Path Resolution --- */
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  /* --- Development Server --- */
  server: {
    port: 3001, /* Different port from main app for parallel development */
    open: true,
    host: true
  },

  /* --- Build Configuration --- */
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks: {
          /* Vendor chunk: React core */
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          /* Firebase chunk: All Firebase services used by partner */
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/database'],

          /* SEO chunk */
          'vendor-seo': ['react-helmet-async'],

          /* Maps chunk: For delivery area and store location management */
          'vendor-maps': ['leaflet', 'react-leaflet'],

          /* PDF chunk: Invoice and certificate generation */
          'vendor-pdf': ['jspdf', 'jspdf-autotable']
        }
      }
    },

    minify: 'esbuild',
    cssCodeSplit: true
  },

  /* --- CSS Configuration --- */
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },

  /* --- Preview Server --- */
  preview: {
    port: 4174,
    host: true
  }
});
