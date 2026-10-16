import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import Collection from './components/Collection.jsx';
import CommunityStats from './components/CommunityStats.jsx';
import Plus from './components/Plus.jsx';
import GameShell from './components/GameShell.jsx';
import ScrollLink from './components/ScrollLink.jsx';
import { fallbackPuzzles } from './data/puzzles.js';
import './App.css';

const defaultApiUrl =
  window.location.port === '3000' ? 'http://localhost:3001' : window.location.origin;
const API_BASE_URL = (import.meta.env.VITE_API_URL || defaultApiUrl).replace(/\/$/, '');

function FeatureStrip() {
  return (
    <ul className="mini-strip">
      <li>
        <span className="strip-icon">◈</span>
        <span>
          <b>Lovely imagery</b>
          <small>Places worth getting lost in</small>
        </span>
      </li>
      <li>
        <span className="strip-icon strip-pink">⌘</span>
        <span>
          <b>A satisfying challenge</b>
          <small>50 &amp; 100 pieces available now</small>
        </span>
      </li>
      <li>
        <span className="strip-icon strip-green">♡</span>
        <span>
          <b>Your own pace</b>
          <small>No pressure. Just progress.</small>
        </span>
      </li>
    </ul>
  );
}

function ClosingBanner() {
  return (
    <section className="closing-banner">
      <div className="closing-spark">✳</div>
      <div>
        <span className="eyebrow">YOUR SIGN TO SLOW DOWN</span>
        <h2>
          One less scroll.
          <br />
          <em>One more little joy.</em>
        </h2>
      </div>
      <button id="closingExplore" className="button button-dark" type="button">
        Let’s play <span>↗</span>
      </button>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <ScrollLink className="footer-brand" href="#home">
        puzzld<span>.</span>
      </ScrollLink>
      <span>Made for curious minds and happy little breaks.</span>
      <ScrollLink href="#puzzld-plus">Discover Puzzld Plus ✦</ScrollLink>
      <span className="company-credit">
        Puzzld is a brand by <b>KJ Technologies</b>
      </span>
    </footer>
  );
}

export default function App() {
  const [puzzles, setPuzzles] = useState(fallbackPuzzles);

  useEffect(() => {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    window.__PUZZLD_API_URL__ = API_BASE_URL;

    fetch(`${API_BASE_URL}/api/puzzles`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.puzzles?.length)
          setPuzzles(
            data.puzzles.map((item) => ({
              ...fallbackPuzzles.find((puzzle) => puzzle.id === item.id),
              ...item,
            })),
          );
      })
      .catch(() => {});

    const gameScript = document.createElement('script');
    gameScript.type = 'module';
    gameScript.src = '/game/game-app.js';
    document.body.appendChild(gameScript);
    return () => gameScript.remove();
  }, []);

  return (
    <div className="app-shell">
      <div id="catalogueView">
        <Header />
        <main>
          <Hero />
          <FeatureStrip />
          <HowItWorks />
          <Collection puzzles={puzzles} />
          <CommunityStats />
          <Plus />
          <ClosingBanner />
          <Footer />
        </main>
      </div>
      <GameShell />
      <div id="toast" className="toast" role="status" aria-live="polite" />
    </div>
  );
}
