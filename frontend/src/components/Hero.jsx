import { fallbackPuzzles } from '../data/puzzles.js';
import './Hero.css';
import ScrollLink from './ScrollLink.jsx';

export default function Hero() {
  return (
    <section className="hero" id="home">
      <header className="hero-copy">
        <div className="eyebrow">
          <span className="eyebrow-star">✳</span> A LITTLE JOY, PIECE BY PIECE
        </div>
        <h1>
          A softer way
          <br />
          to <em>switch off.</em>
        </h1>
        <p className="hero-description">
          Beautiful places, satisfying little clicks, and the quiet thrill of seeing it all come
          together. Take five minutes or stay awhile.
        </p>
        <div className="hero-actions">
          <button id="exploreButton" className="button button-dark" type="button">
            Play free puzzles <span>↗</span>
          </button>
          <ScrollLink className="button button-plus" href="#puzzld-plus">
            Meet Puzzld Plus <span>✦</span>
          </ScrollLink>
          <div className="hero-proof">
            <div className="avatar-stack">
              <span>✿</span>
              <span>☀</span>
              <span>✦</span>
            </div>
            <span>Made for curious minds</span>
          </div>
        </div>
        <div className="hero-tags">
          <span>✦ Real-world imagery</span>
          <span>◷ Your pace, your rules</span>
          <span>♡ No rush, just joy</span>
        </div>
      </header>
      <div className="hero-visual">
        <figure className="hero-photo-frame">
          <img
            id="heroPhoto"
            src={fallbackPuzzles[0].imageUrl}
            alt="Sunlight spilling through a lush green forest"
          />
          <figcaption className="photo-label">
            <span className="label-dot" /> YOUR NEXT LITTLE ESCAPE
          </figcaption>
          <div className="floating-note note-top">
            <span className="note-icon">✦</span>
            <span>
              <b>One piece at a time</b>
              <small>Big exhale energy</small>
            </span>
          </div>
          <div className="floating-note note-bottom">
            <span className="note-icon note-pink">♡</span>
            <span>
              <b>Little wins feel good</b>
              <small>Find your flow</small>
            </span>
          </div>
        </figure>
        <div className="sun-doodle">✳</div>
        <div className="hero-orbit">
          TAKE A<br />
          PUZZLE
          <br />
          BREAK
        </div>
      </div>
    </section>
  );
}
