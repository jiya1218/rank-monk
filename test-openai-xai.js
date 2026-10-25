const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const fs = require('fs');

let token = '';
if (fs.existsSync('.env')) {
  const m = fs.readFileSync('.env', 'utf8').match(/AWS_BEARER_TOKEN_BEDROCK=([^\s\r\n]+)/);
  if (m) token = m[1].replace(/['"]/g, '');
}

process.env.AWS_BEARER_TOKEN_BEDROCK = token;

const modelsToTest = [
  'us.openai.gpt-6-astra',
  'global.openai.gpt-6-astra',
  'us.openai.gpt-6.1-sol',
  'global.openai.gpt-6.1-sol',
  'us.openai.gpt-5.6-luna',
  'us.xai.grok-4.7',
  'global.xai.grok-4.7',
  'us.xai.grok-4.6',
  'global.xai.grok-4.6'
];

async function testOpenAIAndXAI() {
  console.log('=== Testing OpenAI & xAI on AWS Bedrock with Your Key ===\n');
  const regions = ['us-east-1', 'us-east-2'];

  for (const region of regions) {
    console.log(`\n--- Calling from ${region} ---`);
    const client = new BedrockRuntimeClient({ region });

    for (const modelId of modelsToTest) {
      process.stdout.write(`Testing ${modelId.padEnd(35)} `);
      try {
        const cmd = new ConverseCommand({
          modelId,
          messages: [{ role: 'user', content: [{ text: 'Respond with "Hello from [model]"' }] }],
          inferenceConfig: { maxTokens: 25 }
        });
        const res = await client.send(cmd);
        console.log(`✅ WORKING (HTTP ${res.$metadata.httpStatusCode})`);
        console.log(`   Response: ${res.output.message.content[0].text}`);
      } catch (err) {
        console.log(`❌ ${err.name}: ${err.message.slice(0, 85)}...`);
      }
    }
  }
}

testOpenAIAndXAI();
