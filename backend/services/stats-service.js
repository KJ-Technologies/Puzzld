export async function getStats({ supabase, catalogue }) {
  const emptyByPuzzle = Object.fromEntries(
    catalogue.map((item) => [
      item.id,
      { attempts: 0, completions: 0, averageCompletionSeconds: null },
    ]),
  );
  if (!supabase)
    return {
      totalAttempts: 0,
      totalCompletions: 0,
      averageCompletionSeconds: null,
      byPuzzle: emptyByPuzzle,
      source: 'not-configured',
    };

  const [openedResult, completedResult] = await Promise.all([
    supabase
      .from('puzzle_events')
      .select('puzzle_id', { count: 'exact', head: true })
      .eq('event_type', 'puzzle_opened'),
    supabase
      .from('puzzle_events')
      .select('puzzle_id,elapsed_seconds')
      .eq('event_type', 'puzzle_completed')
      .not('elapsed_seconds', 'is', null)
      .limit(10000),
  ]);
  if (openedResult.error || completedResult.error)
    throw openedResult.error || completedResult.error;

  const { data: openedRows, error: openedRowsError } = await supabase
    .from('puzzle_events')
    .select('puzzle_id')
    .eq('event_type', 'puzzle_opened')
    .limit(10000);
  if (openedRowsError) throw openedRowsError;
  const byPuzzle = structuredClone(emptyByPuzzle);
  for (const row of openedRows || [])
    if (byPuzzle[row.puzzle_id]) byPuzzle[row.puzzle_id].attempts += 1;
  for (const row of completedResult.data || [])
    if (byPuzzle[row.puzzle_id]) byPuzzle[row.puzzle_id].completions += 1;
  for (const item of catalogue) {
    const values = (completedResult.data || [])
      .filter((row) => row.puzzle_id === item.id && Number.isFinite(Number(row.elapsed_seconds)))
      .map((row) => Number(row.elapsed_seconds));
    byPuzzle[item.id].averageCompletionSeconds = values.length
      ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
      : null;
  }
  const times = (completedResult.data || [])
    .map((row) => Number(row.elapsed_seconds))
    .filter(Number.isFinite);
  return {
    totalAttempts: Number(openedResult.count || 0),
    totalCompletions: completedResult.data?.length || 0,
    averageCompletionSeconds: times.length
      ? Math.round(times.reduce((sum, value) => sum + value, 0) / times.length)
      : null,
    byPuzzle,
    source: 'supabase',
  };
}
