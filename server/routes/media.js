import express from 'express';

const router = express.Router();

let mediaLibrary = [
  {
    id: 'med_01',
    prompt: 'Minimalist Zen Monk silhouette standing before glowing search rankings graph, luxury sand gold and slate navy aesthetic',
    imageUrl: 'https://image.pollinations.ai/prompt/Minimalist%20Zen%20Monk%20silhouette%20standing%20before%20glowing%20search%20rankings%20graph,%20luxury%20sand%20gold%20and%20slate%20navy%20aesthetic?width=1024&height=1024&nologo=true',
    dimensions: '1024x1024',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

router.get('/library', (req, res) => {
  res.json({ success: true, items: mediaLibrary });
});

router.post('/generate', async (req, res) => {
  try {
    const { prompt = 'Zen Monk autonomous organic growth concept', width = 1024, height = 1024 } = req.body;
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;

    const item = {
      id: `med_${Date.now()}`,
      prompt,
      imageUrl,
      dimensions: `${width}x${height}`,
      created_at: new Date().toISOString()
    };

    mediaLibrary.unshift(item);
    res.json({ success: true, ...item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
