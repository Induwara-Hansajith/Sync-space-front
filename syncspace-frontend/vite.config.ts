import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Required polyfill for SockJS in browser environment
    global: 'window',
  },
  server: {
    port: 3000,
    host: true,
  },
});
