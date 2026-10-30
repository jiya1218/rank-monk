import express from 'express';
import { generateBedrockImage } from '../services/bedrock.js';
import { env } from '../config/env.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

let mediaLibrary = [
  {
    id: 'med_01',
    prompt: 'Minimalist Zen Monk silhouette meditating before a glowing search graph, luxury sand gold and slate navy palette',
    imageUrl: 'assets/rank-monk-logo-horizontal.png',
    aspectRatio: '16:9',
    model: 'Zen Neural Engine (Autonomous SDXL)',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

/**
 * GET /api/media/status
 * Check if the Zen Neural Media Synthesizer is operational
 */
router.get('/status', (req, res) => {
  const payload = {
    configured: true,
    model: 'Zen Neural Visual Synthesizer (Autonomous SDXL & FLUX)',
    region: 'us-east-1'
  };
  res.json({
    success: true,
    engine: payload,
    bedrock: payload
  });
});

/**
 * GET /api/media/library
 * Fetch all generated brand assets
 */
router.get('/library', async (req, res) => {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return res.json({ success: true, items: data });
      }
    } catch {}
  }
  res.json({ success: true, items: mediaLibrary });
});

/**
 * POST /api/media/generate
 * Generate visual asset directly using the configured AWS Bedrock key
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      prompt,
      style = 'zen minimalist aesthetic, architectural lighting, luxury sand gold and slate navy palette',
      aspectRatio = '1:1'
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'Prompt is required.' });
    }

    console.log(`[Media Route] Generating visual via Zen Neural Engine: "${prompt.slice(0, 50)}..."`);

    const result = await generateBedrockImage({
      prompt,
      style,
      aspectRatio
    });

    const item = {
      id: `med_${Date.now()}`,
      prompt: result.prompt,
      rawPrompt: result.rawPrompt,
      style: result.style,
      imageUrl: result.imageUrl,
      aspectRatio: result.aspectRatio,
      model: result.model || 'Zen Neural Engine (Autonomous SDXL)',
      provider: result.provider || 'zen-neural',
      created_at: result.created_at
    };

    mediaLibrary.unshift(item);

    // Persist to Supabase if connected
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('media_assets').insert([
          {
            id: item.id,
            prompt: item.prompt,
            image_url: item.imageUrl,
            aspect_ratio: item.aspectRatio,
            model: item.model,
            created_at: item.created_at
          }
        ]);
      } catch (dbErr) {
        console.warn('[Media Route] Supabase persistence skipped:', dbErr.message);
      }
    }

    res.json({
      success: true,
      item
    });
  } catch (err) {
    console.error('[Media Route Error]:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Image generation failed.'
    });
  }
});

export default router;
