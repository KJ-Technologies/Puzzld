import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { catalogue } from './data/catalogue.js';
import { supabase } from './lib/supabase.js';
import { createHealthRouter } from './routes/health.js';
import { createPuzzlesRouter } from './routes/puzzles.js';
import { createStatsRouter } from './routes/stats.js';
import { createEventsRouter } from './routes/events.js';

const app = express();
const dependencies = { supabase, catalogue };
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frontendDist = path.join(projectRoot, 'frontend', 'dist');

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '20kb' }));
app.use((req, res, next) => {
  const origin = req.get('origin');
  const allowedOrigins = env.frontendOrigin
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (origin && allowedOrigins.includes(origin)) res.set('Access-Control-Allow-Origin', origin);
  res.set('Vary', 'Origin');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use('/api/health', createHealthRouter({ databaseConfigured: Boolean(supabase) }));
app.use('/api/puzzles', createPuzzlesRouter({ ...dependencies, fallback: catalogue }));
app.use('/api/stats', createStatsRouter(dependencies));
app.use('/api/events', createEventsRouter(dependencies));

// The API can also serve the compiled frontend when deployed as one Render service.
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

const server = app.listen(env.port, () => console.log(`Puzzle Play listening on ${env.port}`));
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${env.port} is already in use. Stop the existing Puzzld server or set PORT to another value.`,
    );
    process.exitCode = 1;
    return;
  }
  throw error;
});
