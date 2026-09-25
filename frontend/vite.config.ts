import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    // This is an intentionally simple single-page app — suppress the
    // default 500 kB chunk size warning; MUI + Redux + Axios together
    // is expected to exceed it without code-splitting.
    chunkSizeWarningLimit: 600,
  },
});
