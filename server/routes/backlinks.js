import express from 'express';
import { memoryStore, supabaseAdmin } from '../config/supabase.js';
import { generateColdPitch } from '../services/bedrock.js';

const router = express.Router();

router.get('/', async (req, res) => {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.from('prospects').select('*');
      if (!error && data && data.length > 0) {
        return res.json({ success: true, backlinks: data });
      }
    } catch {}
  }
  res.json({ success: true, backlinks: memoryStore.backlinks });
});

router.post('/generate-pitch', async (req, res) => {
  try {
    const { prospectDomain, recipientName, myBrand, articleTopic, targetUrl, anchorText } = req.body;
    if (!prospectDomain) {
      return res.status(400).json({ error: 'prospectDomain is required' });
    }

    const pitch = await generateColdPitch({
      prospectDomain,
      recipientName: recipientName || 'Editor',
      myBrand: myBrand || 'Rank Monk',
      articleTopic,
      targetUrl,
      anchorText
    });

    res.json({ success: true, pitch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const item = memoryStore.backlinks.find(b => b.id === id);
  if (item && status) {
    item.status = status;
  }
  res.json({ success: true, backlink: item });
});

export default router;
