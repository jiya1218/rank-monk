import express from 'express';
import { generateBedrockImage } from '../services/bedrock.js';
import { generateImageWithGemini, getGeminiStatus } from '../services/gemini.js';
import { env } from '../config/env.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

let mediaLibrary = [
  {
    id: 'med_01',
    prompt: 'Minimalist Zen Monk silhouette meditating before a glowing search graph, luxury sand gold and slate navy palette',
    imageUrl: 'assets/rank-monk-logo-horizontal.png',
    aspectRatio: '16:9',
    model: 'Google Imagen 3 (imagen-3.0-generate-002)',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

/**
 * GET /api/media/status
 * Check active engine (Google Gemini Imagen 3 vs AWS Bedrock)
 */
router.get('/status', (req, res) => {
  const gemini = getGeminiStatus();
  if (gemini.configured) {
    const payload = {
      configured: true,
      activeEngine: 'gemini',
      model: gemini.imageModel,
      modelDisplay: 'Google Imagen 3 (imagen-3.0-generate-002)',
      provider: 'Google Gemini',
      region: 'Google Cloud Global'
    };
    return res.json({
      success: true,
      engine: payload,
      gemini: payload
    });
  }

  const bedrockPayload = {
    configured: Boolean(env.BEDROCK_BEARER_TOKEN),
    activeEngine: 'bedrock',
    model: 'stability.stable-image-core-v1:1',
    modelDisplay: 'Stability Stable Image Core v1.1',
    region: 'us-west-2',
    provider: 'AWS Bedrock',
    secondaryModel: 'stability.sd3-5-large-v1:0'
  };

  res.json({
    success: true,
    engine: bedrockPayload,
    bedrock: bedrockPayload
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
 * Generate visual asset: Prioritizes Google Gemini Imagen 3, falls back to AWS Bedrock
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      prompt,
      style = 'zen minimalist aesthetic, architectural lighting, luxury sand gold and slate navy palette',
      aspectRatio = '1:1',
      apiKey
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'Prompt is required.' });
    }

    const geminiKey = (apiKey || env.GEMINI_API_KEY || '').trim();
    let result = null;

    if (geminiKey && geminiKey.length > 10) {
      console.log(`[Media Route] Generating visual via Google Gemini Imagen 3: "${prompt.slice(0, 50)}..."`);
      try {
        result = await generateImageWithGemini({
          prompt,
          style,
          aspectRatio,
          apiKey: geminiKey
        });
      } catch (geminiErr) {
        console.warn('[Media Route] Gemini Imagen error, trying AWS Bedrock fallback:', geminiErr.message);
      }
    }

    if (!result) {
      console.log(`[Media Route] Generating visual via AWS Bedrock: "${prompt.slice(0, 50)}..."`);
      result = await generateBedrockImage({
        prompt,
        style,
        aspectRatio
      });
    }

    const item = {
      id: `med_${Date.now()}`,
      prompt: result.prompt,
      rawPrompt: result.rawPrompt,
      style: result.style,
      imageUrl: result.imageUrl,
      aspectRatio: result.aspectRatio,
      model: result.model || 'Google Imagen 3 (imagen-3.0-generate-002)',
      provider: result.provider || 'gemini',
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
