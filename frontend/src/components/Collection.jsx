import { useState } from 'react';
import { categories } from '../data/puzzles.js';
import './Collection.css';

export default function Collection({ puzzles }) {
  const [filter, setFilter] = useState('All');
  const filtered =
    filter === 'All' ? puzzles : puzzles.filter((puzzle) => puzzle.category === filter);
  return (
    <section className="collection-section" id="collection">
      <header className="section-head">
        <div>
          <div className="eyebrow">THE PUZZLD PLAYGROUND</div>
          <h2>Where shall we wander?</h2>
          <p>Pick a picture that makes you feel something.</p>
        </div>
        <div className="collection-count">
          <b id="designCount">{filtered.length}</b>
          <span>
            little worlds
            <br />
            to explore
          </span>
        </div>
      </header>
      <nav className="filter-row" id="filters" aria-label="Puzzle categories">
        {categories.map(([value, label]) => (
          <button
            className={`filter${filter === value ? ' active' : ''}`}
            data-filter={value}
            type="button"
            key={value}
            onClick={() => setFilter(value)}
          >
            {label}
            {value === 'All' && <span>{puzzles.length}</span>}
          </button>
        ))}
      </nav>
      <div className="design-grid" id="designGrid" aria-live="polite">
        {filtered.map((puzzle) => (
          <article
            className="design-card"
            role="button"
            tabIndex="0"
            data-puzzle={puzzle.id}
            aria-label={`Play ${puzzle.title}`}
            key={puzzle.id}
          >
            <figure className="design-photo">
              <img loading="lazy" src={puzzle.imageUrl} alt={`${puzzle.title} puzzle photograph`} />
              <span className="photo-chip">{puzzle.tag}</span>
              <button className="card-play" type="button" aria-label={`Play ${puzzle.title}`}>
                ↗
              </button>
            </figure>
            <header className="design-meta">
              <div>
                <h3>{puzzle.title}</h3>
                <p>{puzzle.subtitle}</p>
              </div>
              <span className="piece-tag">50 &amp; 100 pcs · Play now</span>
            </header>
            <footer className="card-community-stats">
              <span>Ready to play</span>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
