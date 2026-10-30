import express from 'express';
import cors from 'cors';
import apiRouter from './api.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root API health/info endpoint (strictly on /api, never hijack root / frontend)
app.get('/api', (req, res) => {
  res.json({ success: true, service: 'Rank Monk Autonomous Backend API Live', version: '2.2.0', status: 'operational' });
});

// Mount all API endpoints under /api
app.use('/api', apiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

export default app;
