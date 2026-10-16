import { PHOTO_PUZZLES, PIECE_COUNTS, mergePuzzleRecords } from './data/puzzles.js';
import { PuzzleEngine } from './core/puzzle-engine.js';
import { apiFetch } from './lib/api.js';

const $ = (id) => document.getElementById(id);
const state = {
  puzzles: PHOTO_PUZZLES,
  filter: 'All',
  puzzle: null,
  pieceCount: 50,
  engine: null,
  elapsed: 0,
  startedAt: null,
  timerInterval: null,
  started: false,
  completed: false,
  referenceVisible: true,
  toastTimer: null,
};
const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
const formatTime = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

async function track(eventType, extra = {}) {
  try {
    const response = await apiFetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        puzzleId: state.puzzle?.id || 'jungle',
        pieceCount: state.pieceCount,
        elapsedSeconds: state.elapsed,
        placedPieces: state.engine?.placed || 0,
        ...extra,
      }),
    });
    if (!response.ok) throw new Error(`Event API returned ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(
      'Puzzle event was not recorded:',
      error.message,
    ); /* Analytics never blocks play. */
  }
}
function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function wirePlus() {
  const priceButtons = [...document.querySelectorAll('[data-price]')];
  const priceLabel = $('selectedPlusPrice');
  priceButtons.forEach((button) =>
    button.addEventListener('click', () => {
      priceButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-checked', String(active));
      });
      priceLabel.innerHTML = `₹${Number(button.dataset.price).toLocaleString('en-IN')} <small>/ week</small>`;
    }),
  );
  $('plusSubscribeButton')?.addEventListener('click', () => {
    const price = document.querySelector('[data-price].active')?.dataset.price || '99';
    showToast(
      `Puzzld Plus at ₹${Number(price).toLocaleString('en-IN')}/week is on the way. Subscriptions are not live yet.`,
    );
  });
}
function updateFilterCounts() {
  const counts = { All: state.puzzles.length };
  state.puzzles.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1));
  $('filters')
    .querySelectorAll('[data-filter]')
    .forEach((button) => {
      const count = counts[button.dataset.filter];
      const span = button.querySelector('span');
      if (span && count != null) span.textContent = count;
    });
  $('designCount').textContent = state.puzzles.length;
}
const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');
const formatAverage = (seconds) => {
  if (seconds == null || !Number.isFinite(Number(seconds))) return '—';
  const n = Math.max(0, Math.round(Number(seconds)));
  return n >= 3600
    ? `${Math.floor(n / 3600)}h ${String(Math.floor((n % 3600) / 60)).padStart(2, '0')}m`
    : `${Math.floor(n / 60)}m ${String(n % 60).padStart(2, '0')}s`;
};
async function loadPuzzleStats() {
  try {
    const response = await apiFetch('/api/stats', { cache: 'no-store' });
    if (!response.ok) throw new Error('Stats are not available yet');
    const data = await response.json();
    $('totalAttempts').textContent = formatCount(data.totalAttempts);
    $('totalCompletions').textContent = formatCount(data.totalCompletions);
    $('averageCompletion').textContent =
      data.averageCompletionSeconds == null ? '—' : formatAverage(data.averageCompletionSeconds);
    $('statsNote').textContent = data.totalAttempts
      ? 'Based on recorded puzzle starts and completed games.'
      : 'Be the first to make the stats grow — play a puzzle and complete it!';
    document.querySelectorAll('[data-puzzle-stats]').forEach((node) => {
      const stat = (data.byPuzzle || {})[node.dataset.puzzleStats];
      if (!stat) return;
      node.innerHTML = `<span>${formatCount(stat.attempts)} tries</span><span>${formatCount(stat.completions)} completed</span>`;
    });
  } catch {
    ['totalAttempts', 'totalCompletions', 'averageCompletion'].forEach((id) => {
      if ($(id)) $(id).textContent = '—';
    });
    if ($('statsNote'))
      $('statsNote').textContent =
        'Community stats will appear once analytics are connected and real play events are recorded.';
    document.querySelectorAll('[data-puzzle-stats]').forEach((node) => {
      node.textContent = 'Stats unavailable';
    });
  }
}
function navigateToHash() {
  const hash = window.location.hash || '#home';
  if (
    $('gameView') &&
    !$('gameView').classList.contains('hidden') &&
    ['#home', '#collection', '#puzzle-stats', '#puzzld-plus'].includes(hash)
  )
    showCatalogue();
  const target = document.querySelector(hash);
  if (target && ['#home', '#collection', '#puzzle-stats', '#puzzld-plus'].includes(hash)) {
    requestAnimationFrame(() =>
      target.scrollIntoView({ behavior: 'smooth', block: hash === '#home' ? 'start' : 'start' }),
    );
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }
}
function renderCatalogue() {
  const filtered =
    state.filter === 'All'
      ? state.puzzles
      : state.puzzles.filter((p) => p.category === state.filter);
  $('designGrid').innerHTML =
    filtered
      .map(
        (puzzle) =>
          `<article class="design-card" role="button" tabindex="0" data-puzzle="${escapeHtml(puzzle.id)}" aria-label="Play ${escapeHtml(puzzle.title)}"><div class="design-photo"><img loading="lazy" src="${escapeHtml(puzzle.imageUrl)}" alt="${escapeHtml(puzzle.title)} puzzle photograph"><span class="photo-chip">${escapeHtml(puzzle.tag || puzzle.category.toUpperCase())}</span><button class="card-play" type="button" aria-label="Play ${escapeHtml(puzzle.title)}">↗</button></div><div class="design-meta"><div><h3>${escapeHtml(puzzle.title)}</h3><p>${escapeHtml(puzzle.subtitle || 'A little world to explore.')}</p></div><span class="piece-tag">50 &amp; 100 pcs · Play now</span></div><div class="card-community-stats" data-puzzle-stats="${escapeHtml(puzzle.id)}"><span>Loading stats…</span></div></article>`,
      )
      .join('') || '<div class="loading-card">No pictures in this collection just yet.</div>';
}
function showCatalogue() {
  stopTimer();
  state.engine?.destroy();
  state.engine = null;
  $('gameView').classList.add('hidden');
  $('catalogueView').classList.remove('hidden');
  state.completed = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function startTimer() {
  if (state.started || state.completed) return;
  state.started = true;
  state.startedAt = Date.now() - state.elapsed * 1000;
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    $('timer').textContent = formatTime(state.elapsed);
  }, 1000);
  track('puzzle_started');
}
function stopTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  if (state.startedAt) state.elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
  state.startedAt = null;
  $('timer').textContent = formatTime(state.elapsed);
}
function updateProgress(placed = state.engine?.placed || 0, total = state.pieceCount) {
  const percent = total ? Math.round((placed / total) * 100) : 0;
  $('progressText').textContent =
    `${placed.toLocaleString()} of ${total.toLocaleString()} pieces found`;
  $('progressBar').style.width = `${percent}%`;
  $('progressPercent').textContent = `${percent}%`;
  $('sidePieceCount').textContent = total.toLocaleString();
  $('sidePlacedCount').textContent = placed.toLocaleString();
}
function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error('This photo could not be loaded. Check the connection and try again.'));
    image.src = url;
  });
}
function updateReference() {
  $('referenceImage').innerHTML = state.puzzle
    ? `<img src="${escapeHtml(state.puzzle.imageUrl)}" alt="Reference for ${escapeHtml(state.puzzle.title)}">`
    : '';
  $('referenceButton').setAttribute('aria-pressed', String(state.referenceVisible));
  $('referenceButton').innerHTML = state.referenceVisible
    ? '▧ <span>Reference on</span>'
    : '▧ <span>Reference off</span>';
  $('referenceCard').classList.toggle('hidden', !state.referenceVisible);
}
async function openPuzzle(puzzleId) {
  const puzzle = state.puzzles.find((item) => item.id === puzzleId);
  if (!puzzle) return;
  stopTimer();
  state.engine?.destroy();
  state.engine = null;
  state.puzzle = puzzle;
  state.elapsed = 0;
  state.startedAt = null;
  state.started = false;
  state.completed = false;
  state.pieceCount = 50;
  $('catalogueView').classList.add('hidden');
  $('gameView').classList.remove('hidden');
  $('gameTitle').textContent = puzzle.title;
  $('gameCategory').textContent = (puzzle.category || 'YOUR LITTLE ESCAPE').toUpperCase();
  $('gameSubtitle').textContent = puzzle.subtitle || 'A little world to explore.';
  $('timer').textContent = '00:00';
  $('startOverlay').classList.add('hidden');
  $('completeOverlay').classList.add('hidden');
  $('loadingOverlay').classList.remove('hidden');
  $('difficultyOptions')
    .querySelectorAll('[data-pieces]')
    .forEach((button) => {
      const count = Number(button.dataset.pieces);
      const locked = count > 100;
      button.disabled = locked;
      button.classList.toggle('locked', locked);
      button.classList.toggle('active', count === state.pieceCount);
      button.setAttribute(
        'aria-label',
        locked ? `${count} pieces, coming soon` : `${count} pieces`,
      );
    });
  updateReference();
  updateProgress(0, state.pieceCount);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  track('puzzle_opened');
  try {
    const image = await preloadImage(puzzle.imageUrl);
    $('heroPhoto').src = puzzle.imageUrl;
    state.engine = new PuzzleEngine($('puzzleCanvas'), image, state.pieceCount, {
      isLocked: () => state.completed || !$('startOverlay').classList.contains('hidden'),
      onMoveStart: startTimer,
      onProgress: updateProgress,
      onSnap: (_piece, placed) => {
        updateProgress(placed, state.pieceCount);
        if (placed % 10 === 0 && placed < state.pieceCount)
          showToast(`${placed} pieces found. You're in the flow!`);
      },
      onComplete: completePuzzle,
    });
    $('loadingOverlay').classList.add('hidden');
    $('startOverlay').classList.remove('hidden');
    updateProgress(0, state.pieceCount);
  } catch (error) {
    console.error('Puzzld image/game load error:', error);
    $('loadingOverlay').classList.add('hidden');
    showToast('We could not load this picture. Please try again.');
    $('gameView').classList.add('hidden');
    $('catalogueView').classList.remove('hidden');
  }
}
function completePuzzle() {
  stopTimer();
  state.completed = true;
  $('timer').textContent = formatTime(state.elapsed);
  $('completeMessage').textContent =
    `You finished ${state.puzzle.title} in ${formatTime(state.elapsed)} with ${state.pieceCount.toLocaleString()} pieces. Look at you go!`;
  $('completeOverlay').classList.remove('hidden');
  track('puzzle_completed', {
    elapsedSeconds: state.elapsed,
    placedPieces: state.pieceCount,
  }).finally(loadPuzzleStats);
}
function restartPuzzle() {
  stopTimer();
  state.elapsed = 0;
  state.started = false;
  state.startedAt = null;
  state.completed = false;
  $('timer').textContent = '00:00';
  $('completeOverlay').classList.add('hidden');
  $('startOverlay').classList.remove('hidden');
  state.engine?.restart();
  updateProgress(0, state.pieceCount);
  track('puzzle_restarted');
}
function changeDifficulty(count) {
  if (!PIECE_COUNTS.includes(count) || count === state.pieceCount || !state.puzzle) return;
  if (count > 100) {
    showToast(`${count.toLocaleString()} pieces are coming soon. For now, enjoy 50 or 100!`);
    return;
  }
  state.pieceCount = count;
  stopTimer();
  state.elapsed = 0;
  state.started = false;
  state.startedAt = null;
  state.completed = false;
  $('timer').textContent = '00:00';
  $('completeOverlay').classList.add('hidden');
  $('startOverlay').classList.remove('hidden');
  $('loadingOverlay').classList.remove('hidden');
  $('difficultyOptions')
    .querySelectorAll('[data-pieces]')
    .forEach((button) =>
      button.classList.toggle('active', Number(button.dataset.pieces) === count),
    );
  const canvas = $('puzzleCanvas');
  state.engine?.destroy();
  state.engine = null;
  preloadImage(state.puzzle.imageUrl)
    .then((image) => {
      state.engine = new PuzzleEngine(canvas, image, count, {
        isLocked: () => state.completed || !$('startOverlay').classList.contains('hidden'),
        onMoveStart: startTimer,
        onProgress: updateProgress,
        onSnap: (_p, placed) => {
          updateProgress(placed, count);
          if (placed % 10 === 0 && placed < count) showToast(`${placed} pieces found. Keep going!`);
        },
        onComplete: completePuzzle,
      });
      $('loadingOverlay').classList.add('hidden');
      updateProgress(0, count);
    })
    .catch((error) => {
      console.error(error);
      $('loadingOverlay').classList.add('hidden');
      showToast('Could not load this challenge. Please try again.');
    });
  track('difficulty_changed', { pieceCount: count });
}
function toggleReference() {
  state.referenceVisible = !state.referenceVisible;
  updateReference();
  track('reference_toggled');
}
function wireEvents() {
  $('filters').addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    state.filter = button.dataset.filter;
    $('filters')
      .querySelectorAll('[data-filter]')
      .forEach((item) => item.classList.toggle('active', item === button));
    renderCatalogue();
  });
  $('designGrid').addEventListener('click', (event) => {
    const card = event.target.closest('[data-puzzle]');
    if (card) openPuzzle(card.dataset.puzzle);
  });
  $('designGrid').addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-puzzle]')) {
      event.preventDefault();
      openPuzzle(event.target.dataset.puzzle);
    }
  });
  ['homeButton', 'brandHome'].forEach((id) =>
    $(id)?.addEventListener('click', (event) => {
      event.preventDefault();
      showCatalogue();
    }),
  );
  ['exploreButton', 'closingExplore'].forEach((id) =>
    $(id).addEventListener('click', () => $('collection').scrollIntoView({ behavior: 'smooth' })),
  );
  $('backButton').addEventListener('click', showCatalogue);
  $('startButton').addEventListener('click', () => {
    $('startOverlay').classList.add('hidden');
    showToast('You’ve got this. Find that first fit!');
  });
  $('restartButton').addEventListener('click', restartPuzzle);
  $('playAgainButton').addEventListener('click', restartPuzzle);
  $('chooseAnotherButton').addEventListener('click', showCatalogue);
  $('referenceButton').addEventListener('click', toggleReference);
  $('hideReferenceButton').addEventListener('click', toggleReference);
  $('footerReferenceButton').addEventListener('click', toggleReference);
  $('difficultyOptions').addEventListener('click', (event) => {
    const button = event.target.closest('[data-pieces]');
    if (button) changeDifficulty(Number(button.dataset.pieces));
  });
  $('refreshStatsButton')?.addEventListener('click', loadPuzzleStats);
  window.addEventListener('hashchange', navigateToHash);
}
async function init() {
  wireEvents();
  wirePlus();
  $('heroPhoto').addEventListener(
    'error',
    () => {
      $('heroPhoto').src = PHOTO_PUZZLES[6].imageUrl;
    },
    { once: true },
  );
  state.puzzles = PHOTO_PUZZLES;
  renderCatalogue();
  updateFilterCounts();
  loadPuzzleStats();
  try {
    const response = await apiFetch('/api/puzzles');
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.puzzles) && data.puzzles.length)
        state.puzzles = mergePuzzleRecords(data.puzzles);
    }
  } catch (error) {
    console.warn('Using local Puzzld catalogue:', error.message);
  }
  renderCatalogue();
  updateFilterCounts();
  loadPuzzleStats();
  if (window.location.hash) navigateToHash();
}
init();
