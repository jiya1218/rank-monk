import express from 'express';
import cors from 'cors';
import apiRouter from './api.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
