import { notFound } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { Editor } from "@/components/editor";
import type { Invitation } from "@/lib/models";
export default async function Edit({
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
  return (
    <main className="workspace narrow">
      <span className="eyebrow">LES PETITS DÉTAILS FONT TOUT</span>
      <h1>
        Votre invitation,
        <br />
        <i>à votre image.</i>
      </h1>
      <Editor invitation={data as Invitation} />
    </main>
  );
}
