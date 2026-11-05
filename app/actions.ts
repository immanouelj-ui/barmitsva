"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authErrorMessage, type AuthState } from "@/lib/auth-messages";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabase } from "@/lib/supabase/server";
import { configured } from "@/lib/config";
import { invitationSchema } from "@/lib/validation";
export async function authAction(
  _previous: AuthState,
  form: FormData,
): Promise<AuthState> {
  if (!configured) return { error: "Supabase n’est pas configuré." };
  const parsed = z
    .object({
      email: z.string().trim().pipe(z.email()),
      password: z.string().min(8).max(128),
      mode: z.enum(["signup", "login"]),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      error:
        "Vérifiez votre email et votre mot de passe (8 caractères minimum).",
    };
  const { email, password, mode } = parsed.data;
  try {
    const db = await supabase();
    if (mode === "signup") {
      const origin = await authOrigin();
      const { data, error } = await db.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: origin + "/auth/callback" },
      });
      if (error)
        return {
          error: authErrorMessage(error),
          email,
          needsConfirmation: error.code === "user_already_exists",
        };
      if (!data.session)
        return {
          email,
          needsConfirmation: true,
          cooldownUntil: Date.now() + 60_000,
          message:
            "Demande d’inscription reçue. Si cette adresse peut être inscrite, un email de confirmation vous a été envoyé. Ouvrez son lien pour activer le compte. Si vous aviez déjà confirmé votre compte, connectez-vous directement.",
        };
    } else {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error)
        return {
          error: authErrorMessage(error),
          email,
          needsConfirmation: error.code === "email_not_confirmed",
        };
    }
  } catch {
    return {
      error:
        "Impossible de joindre Supabase. Vérifiez votre connexion et réessayez. Si le problème persiste, vérifiez l’URL Supabase dans Vercel.",
    };
  }
  // Keep redirects outside the catch: Next.js implements navigation by throwing.
  redirect("/dashboard");
}

async function authOrigin() {
  const requestHeaders = await headers();
  // Next.js validates the Origin of Server Actions before they execute.
  const origin =
    requestHeaders.get("origin") || process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) throw new Error("Missing application origin");
  const url = new URL(origin);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Invalid application origin");
  return url.origin;
}

export async function resendConfirmation(
  _previous: AuthState,
  form: FormData,
): Promise<AuthState> {
  if (!configured) return { error: "Supabase n’est pas configuré." };
  const email = z.string().trim().pipe(z.email()).safeParse(form.get("email"));
  if (!email.success) return { error: "Indiquez une adresse email valide." };
  try {
    const db = await supabase();
    const origin = await authOrigin();
    const { error } = await db.auth.resend({
      type: "signup",
      email: email.data,
      options: { emailRedirectTo: origin + "/auth/callback" },
    });
    if (error)
      return {
        error: authErrorMessage(error),
        cooldownUntil: error.status === 429 ? Date.now() + 60_000 : undefined,
      };
    return {
      message:
        "Si une inscription attend confirmation pour cette adresse, un nouvel email a été demandé. Vérifiez les indésirables et attendez quelques minutes.",
      cooldownUntil: Date.now() + 60_000,
    };
  } catch {
    return {
      error:
        "Impossible de demander un nouvel email. Vérifiez votre connexion puis réessayez.",
    };
  }
}
export async function logout() {
  const db = await supabase();
  await db.auth.signOut();
  redirect("/");
}
export async function saveInvitation(form: FormData) {
  if (!configured) return { error: "Supabase n’est pas configuré." };
  const db = await supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user)
    return { error: "Connectez-vous pour enregistrer votre invitation." };
  const raw = Object.fromEntries(form);
  const result = invitationSchema.safeParse({
    ...raw,
    published: raw.published === "on",
  });
  if (!result.success)
    return {
      error: result.error.issues[0]?.message || "Vérifiez les informations.",
    };
  const data = { ...result.data, deadline: result.data.deadline || null };
  const id = form.get("id");
  let query;
  if (id) {
    if (!z.uuid().safeParse(id).success)
      return { error: "Invitation invalide." };
    query = db
      .from("invitations")
      .update(data)
      .eq("id", id)
      .eq("owner_id", user.id)
      .select("id")
      .single();
  } else {
    query = db
      .from("invitations")
      .insert({ ...data, owner_id: user.id })
      .select("id")
      .single();
  }
  const { data: saved, error } = await query;
  if (error)
    return {
      error:
        "Enregistrement impossible. Vérifiez que la migration Supabase est installée.",
    };
  revalidatePath("/dashboard");
  redirect("/dashboard/" + saved.id);
}
export async function deleteInvitation(form: FormData) {
  const id = form.get("id");
  if (!z.uuid().safeParse(id).success) return;
  const db = await supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/connexion");
  const { error } = await db
    .from("invitations")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) throw new Error("Suppression impossible.");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
