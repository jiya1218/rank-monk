import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { env } from '../server/config/env.js';
import fs from 'fs';

console.log('--- Testing AWS Bedrock Image Generation with user API key ---');
console.log('Token present:', Boolean(env.BEDROCK_BEARER_TOKEN));
console.log('Token preview:', env.BEDROCK_BEARER_TOKEN?.slice(0, 20) + '...');

process.env.AWS_BEARER_TOKEN_BEDROCK = env.BEDROCK_BEARER_TOKEN;

const regions = ['us-east-1', 'us-west-2'];
const models = [
  { id: 'stability.stable-image-core-v1:1', type: 'stability' },
  { id: 'stability.sd3-5-large-v1:0', type: 'stability' },
  { id: 'amazon.titan-image-generator-v2:0', type: 'titan' },
  { id: 'amazon.titan-image-generator-v1', type: 'titan' }
];

const prompt = 'Futuristic AI automation and digital marketing command center for Scalezix in Ahmedabad, holographic neon graphs, luxury obsidian and gold, 8k resolution photorealistic';

async function testBedrock() {
  for (const region of regions) {
    console.log(`\nTesting region: ${region}...`);
    const client = new BedrockRuntimeClient({ region });

    for (const model of models) {
      console.log(`  Trying model: ${model.id} in ${region}...`);
      try {
        let bodyPayload = '';
        if (model.type === 'stability') {
          bodyPayload = JSON.stringify({
            prompt: prompt,
            aspect_ratio: '1:1',
            output_format: 'jpeg',
            mode: 'text-to-image'
          });
        } else if (model.type === 'titan') {
          bodyPayload = JSON.stringify({
            taskType: 'TEXT_IMAGE',
            textToImageParams: {
              text: prompt
            },
            imageGenerationConfig: {
              numberOfImages: 1,
              height: 1024,
              width: 1024,
              cfgScale: 8.0
            }
          });
        }

        const cmd = new InvokeModelCommand({
          modelId: model.id,
          contentType: 'application/json',
          accept: 'application/json',
          body: Buffer.from(bodyPayload)
        });

        const res = await client.send(cmd);
        const resBody = JSON.parse(new TextDecoder().decode(res.body));
        console.log(`  >>> SUCCESS with ${model.id} in ${region}!`);
        
        let base64Data = null;
        if (resBody.images && resBody.images[0]) {
          base64Data = resBody.images[0];
        } else if (resBody.artifacts && resBody.artifacts[0] && resBody.artifacts[0].base64) {
          base64Data = resBody.artifacts[0].base64;
        }

        if (base64Data) {
          const outPath = `assets/bedrock-scalezix-${region}-${model.id.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
          fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
          console.log(`  >>> SAVED REAL BEDROCK IMAGE TO: ${outPath} (${fs.statSync(outPath).size} bytes)`);
          return outPath;
        }
      } catch (err) {
        console.log(`  Failed ${model.id} in ${region}: ${err.name} - ${err.message}`);
      }
    }
  }
}

testBedrock().then((res) => {
  console.log('\nFinal test result:', res || 'None succeeded directly');
}).catch(console.error);

