"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  BookOpen,
  Wine,
  Utensils,
  Music,
  MapPin,
  Mail,
  Camera,
} from "lucide-react";
import { formatDate, type Invitation } from "@/lib/models";
import { RsvpForm } from "./rsvp-form";
import "./celebration.css";

function Star({ className = "star" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 4 43 37H5Z M24 44 5 11h38Z" />
    </svg>
  );
}
function Divider() {
  return (
    <div className="sep" aria-hidden="true">
      <i />
      <Star />
      <i />
    </div>
  );
}
function Watercolor({ bottom = false }: { bottom?: boolean }) {
  return (
    <>
      <div className={"wc " + (bottom ? "b" : "t")} aria-hidden="true" />
      <div className={"gl " + (bottom ? "b" : "t")} aria-hidden="true" />
    </>
  );
}
function Photo({
  src,
  venue = false,
  alt,
}: {
  src?: string;
  venue?: boolean;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={
        (venue ? "photo-t" : "photo-arch") +
        (!src || failed ? " photo-placeholder" : "")
      }
    >
      {src && !failed ? (
        <img src={src} alt={alt} onError={() => setFailed(true)} />
      ) : (
        <>
          <Camera size={40} />
          <span>{venue ? "Votre lieu de réception" : "Votre photo"}</span>
        </>
      )}
    </div>
  );
}
const time = (value: string) => value.replace(":", "H");

export function CelebrationInvitation({
  invitation: i,
  preview = false,
}: {
  invitation: Invitation;
  preview?: boolean;
}) {
  const [revealed, setRevealed] = useState(false),
    [opening, setOpening] = useState(false),
    [coverVisible, setCoverVisible] = useState(true);
  const root = useRef<HTMLDivElement>(null),
    main = useRef<HTMLElement>(null);
  const day = new Date(i.event_date + "T12:00:00Z");
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("fr-FR", { ...options, timeZone: "UTC" }).format(
      day,
    );
  const title = i.event_type === "mariage" ? "MARIAGE" : "BAR MITZVAH";
  const nameParts = i.title.trim().split(/\s+/);
  const longName = nameParts.length > 1 && i.event_type === "bar-mitsva";
  const map =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(i.reception_venue + " " + i.reception_address);
  useEffect(() => {
    if (!revealed || !main.current) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(
      () => {
        setOpening(false);
        setCoverVisible(false);
      },
      reduced ? 0 : 1000,
    );
    if (reduced || !("IntersectionObserver" in window))
      return () => clearTimeout(timer);
    const element = main.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    element.classList.add("observed");
    element.querySelectorAll(".card").forEach((card) => observer.observe(card));
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      element.classList.remove("observed");
    };
  }, [revealed]);
  return (
    <div
      ref={root}
      className={
        "classic-invitation " +
        (!revealed ? "lock " : "") +
        (opening ? "opening" : "")
      }
    >
      {preview && (
        <div className="preview-banner">
          APERÇU DU MODÈLE · INFORMATIONS D’EXEMPLE
        </div>
      )}
      {coverVisible && (
        <section
          className="classic-cover"
          aria-label="Couverture du faire-part"
          inert={revealed}
        >
          <Watercolor />
          <Watercolor bottom />
          <div className="cv">
            <p className="arc">
              Célébrons ensemble {i.event_type === "mariage" ? "le" : "la"}
            </p>
            <Star />
            <p className="t1">{title}</p>
            <p className="de">DE</p>
            <p className="name">
              {longName ? (
                <>
                  {nameParts[0]}
                  <br />
                  {nameParts.slice(1).join(" ")}
                </>
              ) : (
                i.title
              )}
            </p>
            <div className="rule" />
            <p className="dt">
              {part({ weekday: "long" }).toUpperCase()}
              <br />
              {part({
                day: "numeric",
                month: "long",
                year: "numeric",
              }).toUpperCase()}
            </p>
            <button
              className="btn open"
              type="button"
              onClick={() => {
                setOpening(true);
                setRevealed(true);
                root.current?.scrollIntoView({ behavior: "instant" });
              }}
            >
              <Mail size={16} />
              Ouvrir l’invitation
            </button>
          </div>
          {Array.from({ length: 26 }, (_, n) => (
            <span
              className="dot"
              key={n}
              aria-hidden="true"
              style={
                {
                  "--x": ((n * 37) % 100) + "%",
                  "--y": ((n * 19) % 100) + "%",
                  "--duration": 2 + (n % 4) + "s",
                  "--delay": (n % 7) / 3 + "s",
                } as CSSProperties
              }
            />
          ))}
        </section>
      )}
      <main className="classic-main" ref={main} hidden={!revealed}>
        <section className="card" style={{ paddingTop: 60 }}>
          <Watercolor />
          <Photo
            key={i.photo_url}
            src={i.photo_url}
            alt={"Photo de " + i.title}
          />
          <p className="small classic-message">
            {i.message ||
              "Avec une grande joie, nous vous invitons à célébrer ensemble."}
          </p>
          {i.hosts && <p className="small classic-hosts">{i.hosts}</p>}
          <p className="name">{i.title}</p>
          <Divider />
          <div className="when">
            <div className="d small">
              {part({ weekday: "long" })}
              <b>{part({ day: "numeric" })}</b>
              {part({ month: "long" })}
              <br />
              {part({ year: "numeric" })}
            </div>
            <div className="h">À {time(i.event_time)}</div>
          </div>
          <div className="loc">
            <MapPin />
            <div>
              {i.venue}
              <br />
              {i.address}
            </div>
          </div>
          <Watercolor bottom />
        </section>
        <section className="card">
          <Watercolor />
          <h2>
            Le déroulé
            <br />
            de la célébration
          </h2>
          <Divider />
          <div className="tl">
            <div className="ln" />
            <div className="ev">
              <BookOpen />
              <div>
                <b>{time(i.event_time)}</b>
                <span>
                  {i.event_type === "mariage"
                    ? "La cérémonie"
                    : "Office et lecture de la Torah"}
                </span>
              </div>
            </div>
            {i.kiddouch_time && (
              <div className="ev">
                <Wine />
                <div>
                  <b>{time(i.kiddouch_time)}</b>
                  <span>Kiddouch</span>
                </div>
              </div>
            )}
            {i.reception_venue && (
              <div className="ev">
                <Utensils />
                <div>
                  <b>
                    {i.reception_time ? time(i.reception_time) : "À la suite"}
                  </b>
                  <span>Déjeuner de fête</span>
                </div>
              </div>
            )}
            {i.entertainment_time && (
              <div className="ev">
                <Music />
                <div>
                  <b>{time(i.entertainment_time)}</b>
                  <span>Animations et réception</span>
                </div>
              </div>
            )}
          </div>
          <Watercolor bottom />
        </section>
        {i.reception_venue && (
          <section className="card" style={{ paddingTop: 0 }}>
            <Photo
              key={i.reception_photo_url}
              src={i.reception_photo_url}
              venue
              alt={"Réception : " + i.reception_venue}
            />
            <Watercolor bottom />
            <h2>La réception</h2>
            <Divider />
            <p className="small" style={{ fontSize: 12 }}>
              {i.reception_venue}
              <br />
              {i.reception_address}
            </p>
            {i.reception_address && (
              <p style={{ margin: "18px 0 22px" }}>
                <a className="btn" target="_blank" rel="noreferrer" href={map}>
                  <MapPin />
                  Voir l’itinéraire
                </a>
              </p>
            )}
            {i.dress_code && (
              <>
                <h2 style={{ fontSize: 16 }}>Tenue souhaitée</h2>
                <div className="dress" aria-hidden="true">
                  <svg viewBox="0 0 48 48">
                    <path d="M14 6 24 14 34 6l8 8-5 26H11L6 14Z M24 14v26" />
                  </svg>
                  <i />
                  <svg viewBox="0 0 48 48">
                    <path d="M16 6c2 4 14 4 16 0l12 8-5 9-5-3v22H14V20l-5 3-5-9Z" />
                  </svg>
                </div>
                <p className="small" style={{ fontSize: 12 }}>
                  {i.dress_code}
                </p>
              </>
            )}
          </section>
        )}
        <section className="card">
          <Watercolor />
          <Star />
          <h2 style={{ marginTop: 14 }}>
            Confirmation
            <br />
            de présence
          </h2>
          <Divider />
          <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            Merci de nous confirmer votre présence
            {i.deadline && (
              <>
                <br />
                avant le <b>{formatDate(i.deadline)}</b>
              </>
            )}
            .
          </p>
          <RsvpForm slug={i.slug} preview={preview} />
          <p className="cursive">
            Nous avons hâte de partager ce moment unique avec vous !
          </p>
          <Watercolor bottom />
        </section>
      </main>
    </div>
  );
}
