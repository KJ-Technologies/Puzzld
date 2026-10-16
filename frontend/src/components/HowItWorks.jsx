import './HowItWorks.css';

export default function HowItWorks() {
  return (
    <section className="how-section" aria-labelledby="how-heading">
      <header className="how-heading">
        <div className="eyebrow">A SMALL RITUAL, A BIG RESET</div>
        <h2 id="how-heading">Find your flow in three easy moves.</h2>
        <p>No account, no pressure, no perfect way to play.</p>
      </header>
      <div className="how-grid">
        <article>
          <span className="how-number">01</span>
          <div className="how-icon yellow">⌕</div>
          <h3>Choose a world</h3>
          <p>Pick a place, mood, or tiny escape from the collection.</p>
        </article>
        <article>
          <span className="how-number">02</span>
          <div className="how-icon pink">✦</div>
          <h3>Find your rhythm</h3>
          <p>Start with 50 pieces, use the reference, and take your time.</p>
        </article>
        <article>
          <span className="how-number">03</span>
          <div className="how-icon green">✓</div>
          <h3>Celebrate the click</h3>
          <p>Every fit is a little win. Finish the picture and feel good.</p>
        </article>
      </div>
    </section>
  );
}
