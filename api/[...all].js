import app from '../server/app.js';

export default function handler(req, res) {
  // Restore original request path if Vercel rewrite or proxy collapsed it
  const orig = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'];
  if (orig && orig.startsWith('/api') && (req.url === '/api' || req.url === '/api/')) {
    req.url = orig;
  }
  return app(req, res);
}
