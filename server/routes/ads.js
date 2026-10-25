import express from 'express';
import { memoryStore } from '../config/supabase.js';
import { generateAdCampaign } from '../services/ads.js';

const router = express.Router();

router.get('/campaigns', (req, res) => {
  res.json({
    success: true,
    campaigns: memoryStore.ads,
    summary: {
      totalSpend: '₹8,060',
      totalImpressions: '44,610',
      totalClicks: '2,224',
      avgCTR: '4.98%',
      avgCPC: '₹3.62'
    }
  });
});

router.post('/generate', async (req, res) => {
  try {
    const { platform = 'google', brandContext, headline, description, budget } = req.body;
    const campaign = await generateAdCampaign({ platform, brandContext, headline, description, budget });
    memoryStore.ads.unshift(campaign);
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
