"use client";
import { useState } from "react";
import { MapPin, Clock, Music, Utensils, BookOpen } from "lucide-react";
import { formatDate, type Invitation } from "@/lib/models";
import { CelebrationInvitation } from "./celebration-invitation";
import { RsvpForm } from "./rsvp-form";
export function InvitationCard({
  invitation: i,
  preview = false,
}: {
  invitation: Invitation;
  preview?: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (i.theme === "celebration")
    return <CelebrationInvitation invitation={i} preview={preview} />;
  const title = i.event_type === "mariage" ? "MARIAGE" : "BAR MITZVAH";
  const map = (address: string) =>
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(address);
  return (
    <div className={"invitation-page theme-" + i.theme}>
      {preview && (
        <div className="preview-banner">
          APERÇU DU MODÈLE · EXEMPLE DE PERSONNALISATION
        </div>
      )}
      <main className="invitation-stack">
        <section className="invite-cover">
          <p className="arched">
            CÉLÉBRONS ENSEMBLE {i.event_type === "mariage" ? "LE" : "LA"}
          </p>
          <span className="motif">
            {i.event_type === "mariage" ? "❦" : "✡"}
          </span>
          <h1>{title}</h1>
          <small>DE</small>
          <div className="script">{i.title}</div>
          <span className="preview-line" />
          <p className="event-date">{formatDate(i.event_date)}</p>
          <button
            className="outline"
            onClick={() => {
              setOpen(true);
              setTimeout(
                () =>
                  document
                    .getElementById("details")
                    ?.scrollIntoView({ behavior: "smooth" }),
                40,
              );
            }}
          >
            ✉ &nbsp; OUVRIR L’INVITATION
          </button>
        </section>
        {open && (
          <div id="details" className="invite-details">
            <section className="invite-paper">
              <div className="arch-art">
                <span>{i.event_type === "mariage" ? "❦" : "✡"}</span>
              </div>
              <p className="eyebrow">
                AVEC UNE GRANDE JOIE
                <br />
                {i.hosts || "NOUS VOUS INVITONS"}
              </p>
              <p className="cerif">VOUS INVITENT À CÉLÉBRER</p>
              <div className="script">{i.title}</div>
              <div className="gold-divider">✧</div>
              <p className="personal-message">{i.message}</p>
              <p className="cerif">
                {formatDate(i.event_date)} · {i.event_time}
              </p>
              <MapPin size={25} />
              <h3>{i.venue}</h3>
              <p>{i.address}</p>
              {i.address && (
                <a
                  className="text-link"
                  target="_blank"
                  rel="noreferrer"
                  href={map(i.venue + " " + i.address)}
                >
                  Voir l’itinéraire ↗
                </a>
              )}
            </section>
            <section className="invite-paper programme">
              <h2>
                Le déroulé
                <br />
                de la célébration
              </h2>
              <div className="gold-divider">✧</div>
              <div className="schedule">
                <div>
                  <BookOpen />
                  <p>
                    <strong>{i.event_time}</strong>
                    <span>
                      {i.event_type === "mariage"
                        ? "La cérémonie"
                        : "Office et lecture de la Torah"}
                    </span>
                  </p>
                </div>
                {i.reception_venue && (
                  <div>
                    <Utensils />
                    <p>
                      <strong>{i.reception_time || "À la suite"}</strong>
                      <span>La réception</span>
                    </p>
                  </div>
                )}
                <div>
                  <Music />
                  <p>
                    <strong>Ensemble</strong>
                    <span>Des moments à partager</span>
                  </p>
                </div>
              </div>
            </section>
            {i.reception_venue && (
              <section className="invite-paper reception">
                <span className="motif">❦</span>
                <h2>La réception</h2>
                <div className="gold-divider">✧</div>
                <h3>{i.reception_venue}</h3>
                <p>{i.reception_address}</p>
                <p>
                  <Clock size={17} />{" "}
                  {i.reception_time || "À la suite de la cérémonie"}
                </p>
                {i.reception_address && (
                  <a
                    className="button"
                    target="_blank"
                    rel="noreferrer"
                    href={map(i.reception_venue + " " + i.reception_address)}
                  >
                    <MapPin size={15} /> Voir l’itinéraire
                  </a>
                )}
              </section>
            )}
            <section className="invite-paper">
              <span className="motif gold">✧</span>
              <h2>
                Confirmation
                <br />
                de présence
              </h2>
              <div className="gold-divider">✧</div>
              <p>
                Merci de confirmer votre présence
                {i.deadline ? (
                  <>
                    {" "}
                    avant le <strong>{formatDate(i.deadline)}</strong>
                  </>
                ) : (
                  "."
                )}
              </p>
              <RsvpForm slug={i.slug} preview={preview} />
              <p className="script closing-script">
                Nous avons hâte de partager ce moment avec vous !
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
