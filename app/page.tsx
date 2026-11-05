import Link from "next/link";
import { Header } from "@/components/header";
import { Catalog } from "@/components/catalog";
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">LES GRANDS MOMENTS COMMENCENT ICI</span>
            <h1>
              Une belle histoire.
              <br />
              Une invitation.
              <br />
              <i>Vos proches.</i>
            </h1>
            <p>
              Des faire-part numériques à votre image, pour les jours qui
              comptent. Créez, partagez, et laissez la joie vous rassembler.
            </p>
            <Link className="button" href="#modeles">
              Trouver mon faire-part <span>↗</span>
            </Link>
            <div className="hero-note">
              MARIAGE & BAR-MITSVA <span>·</span> PENSÉ POUR LE PARTAGE
            </div>
          </div>
          <div className="hero-art">
            <div className="paper-back" />
            <div className="hero-card theme-azure">
              <span className="eyebrow">CÉLÉBRONS ENSEMBLE LA</span>
              <span className="motif">✡</span>
              <span className="cerif">BAR MITZVAH</span>
              <small>DE</small>
              <span className="script">
                David
                <br />
                Michael
              </span>
              <span className="preview-line" />
              <p>
                DIMANCHE
                <br />
                19 SEPTEMBRE 2027
              </p>
              <Link href="/modeles/azure" className="outline">
                OUVRIR L’INVITATION
              </Link>
            </div>
            <span className="art-label">Un lien. Toute l’émotion.</span>
          </div>
        </section>
        <div className="ribbon">
          <span>01 · Choisissez un modèle</span>
          <span>02 · Racontez votre événement</span>
          <span>03 · Partagez votre lien</span>
          <span>04 · Retrouvez les réponses</span>
        </div>
        <Catalog />
        <section className="last-call">
          <span className="eyebrow">LA JOIE DE SE RETROUVER</span>
          <h2>
            Moins d’organisation.
            <br />
            <i>Plus de beaux moments.</i>
          </h2>
          <p>
            Un lien à envoyer sur WhatsApp ou par email.
            <br />
            Les confirmations réunies dans votre espace personnel.
          </p>
          <Link className="button" href="/dashboard/nouveau">
            Créer mon invitation ↗
          </Link>
        </section>
      </main>
      <footer>
        maison des invitations <span>Des liens qui rassemblent.</span>
      </footer>
    </>
  );
}
