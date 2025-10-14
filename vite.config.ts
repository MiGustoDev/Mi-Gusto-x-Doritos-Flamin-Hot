import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/crunchy/', // <-- Cambiado para producción en subcarpeta
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom']
  },
  build: {
    // Optimizaciones de build para mejor rendimiento
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks para mejor caching
          vendor: ['react', 'react-dom'],
        },
      },
    },
    // Configuración para assets
    assetsInlineLimit: 4096, // Inline assets pequeños
    chunkSizeWarningLimit: 1000, // Aumentar límite de warning
  },
  server: {
    // Optimizaciones para desarrollo
    hmr: {
      overlay: false
    }
  }
});
