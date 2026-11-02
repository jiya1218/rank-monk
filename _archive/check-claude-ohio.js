const https = require('https');
const fs = require('fs');

let token = '';
if (fs.existsSync('.env')) {
  const m = fs.readFileSync('.env', 'utf8').match(/AWS_BEARER_TOKEN_BEDROCK=([^\s\r\n]+)/);
  if (m) token = m[1].replace(/['"]/g, '');
}

function get(region, path) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: `bedrock.${region}.amazonaws.com`,
      path,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch(e) {
          resolve({ error: e.message, body });
        }
      });
    });
    req.on('error', e => resolve({ error: e.message }));
    req.end();
  });
}

async function run() {
  console.log('--- Checking Bedrock Models & Inference Profiles ---');

  // Check us-east-2 (Ohio - as shown in the screenshot!)
  const modelsOhio = await get('us-east-2', '/foundation-models');
  if (modelsOhio.modelSummaries) {
    console.log(`\nFound ${modelsOhio.modelSummaries.length} models in us-east-2 (Ohio):`);
    const claudeModels = modelsOhio.modelSummaries.filter(m => m.providerName?.toLowerCase().includes('anthropic') || m.modelId?.toLowerCase().includes('claude'));
    console.log(`Found ${claudeModels.length} Claude models in us-east-2:`);
    claudeModels.forEach(m => console.log('  • ' + m.modelId));
  } else {
    console.log('Ohio error or response:', modelsOhio);
  }

  // Check Inference Profiles (Cross-region inference profiles)
  console.log('\n--- Checking Inference Profiles in us-east-1 & us-east-2 ---');
  const profilesEast1 = await get('us-east-1', '/inference-profiles');
  if (profilesEast1.inferenceProfileSummaries) {
    console.log(`Found ${profilesEast1.inferenceProfileSummaries.length} inference profiles in us-east-1:`);
    profilesEast1.inferenceProfileSummaries.forEach(p => {
      console.log(`  • ${p.inferenceProfileId} (${p.inferenceProfileName})`);
    });
  }

  const profilesEast2 = await get('us-east-2', '/inference-profiles');
  if (profilesEast2.inferenceProfileSummaries) {
    console.log(`Found ${profilesEast2.inferenceProfileSummaries.length} inference profiles in us-east-2:`);
    profilesEast2.inferenceProfileSummaries.forEach(p => {
      console.log(`  • ${p.inferenceProfileId} (${p.inferenceProfileName})`);
    });
  }
}

run();
