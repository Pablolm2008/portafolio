import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // En GitHub Pages el sitio vive bajo /portafolio/. El workflow define VITE_BASE_PATH.
  base: process.env.VITE_BASE_PATH || '/',
  build: { target: 'es2020' },
});
