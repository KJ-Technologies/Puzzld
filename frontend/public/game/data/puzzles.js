export const PIECE_COUNTS = [50, 100, 300, 500, 1000];

// Photo URLs are kept separate from database records so branding/catalogue text can change safely.
export const PHOTO_PUZZLES = [
  {
    id: 'jungle',
    title: 'Into the Wild',
    category: 'Nature',
    subtitle: 'A little wild, a lot wonderful.',
    imageUrl:
      'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=88',
    tag: 'WILD & WONDERFUL',
    featured: true,
  },
  {
    id: 'kolkata',
    title: 'Kolkata, My Love',
    category: 'Iconic cities',
    subtitle: 'The City of Joy, in all its colour.',
    imageUrl:
      'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1600&q=88',
    tag: 'CITY STORIES',
  },
  {
    id: 'paris',
    title: 'Postcards from Paris',
    category: 'Iconic cities',
    subtitle: 'A little romance around every corner.',
    imageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=88',
    tag: 'CITY STORIES',
  },
  {
    id: 'mumbai',
    title: 'Mumbai Moments',
    category: 'Iconic cities',
    subtitle: 'Big city energy, endless stories.',
    imageUrl:
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1600&q=88',
    tag: 'CITY STORIES',
  },
  {
    id: 'sunrise',
    title: 'Chasing First Light',
    category: 'Scenic',
    subtitle: 'A fresh start, one piece at a time.',
    imageUrl:
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1600&q=88',
    tag: 'SCENIC ESCAPE',
  },
  {
    id: 'sunset',
    title: 'Golden Hour Club',
    category: 'Scenic',
    subtitle: 'Stay for the last light.',
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=88',
    tag: 'SCENIC ESCAPE',
  },
  {
    id: 'mountains',
    title: 'Somewhere in the Mountains',
    category: 'Scenic',
    subtitle: 'A little quiet goes a long way.',
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=88',
    tag: 'SCENIC ESCAPE',
  },
  {
    id: 'underwater',
    title: 'Underwater Daydream',
    category: 'Nature',
    subtitle: 'A whole other world beneath the waves.',
    imageUrl:
      'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1600&q=88',
    tag: 'NATURE NOTES',
  },
  {
    id: 'space',
    title: 'Somewhere Beyond',
    category: 'Imagination',
    subtitle: 'For the curious and the starry-eyed.',
    imageUrl:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&q=88',
    tag: 'A LITTLE WONDER',
  },
  {
    id: 'garden',
    title: 'The Secret Garden',
    category: 'Nature',
    subtitle: 'Slow down and notice the little things.',
    imageUrl:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=88',
    tag: 'NATURE NOTES',
  },
];

export function mergePuzzleRecords(records = []) {
  const fromDb = new Map(records.map((item) => [item.id, item]));
  return PHOTO_PUZZLES.map((photo) => ({
    ...photo,
    ...(fromDb.get(photo.id) || {}),
    imageUrl: photo.imageUrl,
  }));
}
