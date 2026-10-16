const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const seeded = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; };

function factorGrid(total, aspect) {
  let best = { cols: 1, rows: total, score: Infinity };
  for (let rows = 1; rows <= Math.sqrt(total); rows++) {
    if (total % rows) continue;
    const cols = total / rows;
    const score = Math.abs(Math.log((cols / rows) / aspect));
    if (score < best.score) best = { cols, rows, score };
  }
  return best;
}

function traceEdge(ctx, x1, y1, x2, y2, tab, tabDepth) {
  const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy);
  if (!tab || length < 24) { ctx.lineTo(x2, y2); return; }
  const ux = dx / length, uy = dy / length;
  // A clockwise perimeter has its inward normal on the left; negate it for outward tabs.
  const nx = uy, ny = -ux;
  const p = (along, normal) => [x1 + ux * along + nx * normal, y1 + uy * along + ny * normal];
  const a = length * .34, b = length * .66, neck = length * .09;
  const depth = Math.min(tabDepth, length * .19) * tab;
  ctx.lineTo(...p(a, 0));
  ctx.lineTo(...p(a + neck, 0));
  ctx.bezierCurveTo(...p(a + neck * .2, depth * .28), ...p(a + neck * .1, depth), ...p(length * .5, depth));
  ctx.bezierCurveTo(...p(b - neck * .1, depth), ...p(b - neck * .2, depth * .28), ...p(b - neck, 0));
  ctx.lineTo(...p(b, 0));
  ctx.lineTo(x2, y2);
}

function tracePiece(ctx, w, h, edges, depth) {
  ctx.beginPath(); ctx.moveTo(0, 0);
  traceEdge(ctx, 0, 0, w, 0, edges.top, depth);
  traceEdge(ctx, w, 0, w, h, edges.right, depth);
  traceEdge(ctx, w, h, 0, h, edges.bottom, depth);
  traceEdge(ctx, 0, h, 0, 0, edges.left, depth);
  ctx.closePath();
}

export class PuzzleEngine {
  constructor(canvas, image, total, callbacks = {}) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.image = image; this.total = total;
    this.callbacks = callbacks; this.placed = 0; this.pieces = []; this.dragging = null; this.dragOffset = { x: 0, y: 0 }; this.hitCtx = document.createElement('canvas').getContext('2d');
    this.dpr = Math.min(window.devicePixelRatio || 1, 2); this.board = { x: 0, y: 0, w: 0, h: 0 };
    this.pointerDown = this.onPointerDown.bind(this); this.pointerMove = this.onPointerMove.bind(this); this.pointerUp = this.onPointerUp.bind(this);
    canvas.addEventListener('pointerdown', this.pointerDown); canvas.addEventListener('pointermove', this.pointerMove); canvas.addEventListener('pointerup', this.pointerUp); canvas.addEventListener('pointercancel', this.pointerUp);
    this.resizeObserver = new ResizeObserver(() => { this.layout(); this.draw(); });
    this.resizeObserver.observe(canvas.parentElement);
    this.layout(); this.createPieces(); this.draw();
  }
  layout() {
    const parent = this.canvas.parentElement;
    const width = Math.max(300, Math.floor(parent.clientWidth || 800));
    const mobile = window.innerWidth < 720;
    const height = Math.max(mobile ? 360 : 430, Math.min(760, width * (mobile ? .9 : .67)));
    this.cssWidth = width; this.cssHeight = height;
    this.canvas.width = Math.round(width * this.dpr); this.canvas.height = Math.round(height * this.dpr);
    this.canvas.style.width = '100%'; this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const pad = Math.max(17, width * .035);
    this.board = { x: pad, y: pad, w: width - pad * 2, h: height - pad * 2 };
    const grid = factorGrid(this.total, this.board.w / this.board.h);
    this.grid = grid; this.cellW = this.board.w / grid.cols; this.cellH = this.board.h / grid.rows;
    this.tabDepth = Math.min(this.cellW, this.cellH) * .22;
  }
  createPieces() {
    const { cols, rows } = this.grid;
    const horizontal = Array.from({ length: rows + 1 }, () => Array(cols).fill(0));
    const vertical = Array.from({ length: rows }, () => Array(cols + 1).fill(0));
    for (let r = 1; r < rows; r++) for (let c = 0; c < cols; c++) horizontal[r][c] = seeded(r * cols + c + this.total) > 0 ? 1 : -1;
    for (let r = 0; r < rows; r++) for (let c = 1; c < cols; c++) vertical[r][c] = seeded(5000 + r * cols + c + this.total) > 0 ? 1 : -1;
    this.pieces = []; this.placed = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const id = r * cols + c, w = this.cellW, h = this.cellH;
      const piece = { id, r, c, w, h, tx: this.board.x + c * w, ty: this.board.y + r * h, x: 0, y: 0, placed: false,
        edges: { top: r === 0 ? 0 : -horizontal[r][c], right: c === cols - 1 ? 0 : vertical[r][c + 1], bottom: r === rows - 1 ? 0 : horizontal[r + 1][c], left: c === 0 ? 0 : -vertical[r][c] } };
      // Scatter in a loose tray around the faded reference image; deterministic so restarts feel stable.
      const maxX = Math.max(1, this.cssWidth - w - 12), maxY = Math.max(1, this.cssHeight - h - 12);
      piece.x = 6 + ((id * 83 + this.total * 7) % maxX); piece.y = 6 + ((id * 47 + this.total * 11) % maxY);
      if (Math.hypot(piece.x - piece.tx, piece.y - piece.ty) < Math.min(w, h) * .8) piece.x = clamp(piece.x + w * 1.3, 4, maxX);
      this.pieces.push(piece);
    }
    // Shuffle stack order so pieces overlap naturally instead of forming rows.
    this.pieces.sort((a, b) => seeded(a.id + this.total * .1) - seeded(b.id + this.total * .1));
  }
  path(ctx, piece) { tracePiece(ctx, piece.w, piece.h, piece.edges, this.tabDepth); }
  drawPiece(piece) {
    const ctx = this.ctx; ctx.save(); ctx.translate(piece.x, piece.y);
    this.path(ctx, piece); ctx.save(); ctx.clip();
    ctx.drawImage(this.image, this.board.x - piece.tx, this.board.y - piece.ty, this.board.w, this.board.h);
    ctx.restore();
    // Soft drop shadow plus two fine contour lines create the look of die-cut cardboard.
    this.path(ctx, piece); ctx.shadowColor = 'rgba(36,31,23,.22)'; ctx.shadowBlur = piece.placed ? 0 : 4; ctx.shadowOffsetX = piece.placed ? 0 : 1; ctx.shadowOffsetY = piece.placed ? 0 : 2;
    ctx.fillStyle = 'rgba(255,255,255,.001)'; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    this.path(ctx, piece); ctx.lineWidth = Math.max(.8, Math.min(1.8, Math.min(piece.w, piece.h) * .035)); ctx.strokeStyle = piece.placed ? 'rgba(255,255,255,.78)' : 'rgba(255,255,255,.96)'; ctx.stroke();
    this.path(ctx, piece); ctx.lineWidth = .65; ctx.strokeStyle = piece.placed ? 'rgba(47,137,75,.95)' : 'rgba(35,35,28,.34)'; ctx.stroke();
    if (piece.placed) {
      // Subtle green confirmation ring and tick make solved pieces recognisable without obscuring the photo.
      ctx.save(); ctx.globalAlpha = .92; ctx.fillStyle = '#2f874b'; ctx.beginPath(); ctx.arc(piece.w - Math.min(11, piece.w * .16), Math.min(11, piece.h * .16), Math.min(5, Math.min(piece.w, piece.h) * .12), 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.35; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(piece.w - Math.min(13, piece.w * .19), Math.min(11, piece.h * .16)); ctx.lineTo(piece.w - Math.min(11, piece.w * .16), Math.min(13, piece.h * .19)); ctx.lineTo(piece.w - Math.min(8, piece.w * .12), Math.min(8, piece.h * .12)); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  }
  draw() {
    if (!this.ctx || !this.image) return;
    const ctx = this.ctx, w = this.cssWidth, h = this.cssHeight; ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#e9e1d2'; ctx.fillRect(0, 0, w, h);
    // Subtle paper-fibre specks make the table less sterile without distracting from the photo.
    ctx.save(); ctx.globalAlpha = .09; ctx.fillStyle = '#8c806b';
    for (let i = 0; i < 120; i++) { const x = (i * 97.3) % w, y = (i * 61.7) % h; ctx.fillRect(x, y, 1, 1); } ctx.restore();
    ctx.save(); ctx.shadowColor = 'rgba(46,39,25,.14)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4; ctx.fillStyle = '#fbf8ef'; ctx.fillRect(this.board.x, this.board.y, this.board.w, this.board.h); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(this.board.x, this.board.y, this.board.w, this.board.h); ctx.clip(); ctx.globalAlpha = .18; ctx.drawImage(this.image, this.board.x, this.board.y, this.board.w, this.board.h); ctx.restore();
    ctx.strokeStyle = 'rgba(75,65,49,.18)'; ctx.lineWidth = 1; ctx.strokeRect(this.board.x, this.board.y, this.board.w, this.board.h);
    // Correctly placed pieces are the table's base layer. Loose pieces sit above them.
    for (const p of this.pieces) if (p.placed) this.drawPiece(p);
    for (const p of this.pieces) if (!p.placed && p !== this.dragging) this.drawPiece(p);
    // The active piece is always drawn last so it never disappears underneath another piece.
    if (this.dragging) this.drawPiece(this.dragging);
  }
  coords(event) { const rect = this.canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) * this.cssWidth / rect.width, y: (event.clientY - rect.top) * this.cssHeight / rect.height }; }
  hit(piece, x, y) { const dx = x - piece.x, dy = y - piece.y; if (dx < -this.tabDepth || dy < -this.tabDepth || dx > piece.w + this.tabDepth || dy > piece.h + this.tabDepth) return false; tracePiece(this.hitCtx, piece.w, piece.h, piece.edges, this.tabDepth); return this.hitCtx.isPointInPath(dx, dy); }
  onPointerDown(event) {
    if (this.callbacks.isLocked?.()) return;
    const point = this.coords(event); let found = null;
    // Last drawn = topmost. Move picked piece to the top of the stack.
    for (let i = this.pieces.length - 1; i >= 0; i--) { const p = this.pieces[i]; if (!p.placed && this.hit(p, point.x, point.y)) { found = p; break; } }
    if (!found) return;
    event.preventDefault(); this.dragging = found; this.dragOffset = { x: point.x - found.x, y: point.y - found.y };
    this.pieces.splice(this.pieces.indexOf(found), 1); this.pieces.push(found); this.canvas.setPointerCapture?.(event.pointerId); this.callbacks.onMoveStart?.(); this.draw();
  }
  onPointerMove(event) { if (!this.dragging) return; const p = this.coords(event); this.dragging.x = p.x - this.dragOffset.x; this.dragging.y = p.y - this.dragOffset.y; this.draw(); }
  onPointerUp() {
    if (!this.dragging) return; const p = this.dragging; this.dragging = null;
    const dx = p.x - p.tx, dy = p.y - p.ty, threshold = Math.max(8, Math.min(p.w, p.h) * .34);
    if (Math.hypot(dx, dy) <= threshold) {
      p.x = p.tx; p.y = p.ty; p.placed = true; this.placed++;
      this.callbacks.onSnap?.(p, this.placed, this.total);
      if (this.placed === this.total) this.callbacks.onComplete?.();
    }
    this.draw(); this.callbacks.onProgress?.(this.placed, this.total);
  }
  restart() { this.createPieces(); this.draw(); this.callbacks.onProgress?.(0, this.total); }
  destroy() { this.resizeObserver?.disconnect(); this.canvas.removeEventListener('pointerdown', this.pointerDown); this.canvas.removeEventListener('pointermove', this.pointerMove); this.canvas.removeEventListener('pointerup', this.pointerUp); this.canvas.removeEventListener('pointercancel', this.pointerUp); }
}
