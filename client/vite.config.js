import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const asyncMainCssPlugin = () => ({
  name: 'async-main-css',
  enforce: 'post',
  transformIndexHtml(html) {
    return html.replace(
      /<link rel="stylesheet"([^>]*href="\/assets\/(?:main|index|app)[^"]+\.css"[^>]*)>/g,
      '<link rel="preload" as="style"$1 onload="this.onload=null;this.rel=\'stylesheet\'"><noscript><link rel="stylesheet"$1></noscript>',
    )
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    asyncMainCssPlugin(),
    // Generate pre-compressed Gzip files (.gz) for production
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
    }),
    // Generate pre-compressed Brotli files (.br) for maximum compression
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/ae-en/sitemap.xml': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/ae-ar/sitemap.xml': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/sitemap.xml': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Enable code splitting for better performance
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        app: path.resolve(__dirname, 'app.html'),
      },
      output: {
        manualChunks: {
          // Vendor chunks - separate large libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'react-icons'],
          'vendor-forms': ['react-hook-form', 'react-select'],
          'vendor-utils': ['axios'],
          'vendor-tiptap': ['@tiptap/react', '@tiptap/starter-kit'],
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable minification (using esbuild - faster and built-in)
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'], // Remove console.logs and debugger in production
    },
    // Disable sourcemaps in production
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
})
