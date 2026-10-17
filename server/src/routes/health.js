import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'rivalradar-api',
    timestamp: new Date().toISOString(),
    tinyfishConfigured: !!process.env.TINYFISH_API_KEY,
  });
});
