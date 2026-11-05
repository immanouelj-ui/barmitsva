import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase/server";
import { configured } from "@/lib/config";
import { InvitationCard } from "@/components/invitation";
import { z } from "zod";
import type { Invitation } from "@/lib/models";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Votre invitation",
  robots: { index: false, follow: false },
};
export default async function PublicInvitation({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!configured || !z.uuid().safeParse(slug).success) notFound();
  const db = await supabase();
  const { data, error } = await db.rpc("get_public_invitation", {
    p_slug: slug,
  });
  if (error) throw new Error("L’invitation est temporairement indisponible.");
  if (!data) notFound();
  return <InvitationCard invitation={data as Invitation} />;
}
