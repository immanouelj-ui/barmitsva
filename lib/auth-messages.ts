export type AuthState = {
  error?: string;
  message?: string;
  email?: string;
  needsConfirmation?: boolean;
  cooldownUntil?: number;
};

export function authErrorMessage(error: {
  code?: string;
  status?: number;
  message?: string;
}): string {
  const messages: Record<string, string> = {
    email_address_not_authorized:
      "L’envoi de confirmation est limité par Supabase aux emails de votre équipe. Configurez un serveur SMTP dans Supabase → Authentication → Email → SMTP Settings pour ouvrir les inscriptions aux clients.",
    over_email_send_rate_limit:
      "La limite d’envoi des emails Supabase est atteinte. Réessayez plus tard. L’organisateur du site doit configurer un serveur SMTP pour augmenter cette limite.",
    over_request_rate_limit:
      "Trop de tentatives. Patientez quelques minutes avant de réessayer.",
    over_email_send_rate_limit_exceeded:
      "Trop d’emails ont été demandés. Patientez avant de réessayer.",
    email_not_confirmed:
      "Votre email n’est pas encore confirmé. Ouvrez le lien reçu par email ou demandez un nouvel envoi ci-dessous.",
    signup_disabled:
      "La création de compte est désactivée dans ce projet Supabase. Activez les nouvelles inscriptions dans Authentication → Sign In / Providers.",
    email_provider_disabled:
      "La connexion par email est désactivée dans Supabase. Activez le fournisseur Email dans Authentication → Sign In / Providers.",
    email_address_invalid:
      "Cette adresse email n’est pas acceptée. Utilisez une adresse email réelle.",
    weak_password:
      "Le mot de passe ne respecte pas les règles de sécurité de ce projet Supabase. Choisissez un mot de passe plus long avec des lettres, des chiffres et des symboles.",
    invalid_credentials: "Email ou mot de passe incorrect.",
    user_already_exists:
      "Ce compte existe peut-être déjà. Essayez de vous connecter ou de renvoyer l’email de confirmation.",
    captcha_failed:
      "Supabase exige une vérification anti-robot que ce formulaire ne prend pas encore en charge. Contactez l’administrateur du site.",
    unexpected_failure:
      "Supabase n’a pas pu traiter la demande. L’administrateur doit vérifier les journaux Authentication et la configuration SMTP.",
  };
  if (error.code && messages[error.code]) return messages[error.code];
  if (/invalid api key|invalid jwt|no api key/i.test(error.message || ""))
    return "La clé API Supabase configurée sur Vercel est invalide. Vérifiez les variables d’environnement puis redéployez le site.";
  if (error.status === 429)
    return "Trop de tentatives ou limite d’envoi atteinte. Réessayez plus tard.";
  return "La demande a échoué. Réessayez dans un instant. Si le problème persiste, l’administrateur doit consulter les journaux Supabase Authentication.";
}
