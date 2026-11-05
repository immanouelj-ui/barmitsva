import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { formatDate, type Invitation } from "@/lib/models";
export default async function Dashboard() {
  const { db, user } = await requireUser();
  const { data, error } = await db
    .from("invitations")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  return (
    <main className="workspace">
      <div className="section-head">
        <div>
          <span className="eyebrow">MON ESPACE</span>
          <h1>
            Les jours <i>qui comptent.</i>
          </h1>
        </div>
        <Link className="button" href="/dashboard/nouveau">
          + Nouvelle invitation
        </Link>
      </div>
      {error ? (
        <p className="notice">
          Impossible de charger les invitations. Vérifiez la migration Supabase.
        </p>
      ) : !data?.length ? (
        <div className="empty">
          <span>✧</span>
          <h2>Votre prochaine belle histoire commence ici.</h2>
          <p>Choisissez un modèle et créez votre premier faire-part.</p>
          <Link className="button" href="/#modeles">
            Découvrir les modèles ↗
          </Link>
        </div>
      ) : (
        <div className="event-list">
          {(data as Invitation[]).map((i) => (
            <Link className="event-row" key={i.id} href={"/dashboard/" + i.id}>
              <span className={"event-swatch theme-" + i.theme}>
                {i.event_type === "mariage" ? "❦" : "✡"}
              </span>
              <div>
                <h2>{i.title}</h2>
                <p>
                  {formatDate(i.event_date)} · {i.venue}
                </p>
              </div>
              <span className={"badge " + (i.published ? "live" : "")}>
                {i.published ? "Publiée" : "Brouillon"}
              </span>
              <span>↗</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
