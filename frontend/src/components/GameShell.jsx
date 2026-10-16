import './GameShell.css';

export default function GameShell() {
  return (
    <section id="gameView" className="game-view hidden">
      <div className="game-heading">
        <button id="backButton" className="back-button" type="button">
          ← <span>All puzzles</span>
        </button>
        <div className="game-title-wrap">
          <div className="eyebrow" id="gameCategory">
            YOUR LITTLE ESCAPE
          </div>
          <h1 id="gameTitle">Jungle Safari</h1>
          <p id="gameSubtitle">A little wild, a lot wonderful.</p>
        </div>
        <div className="timer-card">
          <span className="timer-icon">◷</span>
          <div>
            <small>YOUR PUZZLE TIME</small>
            <strong id="timer">00:00</strong>
          </div>
        </div>
      </div>
      <div className="game-toolbar">
        <div className="difficulty-wrap">
          <span className="toolbar-label">CHOOSE YOUR CHALLENGE</span>
          <div className="difficulty-options" id="difficultyOptions">
            {[50, 100, 300, 500, 1000].map((count) => (
              <button
                data-pieces={count}
                className={`difficulty${count === 50 ? ' active' : ''}${count > 100 ? ' locked' : ''}`}
                disabled={count > 100}
                key={count}
              >
                {count > 100 ? '🔒 ' : ''}
                {count} {count > 100 && <small>soon</small>}
              </button>
            ))}
          </div>
        </div>
        <div className="toolbar-actions">
          <button id="referenceButton" className="toolbar-button" type="button">
            ▧ <span>Reference on</span>
          </button>
          <button id="restartButton" className="toolbar-button" type="button">
            ↻ <span>Start over</span>
          </button>
        </div>
      </div>
      <div className="game-layout">
        <section className="board-panel">
          <div className="board-topline">
            <span>
              <i className="live-dot" /> YOUR PUZZLE TABLE
            </span>
            <span>Pick up a piece and find its place</span>
          </div>
          <div className="canvas-wrap" id="canvasWrap">
            <canvas
              id="puzzleCanvas"
              aria-label="Interactive jigsaw puzzle. Drag pieces to their correct position."
            />
            <div id="loadingOverlay" className="loading-overlay">
              <div className="loader" />
              <b>Setting the pieces out…</b>
              <small>Good things take a moment</small>
            </div>
            <div id="startOverlay" className="start-overlay hidden">
              <div className="start-symbol">✳</div>
              <h2>Ready when you are.</h2>
              <p>Your time starts with your first move.</p>
              <button id="startButton" className="button button-dark" type="button">
                Start puzzling <span>→</span>
              </button>
            </div>
            <div id="completeOverlay" className="complete-overlay hidden">
              <div className="complete-check">✓</div>
              <p className="eyebrow">THAT’S A LOVELY FINISH</p>
              <h2>You made the whole picture.</h2>
              <p id="completeMessage" />
              <div className="complete-actions">
                <button id="playAgainButton" className="button button-dark" type="button">
                  One more round ↻
                </button>
                <button id="chooseAnotherButton" className="button button-light" type="button">
                  Pick another
                </button>
              </div>
            </div>
          </div>
          <div className="board-bottomline">
            <span id="progressText">0 of 50 pieces found</span>
            <div className="progress-track">
              <span id="progressBar" />
            </div>
            <span id="progressPercent">0%</span>
          </div>
        </section>
        <aside className="side-panel">
          <div className="reference-card" id="referenceCard">
            <div className="side-card-head">
              <div>
                <span className="eyebrow">THE BIG PICTURE</span>
                <h3>Your little guide</h3>
              </div>
              <button id="hideReferenceButton" className="icon-button" type="button">
                ⌁
              </button>
            </div>
            <div className="reference-image" id="referenceImage" />
            <p>Use the picture as your guide, then trust your eyes.</p>
          </div>
          <div className="stats-mini">
            <div>
              <span>PIECES</span>
              <b id="sidePieceCount">50</b>
            </div>
            <div>
              <span>FOUND</span>
              <b id="sidePlacedCount">0</b>
            </div>
          </div>
        </aside>
      </div>
      <footer className="game-footer">
        <span>Take your time. There’s no wrong way to unwind.</span>
        <button id="footerReferenceButton" className="footer-link" type="button">
          Toggle reference image ↗
        </button>
      </footer>
    </section>
  );
}
