// Quick validation script for AWS Bedrock API Key
const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const fs = require('fs');

// 1. Read token from .env or bedrock-long-term-api-key.csv
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

console.log('--- Testing AWS Bedrock API Key ---');
console.log('Token prefix:', token ? token.slice(0, 10) + '...' : 'NONE FOUND');

if (!token) {
  console.error('Error: No Bedrock token found.');
  process.exit(1);
}

process.env.AWS_BEARER_TOKEN_BEDROCK = token;

const regions = ['us-east-1', 'us-west-2'];
const model = 'amazon.nova-pro-v1:0';

async function testRegion(region) {
  console.log(`\nTesting region: ${region} with model: ${model}...`);
  const client = new BedrockRuntimeClient({ region });
  try {
    const cmd = new ConverseCommand({
      modelId: model,
      messages: [{ role: 'user', content: [{ text: 'Respond with: "Bedrock API key verified successfully"' }] }]
    });
    const res = await client.send(cmd);
    console.log(`✅ SUCCESS in ${region}!`);
    console.log('Response:', res.output.message.content[0].text);
    return true;
  } catch (err) {
    console.log(`❌ FAILED in ${region}:`);
    console.log(`   Type: ${err.name}`);
    console.log(`   Message: ${err.message}`);
    return false;
  }
}

async function run() {
  for (const r of regions) {
    const ok = await testRegion(r);
    if (ok) return;
  }
}

run();
