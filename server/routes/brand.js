import express from 'express';
import { extractBrandFromDomain } from '../services/brandExtractor.js';
import { memoryStore, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

router.post('/extract', async (req, res) => {
  const { domain, url } = req.body;
  const target = domain || url;

  if (!target) {
    return res.status(400).json({ error: 'Domain or URL is required for brand extraction' });
  }

  try {
    console.log(`[Brand Route] Extracting brand identity for: ${target}`);
    const brandData = await extractBrandFromDomain(target);

    // Save as project in memoryStore
    const newProject = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: brandData.brandName,
      domain: brandData.domain,
      website: brandData.website,
      industry: brandData.industry,
      businessCategory: brandData.category,
      targetAudience: brandData.targetAudience,
      brand_logo_url: brandData.logoUrl,
      favicon_url: brandData.faviconUrl,
      palette: brandData.palette,
      competitors: brandData.competitors,
      voiceSliders: brandData.voiceSliders,
      voiceTags: brandData.voiceTags,
      crawledPages: brandData.initialCrawledPages,
      gscConnected: false,
      aeoScore: 78,
      articles: [],
      created_at: new Date().toISOString()
    };

    memoryStore.projects.unshift(newProject);

    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('projects').insert(newProject);
      } catch (err) {
        console.warn('[Brand Route] Supabase project insert note:', err.message);
      }
    }

    res.json({
      success: true,
      project: newProject,
      brand: brandData
    });
  } catch (err) {
    console.error('[Brand Route] Extraction error:', err);
    res.status(500).json({ error: err.message || 'Brand extraction failed' });
  }
});

export default router;
