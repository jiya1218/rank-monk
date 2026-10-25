import express from 'express';
import { getAeoSeedPrompts, simulateAeoScan } from '../services/aeo.js';

const router = express.Router();

router.get('/prompts', (req, res) => {
  const { brandName = 'Rank Monk', domain = 'rankmonk.com' } = req.query;
  const prompts = getAeoSeedPrompts(brandName, domain);
  res.json({ success: true, prompts });
});

router.post('/scan', async (req, res) => {
  try {
    const { brandName = 'Rank Monk', domain = 'rankmonk.com', query } = req.body;
    const scanResult = await simulateAeoScan({ brandName, domain, query });
    res.json({ success: true, ...scanResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
