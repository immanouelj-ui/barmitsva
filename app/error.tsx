"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="auth-box">
      <h1>Un petit contretemps.</h1>
      <p>
        Cette page est temporairement indisponible. Réessayez dans un instant.
      </p>
      <button className="button" onClick={reset}>
        Réessayer
      </button>
    </main>
  );
}
