import { Header } from "@/components/header";
import { AuthForm } from "@/components/auth-form";
import { configured } from "@/lib/config";
export default function Login() {
  return (
    <>
      <Header />
      <main className="auth-box">
        <span className="eyebrow">VOTRE ESPACE PERSONNEL</span>
        <h1>
          Heureux de
          <br />
          <i>vous retrouver.</i>
        </h1>
        <p>Vos invitations et toutes les réponses, au même endroit.</p>
        {configured ? (
          <AuthForm />
        ) : (
          <div className="notice">
            Supabase n’est pas encore connecté. Suivez le README pour renseigner
            les deux variables d’environnement et installer la base.
          </div>
        )}
      </main>
    </>
  );
}
