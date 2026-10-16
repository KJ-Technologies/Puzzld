import './Header.css';
import ScrollLink from './ScrollLink.jsx';

export default function Header() {
  return (
    <header className="topbar">
      <ScrollLink className="brand" href="#home" id="brandHome" aria-label="Puzzld home">
        <span className="brand-mark">p</span>
        <span>
          puzzld<span className="brand-period">.</span>
        </span>
      </ScrollLink>
      <nav className="topnav" aria-label="Primary navigation">
        <ul>
          <li>
            <ScrollLink href="#collection">Explore puzzles</ScrollLink>
          </li>
          <li>
            <ScrollLink href="#puzzle-stats">Puzzle stats</ScrollLink>
          </li>
          <li>
            <ScrollLink href="#puzzld-plus">Puzzld Plus ✦</ScrollLink>
          </li>
        </ul>
      </nav>
      <div className="topbar-actions">
        <span className="happy-pill">
          <i /> Your happy place
        </span>
        <ScrollLink className="nav-cta" href="#puzzld-plus">
          Explore Plus <span>✦</span>
        </ScrollLink>
      </div>
    </header>
  );
}
