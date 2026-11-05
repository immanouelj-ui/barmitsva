"use client";
import { useState } from "react";
import Link from "next/link";
import { templates } from "@/lib/models";
export function Catalog() {
  const [filter, setFilter] = useState("tous");
  return (
    <section id="modeles" className="catalog">
      <div className="section-head">
        <div>
          <span className="eyebrow">LA COLLECTION</span>
          <h2>
            À chaque histoire,
            <br />
            <i>son invitation.</i>
          </h2>
        </div>
        <div className="filters">
          {[
            ["tous", "Tout voir"],
            ["mariage", "Mariage"],
            ["bar-mitsva", "Bar-mitsva"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              aria-pressed={key === filter}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="models">
        {templates
          .filter((t) => filter === "tous" || t.kind === filter)
          .map((t) => (
            <article key={t.id}>
              <Link
                href={"/modeles/" + t.id}
                className={"model-preview theme-" + t.id}
              >
                <span className="eyebrow">
                  {t.kind === "mariage" ? "NOUS NOUS MARIONS" : "BAR MITZVAH"}
                </span>
                <span className="motif">
                  {t.kind === "mariage" ? "❦" : "✡"}
                </span>
                <span className="script">
                  {t.kind === "mariage" ? "Sarah & Nathan" : "David Michael"}
                </span>
                <span className="preview-line" />
                <span className="preview-date">19 SEPTEMBRE 2027</span>
                <span className="preview-cta">DÉCOUVRIR L’INVITATION ↗</span>
              </Link>
              <div className="model-caption">
                <div>
                  <h3>{t.name}</h3>
                  <p>{t.label}</p>
                </div>
                <Link
                  aria-label={"Découvrir " + t.name}
                  href={"/modeles/" + t.id}
                >
                  ↗
                </Link>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}
