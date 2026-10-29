import express from 'express';
import cors from 'cors';
import apiRouter from './api.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root health/info endpoints
app.get(['/api', '/'], (req, res) => {
  res.json({ success: true, service: 'Rank Monk Autonomous Backend API Live', version: '2.2.0', status: 'operational' });
});

// Mount all API endpoints under /api and root / for local dev and Vercel serverless compatibility
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

export default app;
