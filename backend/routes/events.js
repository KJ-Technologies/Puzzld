import { Router } from 'express';
import { recordEvent, validateEvent } from '../services/event-service.js';

export function createEventsRouter(dependencies) {
  const router = Router();
  router.post('/', async (req, res) => {
    const validationError = validateEvent({ ...req.body, catalogue: dependencies.catalogue });
    if (validationError) return res.status(400).json({ error: validationError });
    try {
      res.status(dependencies.supabase ? 201 : 202).json(
        await recordEvent({
          supabase: dependencies.supabase,
          payload: req.body,
          userAgent: req.get('user-agent'),
        }),
      );
    } catch (error) {
      console.warn('Could not save analytics event:', error.message);
      res.status(502).json({ ok: false, stored: false, error: 'Could not save puzzle event' });
    }
  });
  return router;
}
