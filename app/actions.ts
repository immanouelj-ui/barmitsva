"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabase } from "@/lib/supabase/server";
import { configured } from "@/lib/config";
import { invitationSchema } from "@/lib/validation";
export async function authAction(form: FormData) {
  if (!configured) return { error: "Supabase n’est pas configuré." };
  const data = z
    .object({
      email: z.email(),
      password: z.string().min(8).max(128),
      mode: z.enum(["signup", "login"]),
    })
    .safeParse(Object.fromEntries(form));
  if (!data.success)
    return {
      error:
        "Vérifiez votre email et votre mot de passe (8 caractères minimum).",
    };
  const db = await supabase();
  const { email, password, mode } = data.data;
  if (mode === "signup") {
    const { data, error } = await db.auth.signUp({ email, password });
    if (error)
      return {
        error: "Inscription impossible. Réessayez ou utilisez un autre email.",
      };
    if (!data.session)
      return {
        message:
          "Vérifiez votre boîte email et confirmez votre compte, puis connectez-vous.",
      };
  } else {
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error)
      return {
        error: "Email ou mot de passe incorrect, ou compte non confirmé.",
      };
  }
  redirect("/dashboard");
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
