const https = require('https');
const fs = require('fs');

let token = '';
if (fs.existsSync('.env')) {
  const m = fs.readFileSync('.env', 'utf8').match(/AWS_BEARER_TOKEN_BEDROCK=([^\s\r\n]+)/);
  if (m) token = m[1].replace(/['"]/g, '');
}

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
      if (data.modelSummaries) {
        console.log('Total models found:', data.modelSummaries.length);
        const imageModels = data.modelSummaries.filter(m => 
          (m.providerName && m.providerName.toLowerCase().includes('stability')) ||
          (m.outputModalities && m.outputModalities.includes('IMAGE'))
        );
        // Test Google models on Bedrock
        console.log('\n--- Testing Google Models on Bedrock with this key: ---');
        const googleModels = ['google.gemma-3-27b-it', 'google.gemma-3-12b-it', 'google.gemma-3-4b-it'];
        const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
        process.env.AWS_BEARER_TOKEN_BEDROCK = token;
        const bClient = new BedrockRuntimeClient({ region: 'us-east-1' });

        for (const mid of googleModels) {
          try {
            const cmd = new ConverseCommand({
              modelId: mid,
              messages: [{ role: 'user', content: [{ text: 'Hello' }] }],
              inferenceConfig: { maxTokens: 10 }
            });
            const res = await bClient.send(cmd);
            console.log(`✅ ${mid}: WORKING (HTTP ${res.$metadata.httpStatusCode})`);
          } catch (err) {
            console.log(`❌ ${mid}: ${err.name} - ${err.message}`);
          }
        }
      } else {
        console.log('Response:', data);
      }
    } catch(e) {
      console.error(e.message);
    }
  });
});
req.on('error', e => console.error(e));
req.end();
