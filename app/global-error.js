'use client';

// Last-resort error boundary: only triggers if the ROOT layout itself
// throws (providers, fonts, etc.), so it must render its own <html>/<body>
// and can't depend on any context — kept deliberately plain and self-contained.
export default function GlobalError({ reset }) {
  return (
    <html lang="fr">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '1.5rem',
          background: '#0C0C0E',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <p style={{ fontSize: '3rem', margin: 0 }}>⚠️</p>
        <h1 style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 700 }}>
          Une erreur est survenue
        </h1>
        <p style={{ marginTop: '0.5rem', maxWidth: 380, color: '#a3a3a3', fontSize: '0.9rem' }}>
          Quelque chose s’est mal passé. Veuillez réessayer.
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: '2rem',
            padding: '0.75rem 2rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: '#C9A227',
            color: '#000',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
