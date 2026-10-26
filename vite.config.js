import { resolve } from 'path';
import { defineConfig } from 'vite';
import app from './server/app.js';

function productionBackendPlugin() {
  return {
    name: 'rankmonk-backend-api-plugin',
    configureServer(server) {
      // Clean URLs rewrite (e.g. /dashboard -> /dashboard.html, /pricing -> /pricing.html)
      server.middlewares.use((req, res, next) => {
        if (req.method === 'GET' && !req.url.startsWith('/api') && !req.url.includes('.')) {
          const [pathPart, queryPart] = req.url.split('?');
          const clean = pathPart.replace(/^\//, '');
          if (clean) {
            req.url = '/' + clean + '.html' + (queryPart ? '?' + queryPart : '');
          }
        }
        next();
      });

      // Mount Express full-stack API server directly on Vite middleware
      server.middlewares.use(app);
      console.log('⚡ [Vite Server] Rank Monk Production Backend API mounted on /api');
    }
  };
}

export default defineConfig({
  plugins: [productionBackendPlugin()],
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        features: resolve(__dirname, 'features.html'),
        engines: resolve(__dirname, 'engines.html'),
        comparison: resolve(__dirname, 'comparison.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        faq: resolve(__dirname, 'faq.html'),
        login: resolve(__dirname, 'login.html'),
        signup: resolve(__dirname, 'signup.html'),
        onboarding: resolve(__dirname, 'onboarding.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        terms: resolve(__dirname, 'terms.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        eeatAnalysis: resolve(__dirname, 'eeat-analysis.html'),
        useCases: resolve(__dirname, 'use-cases.html'),
        roadmap: resolve(__dirname, 'roadmap.html'),
        changelog: resolve(__dirname, 'changelog.html'),
        affiliate: resolve(__dirname, 'affiliate.html'),
        careers: resolve(__dirname, 'careers.html'),
        blog: resolve(__dirname, 'blog.html'),
        helpCenter: resolve(__dirname, 'help-center.html'),
        apiDocs: resolve(__dirname, 'api-docs.html'),
        caseStudies: resolve(__dirname, 'case-studies.html'),
        glossary: resolve(__dirname, 'glossary.html'),
      },
    },
  },
});
