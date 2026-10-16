import { Router } from 'express';

export function createHealthRouter({ databaseConfigured }) {
  const router = Router();
  router.get('/', (_req, res) =>
    res.json({
      ok: true,
      app: 'puzzld',
      database: databaseConfigured ? 'configured' : 'not-configured',
    }),
  );
  return router;
}
