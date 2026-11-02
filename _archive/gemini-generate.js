#!/usr/bin/env node
/**
 * Rank Monk - Google Gemini / Imagen Terminal Generator
 * Requires a Google Gemini API Key in .env: GEMINI_API_KEY=AIzaSy...
 * Get one for free at: https://aistudio.google.com/
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// 1. Read Google Gemini API Key from .env
let geminiKey = process.env.GEMINI_API_KEY;
if (!geminiKey && fs.existsSync('.env')) {
  const m = fs.readFileSync('.env', 'utf8').match(/GEMINI_API_KEY=([^\s\r\n]+)/);
  if (m) geminiKey = m[1].replace(/['"]/g, '');
}

const prompt = process.argv.slice(2).join(' ') || 'A girl eating noodles on a mountain peak at sunrise, photorealistic';

console.log('====================================================');
console.log('✨ GOOGLE GEMINI / IMAGEN TERMINAL GENERATOR');
console.log(`Prompt: "${prompt}"`);
console.log('====================================================');

if (!geminiKey) {
  console.log('\n⚠️ No GEMINI_API_KEY found in your .env file.');
  console.log('Your current key in .env (ABSK...) is an Amazon AWS Bedrock key.');
  console.log('To use Google Gemini directly:');
  console.log('1. Get a free API key at: https://aistudio.google.com/');
  console.log('2. Add to your .env: GEMINI_API_KEY=AIzaSy...');
  console.log('3. Re-run: node gemini-generate.js "' + prompt + '"\n');
  process.exit(0);
}

// When Google Gemini key is present, calls Imagen 3 endpoint
console.log('Connecting to Google AI Studio Imagen 3 endpoint...');
const payload = JSON.stringify({
  instances: [{ prompt }],
  parameters: { sampleCount: 1, aspectRatio: "1:1" }
});

const req = https.request({
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
        const outDir = path.join(__dirname, 'generated_images');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

        const filename = `gemini_imagen_${Date.now()}.png`;
        const filePath = path.join(outDir, filename);

        fs.writeFileSync(filePath, Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64'));
        console.log(`\n✅ SUCCESS: Image generated with Google Imagen!`);
        console.log(`📁 File Saved: ${filePath}\n`);
      } else {
        console.error('API Error Response:', data);
      }
    } catch (e) {
      console.error('Parse error:', e.message);
    }
  });
});

req.on('error', err => console.error('Request error:', err.message));
req.write(payload);
req.end();
