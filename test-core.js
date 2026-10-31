import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { env } from './server/config/env.js';

console.log('env.BEDROCK_BEARER_TOKEN length:', env.BEDROCK_BEARER_TOKEN?.length);
console.log('process.env.AWS_BEARER_TOKEN_BEDROCK before:', process.env.AWS_BEARER_TOKEN_BEDROCK);

// Test without process.env.AWS_BEARER_TOKEN_BEDROCK set
const client = new BedrockRuntimeClient({
  region: 'us-west-2'
});

const bodyPayload = JSON.stringify({
  prompt: 'a girl reading books in library',
  aspect_ratio: '1:1',
  output_format: 'png',
  mode: 'text-to-image'
});

const cmd = new InvokeModelCommand({
  modelId: 'stability.stable-image-core-v1:1',
  contentType: 'application/json',
  accept: 'application/json',
  body: Buffer.from(bodyPayload)
});

try {
  const res = await client.send(cmd);
  console.log('SUCCESS without manual process.env!');
} catch (err) {
  console.error('FAILED without manual process.env:', err.message);
}

// Now test WITH process.env.AWS_BEARER_TOKEN_BEDROCK set:
process.env.AWS_BEARER_TOKEN_BEDROCK = env.BEDROCK_BEARER_TOKEN;
const client2 = new BedrockRuntimeClient({
  region: 'us-west-2'
});
try {
  const res2 = await client2.send(cmd);
  console.log('SUCCESS with manual process.env!');
} catch (err2) {
  console.error('FAILED with manual process.env:', err2.message);
}
