'use client';

/**
 * The last thing standing when the root layout itself cannot render.
 *
 * That layout reads the session and the whole roster from the database, so
 * a database that is unreachable takes it down — and with nothing to catch
 * it the visitor got HTTP 500 and a blank page. Not a message, not a retry:
 * a white screen with a title bar, which on a phone at the gate reads as
 * "my phone is broken" rather than "the show's app is having a minute".
 *
 * `error.tsx` cannot help here. It only catches what happens *inside* the
 * root layout's children, and the failure is the layout. This one replaces
 * the document, which is why it carries its own <html> and its own colours
 * rather than trusting a stylesheet to have loaded.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ro">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#08080a',
          color: '#f4f3ef',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <main style={{ maxWidth: '30rem', textAlign: 'center' }}>
          <p
            style={{
              margin: '0 0 14px',
              letterSpacing: '0.18em',
              fontSize: '12px',
              color: '#e01b24',
            }}
          >
            X CAR SHOW
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: '30px',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              fontWeight: 600,
            }}
          >
            Ceva nu merge acum.
          </h1>

          <p
            style={{
              margin: '14px 0 0',
              fontSize: '15px',
              lineHeight: 1.5,
              color: 'rgba(244, 243, 239, 0.62)',
            }}
          >
            Nu e de la telefonul tău. Încearcă din nou peste un minut — dacă tot nu merge,
            spune-i cuiva de la poartă.
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '26px',
              padding: '16px 26px',
              width: '100%',
              maxWidth: '18rem',
              borderRadius: '999px',
              border: '1px solid transparent',
              background: '#e01b24',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Încearcă din nou
          </button>

          {/*
            The code the server logged this under. Worth nothing to a
            visitor and everything to whoever is holding the laptop:
            `docker logs x-car-show-live | grep <code>` goes straight to it.
          */}
          {error.digest && (
            <p
              style={{
                margin: '22px 0 0',
                fontSize: '12px',
                letterSpacing: '0.04em',
                color: 'rgba(244, 243, 239, 0.28)',
              }}
            >
              Cod: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
