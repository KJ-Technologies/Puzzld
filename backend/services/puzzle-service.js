export async function listPuzzles({ supabase, fallback }) {
  if (supabase) {
    const { data, error } = await supabase
      .from('puzzles')
      .select('id,title,category,subtitle,emoji,palette,featured,sort_order')
      .eq('is_active', true)
      .order('sort_order');
    if (!error && data?.length) return { puzzles: data, source: 'supabase' };
    if (error) console.warn('Supabase catalogue fallback:', error.message);
  }
  return { puzzles: fallback, source: 'local-fallback' };
}
