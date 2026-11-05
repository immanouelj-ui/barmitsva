"use client";
import { useState } from "react";
export function RsvpForm({
  slug,
  preview,
}: {
  slug: string;
  preview: boolean;
}) {
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [attending, setAttending] = useState(true);
  return (
    <form
      className="rsvp-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (preview) {
          setStatus("Ceci est un aperçu : aucune réponse n’est enregistrée.");
          return;
        }
        setBusy(true);
        setStatus("");
        try {
          const data = new FormData(e.currentTarget);
          const key = "rsvp-token:" + slug;
          let token = localStorage.getItem(key);
          if (!token) {
            token = crypto.randomUUID();
            localStorage.setItem(key, token);
          }
          const r = await fetch("/api/rsvp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              slug,
              guest_token: token,
              name: data.get("name"),
              attending,
              guests: attending ? Number(data.get("guests")) : 0,
              message: data.get("message"),
              website: data.get("website"),
            }),
          });
          const result = await r.json();
          setStatus(
            r.ok
              ? "Merci ! Votre réponse est enregistrée. Vous pouvez la modifier depuis ce navigateur."
              : result.error || "Impossible d’enregistrer la réponse.",
          );
        } catch {
          setStatus("Connexion interrompue. Réessayez dans un instant.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        Nom / famille
        <input
          required
          name="name"
          minLength={2}
          maxLength={160}
          placeholder="Famille Cohen"
          autoComplete="name"
        />
      </label>
      <fieldset>
        <legend>Votre présence</legend>
        <label className="radio">
          <input
            type="radio"
            name="presence"
            checked={attending}
            onChange={() => setAttending(true)}
          />
          Je serai présent(e)
        </label>
        <label className="radio">
          <input
            type="radio"
            name="presence"
            checked={!attending}
            onChange={() => setAttending(false)}
          />
          Je ne pourrai pas être présent(e)
        </label>
      </fieldset>
      {attending && (
        <label>
          Nombre de personnes
          <select name="guests" defaultValue="1">
            {Array.from({ length: 20 }, (_, n) => (
              <option key={n + 1}>{n + 1}</option>
            ))}
          </select>
        </label>
      )}
      <label>
        Votre message (facultatif)
        <textarea
          name="message"
          maxLength={1000}
          placeholder="Un petit mot pour les hôtes…"
        />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Site web
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button className="button" disabled={busy}>
        {busy ? "Enregistrement…" : "Confirmer ma réponse"}
      </button>
      <p className="form-status" role="status">
        {status}
      </p>
      <small>
        Votre nom et votre réponse sont transmis uniquement aux organisateurs.
        Ne saisissez pas d’informations sensibles.
      </small>
    </form>
  );
}
