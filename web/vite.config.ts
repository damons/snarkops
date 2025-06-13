import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://caladan:1234',
        changeOrigin: true,
        ws: true,
      },
    },
  }
});
