/**
 * Google Gemini & Imagen 3 Production Service
 * Powered by Google Generative AI & Imagen 3.0 API
 * (https://aistudio.google.com/app/apikey)
 */
import { env } from '../config/env.js';

const ALLOWED_ASPECT_RATIOS = ['1:1', '3:4', '4:3', '9:16', '16:9'];

/**
 * Check if Gemini is configured
 */
export function getGeminiStatus() {
  const hasKey = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 10);
  return {
    configured: hasKey,
    imageModel: env.GEMINI_IMAGE_MODEL || 'imagen-3.0-generate-002',
    textModel: 'gemini-2.0-flash'
  };
}

/**
 * Generate high-definition production image using Google Imagen 3 via Gemini API
 * @param {Object} opts
 * @param {string} opts.prompt - Base user prompt
 * @param {string} [opts.style] - Aesthetic style modifier
 * @param {string} [opts.aspectRatio='1:1'] - Aspect ratio ('1:1', '16:9', '9:16', '4:3', '3:4')
 * @param {number} [opts.sampleCount=1] - Number of images
 * @param {string} [opts.apiKey] - Optional override key
 */
export async function generateImageWithGemini({
  prompt,
  style = '',
  aspectRatio = '1:1',
  sampleCount = 1,
  apiKey = null
}) {
  const key = (apiKey || env.GEMINI_API_KEY || '').trim();

  if (!key) {
    throw new Error(
      'Gemini API Key is missing. Please add your GEMINI_API_KEY to your .env file or get a free key from https://aistudio.google.com/app/apikey'
    );
  }

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new Error('Image prompt is required to generate an image.');
  }

  // Normalize aspect ratio
  let ratio = aspectRatio.trim();
  if (!ALLOWED_ASPECT_RATIOS.includes(ratio)) {
    ratio = '1:1';
  }

  // Compose enhanced prompt
  let fullPrompt = prompt.trim();
  if (style && style.trim()) {
    fullPrompt += `, ${style.trim()}`;
  }

  const model = env.GEMINI_IMAGE_MODEL || 'imagen-3.0-generate-002';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${encodeURIComponent(key)}`;

  const requestBody = {
    instances: [
      {
        prompt: fullPrompt
      }
    ],
    parameters: {
      sampleCount: Math.min(Math.max(1, sampleCount), 4),
      aspectRatio: ratio,
      outputMimeType: 'image/jpeg'
    }
  };

  console.log(`[Gemini Imagen] Generating image with model: ${model}, aspect: ${ratio}`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || JSON.stringify(errJson);
    } catch {}

    if (response.status === 400 || response.status === 403) {
      throw new Error(`Google Gemini Imagen API Error (${response.status}): ${errorDetail}`);
    } else if (response.status === 429) {
      throw new Error('Google Gemini API rate limit / quota exceeded. Please check your AI Studio quota.');
    }
    throw new Error(`Image generation failed (${response.status}): ${errorDetail}`);
  }

  const data = await response.json();
  const predictions = data.predictions || [];

  if (!predictions.length || !predictions[0]?.bytesBase64Encoded) {
    throw new Error('Gemini Imagen model returned an empty response. The prompt may have triggered safety filters.');
  }

  const b64 = predictions[0].bytesBase64Encoded;
  const mimeType = predictions[0].mimeType || 'image/jpeg';
  const imageUrl = `data:${mimeType};base64,${b64}`;

  return {
    success: true,
    imageUrl,
    prompt: fullPrompt,
    rawPrompt: prompt,
    style,
    aspectRatio: ratio,
    model,
    mimeType,
    created_at: new Date().toISOString()
  };
}

/**
 * Fallback / Alternative text generation using Gemini (e.g. gemini-2.0-flash / gemini-1.5-flash)
 */
export async function generateTextWithGemini({
  prompt,
  systemInstruction = '',
  model = 'gemini-2.0-flash',
  temperature = 0.7,
  maxTokens = 2000,
  apiKey = null
}) {
  const key = (apiKey || env.GEMINI_API_KEY || '').trim();
  if (!key) {
    throw new Error('Gemini API key is required');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens
    }
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(`Gemini Text API error: ${errJson.error?.message || res.statusText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return {
    success: true,
    text,
    model
  };
}

