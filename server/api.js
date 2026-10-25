import express from 'express';
import cors from 'cors';

import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import statsRouter from './routes/stats.js';
import projectsRouter from './routes/projects.js';
import blogsRouter from './routes/blogs.js';
import seoRouter from './routes/seo.js';
import eeatRouter from './routes/eeat.js';
import backlinksRouter from './routes/backlinks.js';
import aeoRouter from './routes/aeo.js';
import adsRouter from './routes/ads.js';
import socialRouter from './routes/social.js';
import mediaRouter from './routes/media.js';
import checkoutRouter from './routes/checkout.js';
import notificationsRouter from './routes/notifications.js';
import supportRouter from './routes/support.js';
import { generateText } from './services/bedrock.js';

const apiRouter = express.Router();

apiRouter.use(cors());
apiRouter.use(express.json({ limit: '10mb' }));
apiRouter.use(express.urlencoded({ extended: true }));

// Mount subrouters
apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/stats', statsRouter);
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/blogs', blogsRouter);
apiRouter.use('/seo', seoRouter);
apiRouter.use('/eeat-analysis', eeatRouter);
apiRouter.use('/backlinks', backlinksRouter);
apiRouter.use('/aeo', aeoRouter);
apiRouter.use('/ads', adsRouter);
apiRouter.use('/social', socialRouter);
apiRouter.use('/media', mediaRouter);
apiRouter.use('/checkout', checkoutRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/support', supportRouter);

// Legacy/Compatibility endpoints for bedrock
apiRouter.post('/bedrock/generate', async (req, res) => {
  try {
    const { prompt = 'Generate a short SEO guide', maxTokens = 2000, temperature = 0.7 } = req.body;
    const result = await generateText({ prompt, maxTokens, temperature });
    res.json({
      success: true,
      text: result.text,
      model: result.model,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/bedrock/generate-image', async (req, res) => {
  try {
    const { prompt = 'Zen Monk logo aesthetic', width = 1024, height = 1024 } = req.body;
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;
    res.json({
      success: true,
      imageUrl,
      prompt,
      dimensions: `${width}x${height}`,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default apiRouter;
