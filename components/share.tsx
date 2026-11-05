"use client";
import { useState, useEffect } from "react";
export function Share({
  slug,
  published,
}: {
  slug: string;
  published: boolean;
}) {
  const [url, setUrl] = useState(""),
    [status, setStatus] = useState("");
  useEffect(() => setUrl(window.location.origin + "/i/" + slug), [slug]);
  return (
    <div className="share">
      <label>
        Lien unique de votre invitation
        <input value={url} readOnly />
      </label>
      <div className="actions">
        <button
          className="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setStatus("Lien copié.");
            } catch {
              setStatus("Sélectionnez et copiez le lien ci-dessus.");
            }
          }}
        >
          Copier le lien
        </button>
        {published && (
          <>
            <a
              className="button secondary"
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              Voir l’invitation ↗
            </a>
            <a
              className="text-link"
              href={
                "https://wa.me/?text=" +
                encodeURIComponent(
                  "Nous avons le plaisir de vous inviter : " + url,
                )
              }
              target="_blank"
              rel="noreferrer"
            >
              Partager sur WhatsApp ↗
            </a>
          </>
        )}
      </div>
      <p role="status" className="muted">
        {status ||
          (!published
            ? "Publiez votre brouillon pour activer le lien et les réponses."
            : "Seules les personnes disposant du lien pourront découvrir votre invitation.")}
      </p>
    </div>
  );
}
