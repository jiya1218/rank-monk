import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import app from './server/app.js';
import { env } from './server/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets
const distPath = path.join(__dirname, 'dist');
const publicPath = path.join(__dirname);

app.use(express.static(distPath));
app.use(express.static(publicPath));

// Explicit SEO routes for search engines
app.get('/sitemap.xml', (req, res) => {
  const filePath = path.join(distPath, 'sitemap.xml');
  res.type('application/xml').sendFile(filePath, (err) => {
    if (err) res.sendFile(path.join(__dirname, 'sitemap.xml'));
  });
});

app.get('/robots.txt', (req, res) => {
  const filePath = path.join(distPath, 'robots.txt');
  res.type('text/plain').sendFile(filePath, (err) => {
    if (err) res.sendFile(path.join(__dirname, 'robots.txt'));
  });
});

// Fallback routing for HTML pages (Express v5 compatible)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Try finding the exact HTML file
  let requestedFile = req.path === '/' ? 'index.html' : req.path.replace(/^\//, '');
  if (!requestedFile.endsWith('.html') && !path.extname(requestedFile)) {
    requestedFile += '.html';
  }

  const distFilePath = path.join(distPath, requestedFile);
  const rootFilePath = path.join(__dirname, requestedFile);
  
  res.sendFile(distFilePath, (err) => {
    if (err) {
      res.sendFile(rootFilePath, (err2) => {
        if (err2) {
          res.sendFile(path.join(distPath, 'index.html'), (err3) => {
            if (err3) res.sendFile(path.join(__dirname, 'index.html'));
          });
        }
      });
    }
  });
});

const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  🎋 RANK MONK — Production Backend Server Live`);
  console.log(`  🌐 URL: http://localhost:${PORT}`);
  console.log(`  📡 API Health: http://localhost:${PORT}/api/health`);
  console.log(`  📊 Stats API: http://localhost:${PORT}/api/stats`);
  console.log(`  📝 Blogs API: http://localhost:${PORT}/api/blogs`);
  console.log(`  🔍 SEO Crawl: http://localhost:${PORT}/api/seo/latest`);
  console.log(`  💳 Checkout: http://localhost:${PORT}/api/checkout/subscription`);
  console.log(`======================================================\n`);
});
