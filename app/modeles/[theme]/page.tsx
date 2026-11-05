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
    ...(t.id === "celebration"
      ? {
          kiddouch_time: "12:30",
          entertainment_time: "16:00",
          dress_code: "Élégante et festive",
          address: "12 rue de la Célébration, 75017 Paris",
          reception_address: "45 boulevard de la Fête, 75017 Paris",
        }
      : {}),
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
