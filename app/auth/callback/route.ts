import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { configured } from "@/lib/config";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (configured && code) {
    try {
      const db = await supabase();
      const { error } = await db.auth.exchangeCodeForSession(code);
      if (!error)
        return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch {
      /* Expired links and unavailable Auth return to sign in. */
    }
  }
  return NextResponse.redirect(
    new URL("/connexion?confirmation=failed", request.url),
  );
}
