"use client";
import { useActionState, useEffect, useState } from "react";
import { authAction, resendConfirmation } from "@/app/actions";
import type { AuthState } from "@/lib/auth-messages";

function ConfirmationEmail({
  email,
  cooldownUntil = 0,
}: {
  email: string;
  cooldownUntil?: number;
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    resendConfirmation,
    {},
  );
  const [now, setNow] = useState(() => Date.now());
  const until = Math.max(cooldownUntil, state.cooldownUntil || 0);
  const seconds = Math.max(0, Math.ceil((until - now) / 1000));
  useEffect(() => {
    if (until <= Date.now()) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [until]);
  return (
    <section className="confirmation-help">
      <h2>Vous ne recevez pas l’email ?</h2>
      <p>
        Vérifiez les courriers indésirables de <strong>{email}</strong>. L’envoi
        peut prendre quelques minutes. Le lien doit être ouvert dans le
        navigateur utilisé pour cette inscription.
      </p>
      <form action={action}>
        <input type="hidden" name="email" value={email} />
        <button className="button secondary" disabled={pending || seconds > 0}>
          {pending
            ? "Envoi en cours…"
            : seconds > 0
              ? `Renvoyer dans ${seconds} s`
              : "Renvoyer l’email de confirmation"}
        </button>
        <p role="status" className="form-status">
          {state.error || state.message}
        </p>
      </form>
      <p className="muted">
        Si l’email n’arrive toujours pas, l’administrateur doit vérifier les
        journaux Supabase Authentication et la configuration du serveur d’envoi
        SMTP.
      </p>
    </section>
  );
}

function AuthFields({ signup }: { signup: boolean }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    authAction,
    {},
  );
  return (
    <>
      <form action={action}>
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
        <button className="button" disabled={pending}>
          {pending
            ? "Un instant…"
            : signup
              ? "Créer mon compte"
              : "Me connecter"}
        </button>
        <p role="status" className="form-status">
          {state.error || state.message}
        </p>
      </form>
      {state.needsConfirmation && state.email && (
        <ConfirmationEmail
          email={state.email}
          cooldownUntil={state.cooldownUntil}
        />
      )}
    </>
  );
}

export function AuthForm() {
  const [signup, setSignup] = useState(false);
  return (
    <>
      <AuthFields key={signup ? "signup" : "login"} signup={signup} />
      <button
        type="button"
        className="text-link"
        onClick={() => setSignup(!signup)}
      >
        {signup
          ? "Déjà un compte ? Se connecter"
          : "Première visite ? Créer un compte"}
      </button>
    </>
  );
}
