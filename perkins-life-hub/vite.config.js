import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@integrations': '/src/integrations',
      '@services': '/src/services',
      '@data': '/src/data',
      '@hooks': '/src/hooks',
      '@pages': '/src/pages',
    },
  },
  server: { port: 5173 },
});
