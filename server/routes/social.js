import express from 'express';
import { generateSocialPosts } from '../services/social.js';

const router = express.Router();

let socialFeed = [
  {
    id: 'soc_01',
    platform: 'LinkedIn',
    content: 'Why manual SEO retainers are obsolete in 2026: Autonomous agents now handle keyword clustering, Bedrock blog synthesis, and technical crawls 24/7 with zero human latency.\n\n#AutonomousSEO #SaaSGrowth',
    scheduled_for: 'Tomorrow, 10:00 AM',
    status: 'Scheduled'
  },
  {
    id: 'soc_02',
    platform: 'Twitter / X',
    content: 'Stop paying ₹1.4L/mo for agency spreadsheets. Rank Monk automates blogs, AEO citations & crawls. 🚀 #SEO2026',
    scheduled_for: 'Oct 28, 02:30 PM',
    status: 'Scheduled'
  }
];

router.get('/feed', (req, res) => {
  res.json({ success: true, feed: socialFeed });
});

router.post('/generate', async (req, res) => {
  try {
    const { topic, brandName, targetUrl } = req.body;
    const posts = await generateSocialPosts({ topic, brandName, targetUrl });
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/schedule', (req, res) => {
  const { platform, content, scheduled_for } = req.body;
  const newPost = {
    id: `soc_${Date.now()}`,
    platform: platform || 'LinkedIn',
    content,
    scheduled_for: scheduled_for || 'Next Monday, 09:00 AM',
    status: 'Scheduled'
  };
  socialFeed.unshift(newPost);
  res.json({ success: true, post: newPost });
});

export default router;
