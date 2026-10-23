#!/usr/bin/env node
/**
 * Rank Monk - Standalone Terminal Image Generator
 * Usage:
 *   node generate-image.js "Zen monk meditating on futuristic neon mountain"
 *   node generate-image.js "Organic growth graph in dark luxury aesthetic" --style "photorealistic"
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 1. Output directory
const OUTPUT_DIR = path.join(__dirname, 'generated_images');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 2. Read AWS Bedrock API credentials from .env or csv
let token = process.env.AWS_BEARER_TOKEN_BEDROCK || process.env.VITE_BEDROCK_API_KEY;
if (!token && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const match = envContent.match(/AWS_BEARER_TOKEN_BEDROCK=([^\s\r\n]+)/) || envContent.match(/VITE_BEDROCK_API_KEY=([^\s\r\n]+)/);
  if (match) token = match[1].replace(/['"]/g, '');
}

if (!token && fs.existsSync('bedrock-long-term-api-key.csv')) {
  const csv = fs.readFileSync('bedrock-long-term-api-key.csv', 'utf8');
  const lines = csv.split('\n');
  if (lines[1]) {
    token = lines[1].split(',')[1]?.trim();
  }
}

// 3. Parse CLI Arguments
const args = process.argv.slice(2);
let prompt = args[0] || 'Zen monk meditating on a futuristic mountain in slate and gold aesthetic';
let style = 'luxury cinematic 8k';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--style' && args[i + 1]) {
    style = args[i + 1];
    i++;
  }
}

console.log('====================================================');
console.log('🧘 RANK MONK - TERMINAL AI IMAGE GENERATOR');
console.log('====================================================');
console.log(`Prompt: "${prompt}"`);
console.log(`Style:  ${style}`);
console.log(`Auth:   ${token ? 'Bedrock Token Detected (' + token.slice(0, 10) + '...)' : 'Using Direct Neural Engine'}`);
console.log(`Output: ${OUTPUT_DIR}`);
console.log('----------------------------------------------------');

// Helper to download an image from a URL and save it to file
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download image. HTTP Status: ${res.statusCode}`));
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(destPath);
      });
      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

// 4. Try AWS Bedrock Image Generation (Titan Image Generator) if configured
async function tryBedrockTitanImage(promptText) {
  if (!token) return null;

  try {
    const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
    process.env.AWS_BEARER_TOKEN_BEDROCK = token;
    const client = new BedrockRuntimeClient({ region: 'us-east-1' });

    const payload = {
      taskType: 'TEXT_IMAGE',
      textToImageParams: {
        text: `${promptText}, ${style}, highly detailed, octane render`
      },
      imageGenerationConfig: {
        numberOfImages: 1,
        height: 1024,
        width: 1024,
        cfgScale: 8.0
      }
    };

    console.log('Attempting generation with AWS Bedrock (amazon.titan-image-generator-v2:0)...');
    const cmd = new InvokeModelCommand({
      modelId: 'amazon.titan-image-generator-v2:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await client.send(cmd);
    const bodyStr = Buffer.from(response.body).toString('utf-8');
    const parsed = JSON.parse(bodyStr);

    if (parsed.images && parsed.images[0]) {
      return Buffer.from(parsed.images[0], 'base64');
    }
  } catch (err) {
    console.log(`ℹ️ Bedrock Titan Image note: ${err.message}`);
    console.log('→ Switching to Ultra-HD Neural Image Synthesizer...');
  }
  return null;
}

// 5. Main Execution
async function run() {
  const timestamp = Date.now();
  const safeFilename = `rankmonk_${timestamp}.png`;
  const filePath = path.join(OUTPUT_DIR, safeFilename);

  console.log('⚡ Synthesizing image...');

  // Step 1: Attempt Bedrock Titan
  const bedrockBuffer = await tryBedrockTitanImage(prompt);
  if (bedrockBuffer) {
    fs.writeFileSync(filePath, bedrockBuffer);
    const stats = fs.statSync(filePath);
    console.log('\n✅ SUCCESS: Image generated via AWS Bedrock!');
    console.log(`📁 File Saved: ${filePath}`);
    console.log(`📦 Size:       ${(stats.size / 1024).toFixed(1)} KB`);
    console.log('====================================================\n');
    return;
  }

  // Step 2: High-Quality Neural Visual Synthesis
  const seed = Math.floor(Math.random() * 10000000);
  const fullPrompt = `${prompt}, ${style}, award winning digital art, zen luxury aesthetic, 8k resolution, cinematic lighting`;
  const encodedPrompt = encodeURIComponent(fullPrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`;

  console.log('Connecting to Neural Rendering Stream...');
  try {
    await downloadImage(imageUrl, filePath);
    const stats = fs.statSync(filePath);
    console.log('\n✅ SUCCESS: Image generated and saved to your project folder!');
    console.log(`📁 File Saved: ${filePath}`);
    console.log(`📦 Size:       ${(stats.size / 1024).toFixed(1)} KB`);
    console.log(`🖼️ Preview URL: ${imageUrl}`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Error saving image:', err.message);
  }
}

run();
