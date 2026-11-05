"use client";
import { useState } from "react";
import { authAction } from "@/app/actions";
export function AuthForm() {
  const [signup, setSignup] = useState(false),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      action={async (data) => {
        setBusy(true);
        const result = await authAction(data);
        setStatus(result?.error || result?.message || "");
        setBusy(false);
      }}
    >
      <input type="hidden" name="mode" value={signup ? "signup" : "login"} />
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Mot de passe
        <input
          name="password"
          type="password"
          minLength={8}
          maxLength={128}
          autoComplete={signup ? "new-password" : "current-password"}
          required
        />
      </label>
      <button className="button" disabled={busy}>
        {busy ? "Un instant…" : signup ? "Créer mon compte" : "Me connecter"}
      </button>
      <p role="status" className="form-status">
        {status}
      </p>
      <button
        type="button"
        className="text-link"
        onClick={() => {
          setSignup(!signup);
          setStatus("");
        }}
      >
        {signup
          ? "Déjà un compte ? Se connecter"
          : "Première visite ? Créer un compte"}
      </button>
    </form>
  );
}
