"use client";
import { useState } from "react";
import { saveInvitation } from "@/app/actions";
import { templates, type Invitation } from "@/lib/models";
export function Editor({
  invitation,
  theme = "azure",
}: {
  invitation?: Invitation;
  theme?: string;
}) {
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const i = invitation;
  const [selectedTheme, setSelectedTheme] = useState(i?.theme || theme);
  const fields = [
    ["title", "Prénom(s) à afficher", "Sarah & Nathan"],
    ["hosts", "Parents / organisateurs", "Familles…"],
    ["event_date", "Date de l’événement", ""],
    ["event_time", "Heure de la cérémonie", ""],
    ["venue", "Lieu de la cérémonie", "Synagogue, mairie, domaine…"],
    ["address", "Adresse de la cérémonie", ""],
    ["reception_venue", "Lieu de réception (facultatif)", ""],
    ["reception_address", "Adresse de réception", ""],
    ["reception_time", "Heure de réception", ""],
    ["kiddouch_time", "Heure du Kiddouch (facultatif)", ""],
    ["entertainment_time", "Heure des animations (facultatif)", ""],
    [
      "photo_url",
      "Photo de la cérémonie — URL HTTPS (facultatif)",
      "https://…",
    ],
    [
      "reception_photo_url",
      "Photo de la réception — URL HTTPS (facultatif)",
      "https://…",
    ],
    ["dress_code", "Tenue souhaitée (facultatif)", "Élégante et festive"],
    ["deadline", "Réponse souhaitée avant le (facultatif)", ""],
  ];
  return (
    <form
      className="editor"
      action={async (data) => {
        setBusy(true);
        try {
          const r = await saveInvitation(data);
          setStatus(r?.error || "");
        } finally {
          setBusy(false);
        }
      }}
    >
      {i && <input type="hidden" name="id" value={i.id} />}
      <div className="form-grid">
        <label>
          Type d’événement
          <select
            name="event_type"
            defaultValue={
              i?.event_type ||
              templates.find((t) => t.id === theme)?.kind ||
              "bar-mitsva"
            }
          >
            <option value="mariage">Mariage</option>
            <option value="bar-mitsva">Bar-mitsva</option>
          </select>
        </label>
        <label>
          Modèle
          <select
            name="theme"
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        {fields
          .filter(
            ([key]) =>
              selectedTheme === "celebration" ||
              ![
                "photo_url",
                "reception_photo_url",
                "kiddouch_time",
                "entertainment_time",
                "dress_code",
              ].includes(key),
          )
          .map(([key, label, placeholder]) => (
            <label key={key}>
              {label}
              <input
                name={key}
                defaultValue={String(i?.[key as keyof Invitation] || "")}
                type={
                  key.endsWith("_url")
                    ? "url"
                    : key.includes("date") || key === "deadline"
                      ? "date"
                      : key.includes("time")
                        ? "time"
                        : "text"
                }
                placeholder={placeholder}
                maxLength={
                  key.endsWith("_url")
                    ? 2000
                    : key.includes("address")
                      ? 350
                      : 160
                }
                required={[
                  "title",
                  "event_date",
                  "event_time",
                  "venue",
                ].includes(key)}
              />
            </label>
          ))}
      </div>
      <label>
        Votre texte d’invitation
        <textarea
          name="message"
          maxLength={2000}
          rows={5}
          defaultValue={
            i?.message ||
            "Avec une grande joie, nous vous invitons à partager ce moment unique et à célébrer ensemble."
          }
        />
      </label>
      <label className="radio publish">
        <input
          type="checkbox"
          name="published"
          defaultChecked={i?.published ?? false}
        />
        Publier l’invitation et autoriser les réponses
      </label>
      <p className="muted">
        Un brouillon reste visible uniquement dans votre espace. Une invitation
        publiée peut être consultée par toute personne possédant son lien.
      </p>
      <button className="button" disabled={busy}>
        {busy
          ? "Enregistrement…"
          : i
            ? "Enregistrer les modifications"
            : "Créer mon invitation"}
      </button>
      <p role="status" className="form-status">
        {status}
      </p>
    </form>
  );
}
