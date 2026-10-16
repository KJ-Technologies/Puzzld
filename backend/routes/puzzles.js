import { Router } from 'express';
import { listPuzzles } from '../services/puzzle-service.js';

export function createPuzzlesRouter(dependencies) {
  const router = Router();
  router.get('/', async (_req, res) => res.json(await listPuzzles(dependencies)));
  return router;
}
