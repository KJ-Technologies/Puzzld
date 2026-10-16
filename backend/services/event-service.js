const allowedEvents = new Set([
  'puzzle_opened',
  'puzzle_started',
  'puzzle_completed',
  'puzzle_restarted',
  'reference_toggled',
  'difficulty_changed',
]);
const allowedPieceCounts = new Set([50, 100, 300, 500, 1000]);

export function validateEvent({ eventType, puzzleId, pieceCount, catalogue }) {
  if (
    !allowedEvents.has(eventType) ||
    typeof puzzleId !== 'string' ||
    !catalogue.some((puzzle) => puzzle.id === puzzleId)
  )
    return 'Invalid event payload';
  if (pieceCount !== undefined && !allowedPieceCounts.has(Number(pieceCount)))
    return 'Invalid piece count';
  return null;
}

export async function recordEvent({ supabase, payload, userAgent }) {
  if (!supabase) return { ok: true, stored: false, source: 'not-configured' };
  const { eventType, puzzleId, pieceCount, elapsedSeconds, placedPieces } = payload;
  const event = {
    event_type: eventType,
    puzzle_id: puzzleId,
    piece_count: pieceCount == null ? null : Number(pieceCount),
    elapsed_seconds:
      elapsedSeconds == null ? null : Math.max(0, Math.min(86400, Number(elapsedSeconds) || 0)),
    placed_pieces:
      placedPieces == null ? null : Math.max(0, Math.min(1000, Number(placedPieces) || 0)),
    user_agent: String(userAgent || '').slice(0, 300),
  };
  const { error } = await supabase.from('puzzle_events').insert(event);
  if (error) throw error;
  return { ok: true, stored: true, source: 'supabase' };
}
