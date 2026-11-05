import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { csvCell } from "@/lib/validation";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return new Response("Introuvable", { status: 404 });
  const { db, user } = await requireUser();
  const { data: i } = await db
    .from("invitations")
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!i) return new Response("Introuvable", { status: 404 });
  const { data, error } = await db
    .from("rsvps")
    .select("name,attending,guests,message,updated_at")
    .eq("invitation_id", id)
    .order("updated_at", { ascending: false });
  if (error) return new Response("Export impossible", { status: 500 });
  const rows = [
    ["Nom", "Présence", "Personnes", "Message", "Mise à jour"],
    ...(data || []).map((r) => [
      r.name,
      r.attending ? "Oui" : "Non",
      r.guests,
      r.message,
      r.updated_at,
    ]),
  ];
  return new NextResponse(
    "﻿" + rows.map((r) => r.map(csvCell).join(";")).join("\r\n"),
    {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="reponses.csv"',
        "Cache-Control": "private, no-store",
      },
    },
  );
}
