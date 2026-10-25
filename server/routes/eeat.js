import express from 'express';
import { analyzeEEAT } from '../services/eeat.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing "url" query parameter' });
  }

  try {
    const analysis = await analyzeEEAT(url);
    res.json({ success: true, ...analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Missing "url" in request body' });
  }

  try {
    const analysis = await analyzeEEAT(url);
    res.json({ success: true, ...analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
