import { redirect } from "next/navigation";
import { supabase } from "./supabase/server";
import { configured } from "./config";
export async function requireUser() {
  if (!configured) redirect("/connexion");
  const db = await supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/connexion");
  return { db, user };
}
