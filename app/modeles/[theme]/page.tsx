import { notFound } from "next/navigation";
import Link from "next/link";
import { InvitationCard } from "@/components/invitation";
import { demo, templates } from "@/lib/models";
export default async function Model({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme } = await params;
  const t = templates.find((t) => t.id === theme);
  if (!t) notFound();
  const i = {
    ...demo,
    theme: t.id,
    event_type: t.kind,
    title: t.kind === "mariage" ? "Sarah & Nathan" : demo.title,
  };
  return (
    <>
      <div className="preview-toolbar">
        <Link href="/#modeles">← Les modèles</Link>
        <Link className="button" href={"/dashboard/nouveau?modele=" + theme}>
          Choisir ce modèle ↗
        </Link>
      </div>
      <InvitationCard invitation={i} preview />
    </>
  );
}
