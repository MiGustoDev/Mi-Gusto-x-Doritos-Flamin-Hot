import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/crunchy/', // <-- Cambiado para producción en subcarpeta
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
