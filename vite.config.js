// ============================================================
// FlashCart — Partner Business Portal
// Vite Configuration File
// Developer: Rizwan Rahim Chowdhury
// Powered by: Bangladesh Software Development Community (bsdc.info.bd)
// ============================================================

// Import Vite defineConfig for typed configuration
import { defineConfig } from 'vite';

// Import React plugin for JSX support and Fast Refresh
import react from '@vitejs/plugin-react';

// Import path for directory alias resolution
import { resolve } from 'path';

export default defineConfig({

  // ── PLUGINS ─────────────────────────────────────────────
  plugins: [
    react({
      // Automatic JSX runtime — no explicit React import needed per file
      jsxRuntime: 'automatic',
    }),
  ],

  // ── PATH ALIASES ────────────────────────────────────────
  // Same alias structure as main portal for consistency
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@context': resolve(__dirname, './src/context'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@styles': resolve(__dirname, './src/styles'),
      '@i18n': resolve(__dirname, './src/i18n'),
      '@data': resolve(__dirname, './src/data'),
      '@assets': resolve(__dirname, './src/assets'),
    },
  },

  // ── BUILD CONFIGURATION ─────────────────────────────────
  build: {
    // Cloudflare Pages reads from dist directory
    outDir: 'dist',

    // No source maps in production for security
    sourcemap: false,

    // Target modern browsers
    target: 'es2020',

    // Inline assets smaller than 4KB as base64
    assetsInlineLimit: 4096,

    // Split CSS per chunk for better caching
    cssCodeSplit: true,

    rollupOptions: {
      output: {
        // Manual chunk splitting — partner portal specific
        manualChunks: {
          // React core libraries
          'vendor-react': ['react', 'react-dom'],

          // React Router for navigation
          'vendor-router': ['react-router-dom'],

          // SEO library
          'vendor-helmet': ['react-helmet-async'],

          // Firebase split by service for optimal loading
          'vendor-firebase-app': ['firebase/app'],
          'vendor-firebase-auth': ['firebase/auth'],
          'vendor-firebase-firestore': ['firebase/firestore'],

          // Real-time database — critical for partner order notifications
          'vendor-firebase-rtdb': ['firebase/database'],

          // Analytics separate chunk
          'vendor-firebase-analytics': ['firebase/analytics'],
        },

        // Named chunks with content hash for cache busting
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },

  // ── DEVELOPMENT SERVER ───────────────────────────────────
  server: {
    // Different port to avoid conflict with main portal during dev
    port: 3001,
    open: false,
    host: true,
    historyApiFallback: true,
  },

  // ── PREVIEW SERVER ───────────────────────────────────────
  preview: {
    port: 4174,
    historyApiFallback: true,
  },

  // ── CSS CONFIGURATION ────────────────────────────────────
  css: {
    modules: {
      pattern: /\.module\.css$/,
    },
    postcss: {},
  },

  // ── ENVIRONMENT PREFIX ───────────────────────────────────
  envPrefix: 'VITE_',

  // ── DEPENDENCY OPTIMIZATION ─────────────────────────────
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-helmet-async',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/database',
    ],
  },
});
