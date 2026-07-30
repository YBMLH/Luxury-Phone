'use client';

// Airport departure board. Every character gets its own hinged tile and the
// tiles drop into place left-to-right, so the headline lands the way an
// arrivals row updates rather than just fading in.
//
// The tiles are decorative markup — one character each is bad input for a
// screen reader or a crawler — so the real sentence lives in a visually
// hidden span and the board itself is hidden from assistive tech.
const FLIP_STEP_MS = 70;

export default function SplitFlapTitle({ lines = [], className = '' }) {
  const rows = lines.filter(Boolean);
  let charIndex = 0;

  return (
    <h1 className={className}>
      <span className="sr-only">{rows.join(' ')}</span>

      <span aria-hidden="true" className="flap-board">
        {rows.map((line, row) => (
          <span key={row} className="flap-row">
            {[...line].map((char, i) => {
              const delay = charIndex++ * FLIP_STEP_MS;
              return char === ' ' ? (
                <span key={i} className="flap-gap" />
              ) : (
                <span key={i} className="flap-tile" style={{ animationDelay: `${delay}ms` }}>
                  {char}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </h1>
  );
}
