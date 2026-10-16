import './CommunityStats.css';

export default function CommunityStats() {
  return (
    <section className="puzzle-stats-section" id="puzzle-stats">
      <header className="stats-section-head">
        <div>
          <div className="eyebrow">THE LITTLE WINS ADD UP</div>
          <h2>Made of little victories.</h2>
          <p>Real play stats from the Puzzld community, refreshed as people play.</p>
        </div>
        <button id="refreshStatsButton" className="stats-refresh" type="button">
          ↻ Refresh stats
        </button>
      </header>
      <div className="community-stats-grid">
        <article className="community-stat">
          <span className="community-stat-icon">🧩</span>
          <small>PUZZLE ATTEMPTS</small>
          <strong id="totalAttempts">—</strong>
          <span>times people started playing</span>
        </article>
        <article className="community-stat">
          <span className="community-stat-icon pink">✦</span>
          <small>PUZZLES COMPLETED</small>
          <strong id="totalCompletions">—</strong>
          <span>little finishes celebrated</span>
        </article>
        <article className="community-stat">
          <span className="community-stat-icon green">◷</span>
          <small>AVERAGE COMPLETION</small>
          <strong id="averageCompletion">—</strong>
          <span>across completed puzzles</span>
        </article>
      </div>
      <p className="stats-note" id="statsNote">
        Stats will appear as real players try and complete puzzles.
      </p>
    </section>
  );
}
