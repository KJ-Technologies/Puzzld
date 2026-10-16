import { Router } from 'express';
import { getStats } from '../services/stats-service.js';

export function createStatsRouter(dependencies) {
  const router = Router();
  router.get('/', async (_req, res) => {
    try {
      res.set('Cache-Control', 'no-store');
      res.json(await getStats(dependencies));
    } catch (error) {
      console.warn('Could not load puzzle stats:', error.message);
      res.status(503).json({ error: 'Stats temporarily unavailable' });
    }
  });
  return router;
}
