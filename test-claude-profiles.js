const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const fs = require('fs');

let token = '';
if (fs.existsSync('.env')) {
  const m = fs.readFileSync('.env', 'utf8').match(/AWS_BEARER_TOKEN_BEDROCK=([^\s\r\n]+)/);
  if (m) token = m[1].replace(/['"]/g, '');
}

process.env.AWS_BEARER_TOKEN_BEDROCK = token;

const modelsToTest = [
  'us.anthropic.claude-haiku-5-5',
  'global.anthropic.claude-haiku-5-5',
  'us.anthropic.claude-sonnet-5-5',
  'global.anthropic.claude-sonnet-5-5',
  'us.anthropic.claude-opus-5-5',
  'global.anthropic.claude-opus-5-5',
  'us.anthropic.claude-fable-5-1',
  'us.anthropic.claude-sonnet-5',
  'us.anthropic.claude-opus-5',
  'us.anthropic.claude-opus-4-8',
  'us.anthropic.claude-opus-4-7'
];

async function testProfiles() {
  console.log('=== Testing Claude Cross-Region Profiles with Your Key ===\n');
  const regions = ['us-east-1', 'us-east-2'];

  for (const region of regions) {
    console.log(`\n--- Calling from ${region} ---`);
    const client = new BedrockRuntimeClient({ region });

    for (const modelId of modelsToTest) {
      process.stdout.write(`Testing ${modelId.padEnd(40)} `);
      try {
        const cmd = new ConverseCommand({
          modelId,
          messages: [{ role: 'user', content: [{ text: 'Say hello in 5 words.' }] }],
          inferenceConfig: { maxTokens: 20 }
        });
        const res = await client.send(cmd);
        console.log(`✅ WORKING (HTTP ${res.$metadata.httpStatusCode})`);
        console.log(`   Response: ${res.output.message.content[0].text}`);
      } catch (err) {
        console.log(`❌ ${err.name}: ${err.message}`);
      }
    }
  }
}

testProfiles();
