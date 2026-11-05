import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { Share } from "@/components/share";
import { Responses } from "@/components/responses";
import { DeleteInvitation } from "@/components/delete";
import type { Invitation, RSVP } from "@/lib/models";
export default async function Detail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { db, user } = await requireUser();
  const { data, error } = await db
    .from("invitations")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (error) throw new Error("Chargement impossible.");
  if (!data) notFound();
  const i = data as Invitation;
  const { data: answers, error: responseError } = await db
    .from("rsvps")
    .select("*")
    .eq("invitation_id", id)
    .order("updated_at", { ascending: false });
  const rows = (answers || []) as RSVP[];
  return (
    <main className="workspace">
      <div className="section-head">
        <div>
          <span className="eyebrow">
            VOTRE ÉVÉNEMENT · {i.published ? "PUBLIÉ" : "BROUILLON"}
          </span>
          <h1>{i.title}</h1>
        </div>
        <Link
          className="button secondary"
          href={"/dashboard/" + id + "/modifier"}
        >
          Modifier l’invitation ↗
        </Link>
      </div>
      <Share slug={i.slug} published={i.published} />
      <div className="stats">
        <div>
          <strong>{rows.length}</strong>
          <span>Réponses reçues</span>
        </div>
        <div>
          <strong>
            {rows.filter((r) => r.attending).reduce((n, r) => n + r.guests, 0)}
          </strong>
          <span>Personnes présentes</span>
        </div>
        <div>
          <strong>{rows.filter((r) => !r.attending).length}</strong>
          <span>Réponses négatives</span>
        </div>
      </div>
      <div className="section-head">
        <h2>Vos invités</h2>
        <div className="actions">
          <Link className="text-link" href={"/dashboard/" + id}>
            Actualiser ↻
          </Link>
          <a className="text-link" href={"/dashboard/" + id + "/export"}>
            Exporter en CSV ↓
          </a>
        </div>
      </div>
      {responseError ? (
        <p className="notice">Impossible de charger les réponses. Réessayez.</p>
      ) : (
        <Responses rows={rows} />
      )}
      <div className="delete-zone">
        <DeleteInvitation id={id} />
      </div>
    </main>
  );
}
