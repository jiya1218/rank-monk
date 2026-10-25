import express from 'express';
import { memoryStore } from '../config/supabase.js';

const router = express.Router();

let isGscConnected = false;

router.get('/', (req, res) => {
  const { range = '30d' } = req.query;

  // Multipliers based on timeframe
  let trafficMultiplier = 1;
  let days = 30;
  if (range === '7d') {
    trafficMultiplier = 0.25;
    days = 7;
  } else if (range === '90d') {
    trafficMultiplier = 2.8;
    days = 90;
  } else if (range === 'all') {
    trafficMultiplier = 6.2;
    days = 180;
  }

  const baseOrganic = Math.round(28400 * trafficMultiplier);
  const baseImpressions = Math.round(412900 * trafficMultiplier);

  // Generate chart data points
  const history = [];
  const now = Date.now();
  for (let i = days; i >= 0; i -= Math.max(1, Math.floor(days / 15))) {
    const d = new Date(now - i * 86400000);
    history.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      traffic: Math.round((baseOrganic / days) * (1 + (Math.sin(i / 3) * 0.2))),
      impressions: Math.round((baseImpressions / days) * (1 + (Math.cos(i / 2) * 0.25)))
    });
  }

  res.json({
    success: true,
    timeframe: range,
    gscConnected: isGscConnected,
    metrics: {
      organicTraffic: {
        value: baseOrganic.toLocaleString('en-IN'),
        trend: '+24.8%',
        isPositive: true,
        locked: !isGscConnected,
        lockMessage: 'Google Search Console required to display verified organic traffic.'
      },
      impressions: {
        value: baseImpressions.toLocaleString('en-IN'),
        trend: '+38.2%',
        isPositive: true,
        locked: !isGscConnected,
        lockMessage: 'Google Search Console required to display verified impressions.'
      },
      avgCTR: {
        value: '4.92%',
        trend: '+0.8%',
        isPositive: true
      },
      activeKeywords: {
        value: '348',
        top3: 28,
        top10: 114,
        top50: 206,
        trend: '+19.4%'
      },
      domainAuthority: {
        value: 42,
        scale: 100,
        trend: '+4 pts'
      },
      crawlHealthScore: {
        value: 94,
        scale: 100,
        issuesCount: 3
      },
      aeoVisibilityScore: {
        value: '78%',
        enginesCount: 4,
        citedCount: 3
      }
    },
    history
  });
});

router.post('/toggle-gsc', (req, res) => {
  isGscConnected = !isGscConnected;
  res.json({
    success: true,
    gscConnected: isGscConnected,
    message: isGscConnected ? 'Google Search Console connected successfully!' : 'Google Search Console disconnected.'
  });
});

export default router;
