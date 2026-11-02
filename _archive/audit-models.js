const https = require('https');
const fs = require('fs');
const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

let token = '';
if (fs.existsSync('.env')) {
  const m = fs.readFileSync('.env', 'utf8').match(/AWS_BEARER_TOKEN_BEDROCK=([^\s\r\n]+)/);
  if (m) token = m[1].replace(/['"]/g, '');
}

process.env.AWS_BEARER_TOKEN_BEDROCK = token;
const client = new BedrockRuntimeClient({ region: 'us-east-1' });

// 1. Fetch all models from Bedrock API
const req = https.request({
  hostname: 'bedrock.us-east-1.amazonaws.com',
  path: '/foundation-models',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json'
  }
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', async () => {
    try {
      const data = JSON.parse(body);
      const list = data.modelSummaries || [];
      console.log(`=== Total Foundation Models on AWS Bedrock: ${list.length} ===\n`);

      // Group by Provider
      const byProvider = {};
      list.forEach(m => {
        const p = m.providerName || 'Other';
        if (!byProvider[p]) byProvider[p] = [];
        byProvider[p].push(m);
      });

      console.log('--- Models by Provider: ---');
      for (const [provider, models] of Object.entries(byProvider)) {
        console.log(`\n📦 ${provider} (${models.length} models):`);
        models.forEach(m => {
          console.log(`   • ${m.modelId} [Input: ${m.inputModalities?.join(', ')} -> Output: ${m.outputModalities?.join(', ')}]`);
        });
      }

      // Test key models live
      console.log('\n==============================================');
      console.log('🧪 LIVE CONVERSATION TEST (Finding which are working):');
      console.log('==============================================');

      const candidatesToTest = [
        'amazon.nova-pro-v1:0',
        'amazon.nova-lite-v1:0',
        'amazon.nova-micro-v1:0',
        'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
        'anthropic.claude-3-5-sonnet-20240620-v1:0',
        'anthropic.claude-3-haiku-20240307-v1:0',
        'meta.llama3-3-70b-instruct-v1:0',
        'meta.llama3-1-70b-instruct-v1:0',
        'meta.llama3-8b-instruct-v1:0',
        'mistral.mistral-large-2407-v1:0',
        'mistral.mixtral-8x7b-instruct-v0:1',
        'cohere.command-r-plus-v1:0'
      ];

      for (const modelId of candidatesToTest) {
        process.stdout.write(`Testing ${modelId.padEnd(45)} `);
        try {
          const cmd = new ConverseCommand({
            modelId,
            messages: [{ role: 'user', content: [{ text: 'Hi' }] }],
            inferenceConfig: { maxTokens: 10 }
          });
          const r = await client.send(cmd);
          console.log(`✅ WORKING (Status: ${r.$metadata.httpStatusCode})`);
        } catch (err) {
          console.log(`❌ ${err.name}: ${err.message.slice(0, 75)}...`);
        }
      }

    } catch (e) {
      console.error(e);
    }
  });
});
req.on('error', e => console.error(e));
req.end();
