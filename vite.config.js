import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        features: resolve(__dirname, 'features.html'),
        engines: resolve(__dirname, 'engines.html'),
        comparison: resolve(__dirname, 'comparison.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        faq: resolve(__dirname, 'faq.html'),
      },
    },
  },
});
