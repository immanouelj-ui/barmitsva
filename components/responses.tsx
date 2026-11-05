"use client";
import { useState } from "react";
import type { RSVP } from "@/lib/models";
export function Responses({ rows }: { rows: RSVP[] }) {
  const [filter, setFilter] = useState("all"),
    [search, setSearch] = useState("");
  const filtered = rows.filter(
    (r) =>
      (filter === "all" || r.attending === (filter === "yes")) &&
      r.name.toLocaleLowerCase("fr").includes(search.toLocaleLowerCase("fr")),
  );
  return (
    <>
      <div className="response-controls">
        <input
          aria-label="Rechercher un invité"
          placeholder="Rechercher une famille…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Filtrer les réponses"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Toutes les réponses</option>
          <option value="yes">Présents</option>
          <option value="no">Absents</option>
        </select>
      </div>
      {!filtered.length ? (
        <p className="empty-small">Aucune réponse à afficher.</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Invité / famille</th>
                <th>Réponse</th>
                <th>Personnes</th>
                <th>Message</th>
                <th>Mise à jour</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>
                    <span className={"badge " + (r.attending ? "live" : "")}>
                      {r.attending ? "Présent" : "Absent"}
                    </span>
                  </td>
                  <td>{r.guests}</td>
                  <td className="message-cell">{r.message || "—"}</td>
                  <td>
                    {new Intl.DateTimeFormat("fr-FR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(r.updated_at))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
