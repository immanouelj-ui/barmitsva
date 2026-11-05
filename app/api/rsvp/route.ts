import { NextResponse, type NextRequest } from "next/server";
import { rsvpSchema } from "@/lib/validation";
import { configured } from "@/lib/config";
import { supabase } from "@/lib/supabase/server";
export async function POST(request: NextRequest) {
  if (!configured)
    return NextResponse.json(
      { error: "Le service n’est pas encore configuré." },
      { status: 503 },
    );
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin)
    return NextResponse.json(
      { error: "Requête non autorisée." },
      { status: 403 },
    );
  if (Number(request.headers.get("content-length") || 0) > 10000)
    return NextResponse.json(
      { error: "Requête trop longue." },
      { status: 413 },
    );
  let body;
  try {
    const text = await request.text();
    if (text.length > 10000)
      return NextResponse.json(
        { error: "Requête trop longue." },
        { status: 413 },
      );
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      {
        error: "Vérifiez votre nom, votre présence et le nombre de personnes.",
      },
      { status: 400 },
    );
  const d = parsed.data;
  const db = await supabase();
  const { error } = await db.rpc("submit_rsvp", {
    p_slug: d.slug,
    p_guest_token: d.guest_token,
    p_name: d.name,
    p_attending: d.attending,
    p_guests: d.guests,
    p_message: d.message,
  });
  if (error)
    return NextResponse.json(
      {
        error:
          "Réponse impossible : invitation clôturée, indisponible ou limite atteinte.",
      },
      { status: 400 },
    );
  return NextResponse.json({ ok: true });
}
