// Standalone build config for the public MARKETING site.
// Produces a self-contained static bundle (dist-marketing/) containing ONLY
// the marketing pages — Landing, Product, Solutions, Industries, Compliance, Contact.
//
// Usage:
//   npx vite build --config vite.marketing.config.js
//   npx vite        --config vite.marketing.config.js   (local preview)
//
// Deploy the resulting dist-marketing/ folder behind WordPress (see MARKETING_DEPLOY.md).
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Serve the marketing/ folder as the app root so its index.html is the entry.
  root: path.resolve(__dirname, './marketing'),
  build: {
    outDir: path.resolve(__dirname, './dist-marketing'),
    emptyOutDir: true,
  },
});