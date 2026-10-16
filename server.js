import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const catalogue = [
  { id:'jungle', title:'Jungle Safari', category:'Nature', subtitle:'Into the wild', emoji:'🐅', palette:['#123d32','#72a85b','#f5c66a'], featured:true },
  { id:'kolkata', title:'Kolkata', category:'Iconic cities', subtitle:'The City of Joy', emoji:'🚋', palette:['#7d2e32','#e7a95a','#f4d9a6'] },
  { id:'paris', title:'Paris', category:'Iconic cities', subtitle:'City of lights', emoji:'🗼', palette:['#263b61','#df9a9b','#f5d7b5'] },
  { id:'mumbai', title:'Mumbai', category:'Iconic cities', subtitle:'Maximum city', emoji:'🌊', palette:['#123b5a','#e8a86a','#f4d8ad'] },
  { id:'sunrise', title:'Golden Sunrise', category:'Scenic', subtitle:'A new day begins', emoji:'🌅', palette:['#8b4e64','#f5a35d','#f9dc9a'] },
  { id:'sunset', title:'Ocean Sunset', category:'Scenic', subtitle:'Chasing the last light', emoji:'🌇', palette:['#493b69','#e77968','#f6c17a'] },
  { id:'mountains', title:'Mountain Escape', category:'Scenic', subtitle:'Find your quiet', emoji:'🏔️', palette:['#233e55','#83a8a0','#f1d6a4'] },
  { id:'underwater', title:'Underwater World', category:'Nature', subtitle:'Dive into colour', emoji:'🐠', palette:['#0c4861','#28a8a3','#f1cf77'] },
  { id:'space', title:'Cosmic Journey', category:'Imagination', subtitle:'A little beyond', emoji:'🚀', palette:['#171b45','#6759a9','#edb5a4'] },
  { id:'garden', title:'Secret Garden', category:'Nature', subtitle:'Bloom one piece at a time', emoji:'🦋', palette:['#285744','#7ab77b','#f2c6b8'] }
];

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));

app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'puzzle-play-v1', database: supabase ? 'configured' : 'not-configured' }));
app.get('/api/puzzles', async (_req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from('puzzles').select('id,title,category,subtitle,emoji,palette,featured,sort_order').eq('is_active', true).order('sort_order');
    if (!error && data?.length) return res.json({ puzzles: data, source: 'supabase' });
    if (error) console.warn('Supabase catalogue fallback:', error.message);
  }
  res.json({ puzzles: catalogue, source: 'local-fallback' });
});
app.post('/api/events', async (req, res) => {
  const { eventType, puzzleId, pieceCount, elapsedSeconds, placedPieces } = req.body || {};
  const allowed = new Set(['puzzle_started', 'puzzle_completed', 'puzzle_restarted', 'reference_toggled', 'difficulty_changed']);
  if (!allowed.has(eventType) || typeof puzzleId !== 'string' || !catalogue.some(p => p.id === puzzleId)) {
    return res.status(400).json({ error: 'Invalid event payload' });
  }
  const counts = [50, 100, 300, 500, 1000];
  if (pieceCount !== undefined && !counts.includes(Number(pieceCount))) return res.status(400).json({ error: 'Invalid piece count' });
  if (supabase) {
    const { error } = await supabase.from('puzzle_events').insert({
      event_type: eventType,
      puzzle_id: puzzleId,
      piece_count: pieceCount == null ? null : Number(pieceCount),
      elapsed_seconds: elapsedSeconds == null ? null : Math.max(0, Math.min(86400, Number(elapsedSeconds) || 0)),
      placed_pieces: placedPieces == null ? null : Math.max(0, Math.min(1000, Number(placedPieces) || 0)),
      user_agent: String(req.get('user-agent') || '').slice(0, 300)
    });
    if (error) console.warn('Could not save analytics event:', error.message);
  }
  res.status(202).json({ ok: true, stored: Boolean(supabase) });
});
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`Puzzle Play listening on ${PORT}`));
