import '../server/config/env.js';
import app from '../server/app.js';

export const config = {
  maxDuration: 60
};

export default function handler(req, res) {
  const orig = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.headers['x-original-url'];
  if (orig && orig.startsWith('/api')) {
    req.url = orig;
  } else if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
