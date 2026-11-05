import Link from "next/link";
export default function NotFound() {
  return (
    <main className="auth-box">
      <span className="eyebrow">INVITATION INTROUVABLE</span>
      <h1>Ce lien n’est pas disponible.</h1>
      <p>
        L’invitation est peut-être encore en brouillon. Vérifiez le lien auprès
        des organisateurs.
      </p>
      <Link className="button" href="/">
        Retour à l’accueil
      </Link>
    </main>
  );
}
