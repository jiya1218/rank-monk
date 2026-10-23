import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

function bedrockPlugin() {
  return {
    name: 'bedrock-api-handler',
    configureServer(server) {
      const env = loadEnv('', process.cwd(), '');
      const BEDROCK_TOKEN = env.AWS_BEARER_TOKEN_BEDROCK || env.VITE_BEDROCK_API_KEY || process.env.AWS_BEARER_TOKEN_BEDROCK || '';

      // 1. Text Generation Endpoint via AWS Bedrock (amazon.nova-pro-v1:0)
      server.middlewares.use('/api/bedrock/generate', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }

        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const prompt = data.prompt || 'Generate a short SEO guide';
            process.env.AWS_BEARER_TOKEN_BEDROCK = BEDROCK_TOKEN;

            const client = new BedrockRuntimeClient({ region: 'us-east-1' });
            const cmd = new ConverseCommand({
              modelId: 'amazon.nova-pro-v1:0',
              messages: [{ role: 'user', content: [{ text: prompt }] }],
              inferenceConfig: {
                maxTokens: data.maxTokens || 2000,
                temperature: data.temperature ?? 0.7
              }
            });

            const result = await client.send(cmd);
            const text = result.output.message.content[0].text;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              text,
              model: 'amazon.nova-pro-v1:0 (AWS Bedrock)',
              timestamp: new Date().toISOString()
            }));
          } catch (err) {
            console.error('[Bedrock Server] Error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });

      // 2. Media Studio Image Generation Endpoint
      server.middlewares.use('/api/bedrock/generate-image', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }

        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const prompt = data.prompt || 'Zen Monk logo aesthetic';
            const width = data.width || 1024;
            const height = data.height || 1024;
            const seed = Math.floor(Math.random() * 1000000);

            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              imageUrl,
              prompt,
              dimensions: `${width}x${height}`,
              created_at: new Date().toISOString()
            }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [bedrockPlugin()],
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        features: resolve(__dirname, 'features.html'),
        engines: resolve(__dirname, 'engines.html'),
        comparison: resolve(__dirname, 'comparison.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        faq: resolve(__dirname, 'faq.html'),
        login: resolve(__dirname, 'login.html'),
        signup: resolve(__dirname, 'signup.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      },
    },
  },
});
