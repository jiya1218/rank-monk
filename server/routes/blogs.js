import express from 'express';
import { memoryStore, supabaseAdmin } from '../config/supabase.js';
import { generateBlogArticle } from '../services/bedrock.js';

const router = express.Router();

router.get('/', async (req, res) => {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.from('content_items').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return res.json({ success: true, articles: data });
      }
    } catch {}
  }
  res.json({ success: true, articles: memoryStore.blogs });
});

router.post('/generate', async (req, res) => {
  try {
    const {
      keyword,
      tone = 'Professional & Authoritative',
      targetCountry = 'Global',
      wordCountTarget = 1500,
      includeFaq = true,
      includeToc = true,
      brandName = 'Rank Monk'
    } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: 'Primary target keyword is required' });
    }

    console.log(`[Blogs Route] Generating autonomous article for keyword: "${keyword}" via AWS Bedrock`);
    const article = await generateBlogArticle({
      keyword,
      tone,
      targetCountry,
      wordCountTarget: Number(wordCountTarget) || 1500,
      includeFaq: Boolean(includeFaq),
      includeToc: Boolean(includeToc),
      brandName
    });

    memoryStore.blogs.unshift(article);

    // Add alert notification
    memoryStore.notifications.unshift({
      id: `notif_${Date.now()}`,
      title: 'Blog Article Published',
      message: `"${article.title}" generated with SEO Score ${article.seo_score}/100.`,
      type: 'success',
      read: false,
      timestamp: 'Just now'
    });

    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('content_items').insert({
          main_keyword: keyword,
          h1: article.title,
          word_count_target: article.word_count,
          tone,
          target_country: targetCountry,
          status: 'published'
        });
      } catch (err) {
        console.warn('[Blogs Route] Supabase content_items insert note:', err.message);
      }
    }

    res.json({ success: true, article });
  } catch (err) {
    console.error('[Blogs Route] Generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to synthesize blog article' });
  }
});

router.post('/bulk-generate', async (req, res) => {
  try {
    const { topics = [], brandName = 'Rank Monk' } = req.body;
    const topicList = Array.isArray(topics) && topics.length > 0 ? topics : [
      'Autonomous SEO agents vs traditional marketing agencies',
      'How to optimize web vitals for Google Core Updates',
      'The complete guide to Generative Engine Optimization GEO'
    ];

    const generated = [];
    for (const kw of topicList.slice(0, 5)) {
      const art = await generateBlogArticle({
        keyword: kw,
        brandName,
        wordCountTarget: 1200
      });
      memoryStore.blogs.unshift(art);
      generated.push(art);
    }

    res.json({ success: true, count: generated.length, articles: generated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = memoryStore.blogs.findIndex(b => b.id === id);
  if (index !== -1) {
    memoryStore.blogs.splice(index, 1);
  }
  res.json({ success: true, message: 'Article deleted successfully' });
});

export default router;
