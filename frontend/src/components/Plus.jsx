import './Plus.css';

export default function Plus() {
  const plans = [
    ['99', 'Little extra', 'Try Plus'],
    ['499', 'More to explore', 'For regular puzzlers'],
    ['999', 'All-in puzzler', 'For the puzzle-obsessed'],
  ];
  return (
    <section className="plus-section" id="puzzld-plus">
      <header className="plus-intro">
        <div className="eyebrow">
          <span className="eyebrow-star">✦</span> A LITTLE EXTRA MAGIC
        </div>
        <h2>
          For the ones who
          <br />
          <em>always want one more.</em>
        </h2>
        <p>Meet Puzzld Plus: a growing collection of exclusive puzzles for curious minds.</p>
        <div className="plus-bullets">
          <span>✓ Exclusive puzzle collections</span>
          <span>✓ More challenging worlds as they launch</span>
          <span>✓ New perks as Puzzld grows</span>
        </div>
      </header>
      <div className="plus-pricing-card">
        <header className="plus-card-top">
          <div className="plus-crown">✦</div>
          <div>
            <span className="plus-kicker">YOUR NEXT LEVEL</span>
            <h3>
              Puzzld <span>PLUS</span>
            </h3>
          </div>
          <span className="plus-coming">COMING SOON</span>
        </header>
        <p className="plus-card-copy">Choose your weekly plan preview</p>
        <div
          className="price-options"
          role="radiogroup"
          aria-label="Choose Puzzld Plus weekly plan"
        >
          {plans.map(([price, label, description], index) => (
            <button
              className={`price-option${index === 0 ? ' active' : ''}`}
              type="button"
              role="radio"
              aria-checked={index === 0}
              data-price={price}
              key={price}
            >
              <span className="price-choice">
                <i />
                <b>{label}</b>
                <small>{description}</small>
              </span>
              <span className="price-amount">
                ₹{price}
                <small>/week</small>
              </span>
            </button>
          ))}
        </div>
        <div className="plus-selected">
          <span>Selected weekly plan</span>
          <strong id="selectedPlusPrice">
            ₹99 <small>/ week</small>
          </strong>
        </div>
        <button className="button button-plus-submit" id="plusSubscribeButton" type="button">
          Notify me when Plus launches <span>↗</span>
        </button>
      </div>
    </section>
  );
}
