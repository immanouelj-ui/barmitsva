# Maison des Invitations

Application Next.js / TypeScript de faire-part numériques pour mariages et bar-mitsva. Prévue pour Vercel et Supabase, sans abonnement technique à un service de génération de cartes.

## Fonctionnalités incluses

- Catalogue de quatre modèles et aperçu interactif : Éclat d’azur, Sous l’olivier, Promesse, Minuit doré.
- Inscription et connexion des organisateurs par email et mot de passe (Supabase Auth).
- Création, modification, publication, passage en brouillon et suppression d’invitations.
- Personnalisation du modèle, prénoms, parents, texte, date, cérémonie, réception et date limite de réponse.
- Un lien aléatoire unique par événement `/i/<uuid>`, à partager avec ses invités.
- Réponses des invités sans compte : présence, nombre de personnes et message.
- Modification d’une réponse depuis le même navigateur grâce à un jeton local. Les doublons ne sont pas fusionnés entre appareils.
- Dashboard privé par organisateur, compteurs, recherche, filtre, actualisation et export CSV.
- Règles RLS : aucun accès public direct aux tables. Seules deux fonctions PostgreSQL contrôlées sont accessibles aux invités.
- Prévention des réponses invalides, limite de 20 personnes par réponse, fermeture après échéance, limitation des écritures.

## Installation locale

Node.js 22 ou plus récent.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Le catalogue et les aperçus fonctionnent sans Supabase. La connexion, les invitations enregistrées et les réponses nécessitent sa configuration.

## Connecter Supabase

1. Créer un projet Supabase.
2. Ouvrir **SQL Editor**, copier et exécuter **tout** le fichier `supabase/migrations/001_initial.sql` une seule fois. Variante CLI : lier le projet puis `supabase db push`.
3. Dans **Connect** ou **Settings → API**, récupérer l’URL du projet et sa clé **publishable** (`sb_publishable_…`, ou l’ancienne clé `anon`). Ne jamais utiliser une clé secrète / `service_role` dans une variable `NEXT_PUBLIC_*`.
4. Dans `.env.local` (puis dans Vercel), renseigner :

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE-PROJET.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=VOTRE_CLE_PUBLIQUE
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

5. Dans **Authentication → URL Configuration**, définir **Site URL** sur l’URL Vercel finale et ajouter `http://localhost:3000` pour le développement. Ajouter également `https://VOTRE-DOMAINE/auth/callback` et `http://localhost:3000/auth/callback` aux **Redirect URLs**. Le flux utilise la confirmation email Supabase standard (`{{ .ConfirmationURL }}` dans le modèle d’email) puis un échange PKCE via `/auth/callback`. Ouvrir le lien depuis le navigateur utilisé pour l’inscription.
6. Conserver la confirmation email activée. Configurer un SMTP de production dans Supabase avant d’ouvrir les inscriptions à des clients (les envois email intégrés sont limités).
7. Créer un compte dans `/connexion`, confirmer l’email, puis se connecter.

`NEXT_PUBLIC_SITE_URL` documente l’URL du déploiement et sert à la configuration Supabase ; les liens partagés sont construits à partir de l’origine réellement ouverte dans le navigateur.

## Déployer sur Vercel

1. Importer ce dépôt GitHub dans Vercel, framework **Next.js**, dossier racine `./`.
2. Ajouter les trois variables ci-dessus aux environnements voulus. En production, utiliser l’URL Vercel pour `NEXT_PUBLIC_SITE_URL`.
3. Conserver les commandes automatiques (`npm ci`, `npm run build`) et Node.js 22 ou 24.
4. Déployer puis configurer la Site URL Supabase. Redéployer après tout changement de variable `NEXT_PUBLIC_*`.
5. Test complet : inscription → connexion → choix modèle → création → cocher « Publier » → copier le lien → ouvrir en navigation privée → envoyer une réponse → actualiser le dashboard → exporter le CSV.

Ne pas activer GitHub Pages pour cette application : les fonctions serveur Next.js nécessitent Vercel ou un hébergement Node.js.

## Architecture

- `app/` : App Router Next.js, Server Actions, routes de réponse et export.
- `components/` : catalogue, cartes, formulaires, éditeur et dashboard.
- `lib/supabase/server.ts` et `proxy.ts` : sessions SSR avec cookies et vérification des utilisateurs côté serveur.
- `lib/validation.ts` : validation Zod et protection CSV contre les formules.
- `supabase/migrations/001_initial.sql` : tables, droits, RLS et fonctions publiques limitées.
- `tests/` : validation et tests PostgreSQL embarqués avec PGlite, y compris isolement entre deux organisateurs.
- `public/fonts/`, `public/images/` : polices locales et décors d’aquarelle ; aucune photo d’enfant préchargée.

Les anciennes pages statiques du dépôt (`legacy/index.html`, `legacy/dashboard.html`) restent conservées à titre de référence. Elles ne sont pas servies par Next.js et leurs données d’exemple ne sont pas importées.

## Vérifications

```bash
npm run typecheck
npm test
npm run build
```

La GitHub Action CI exécute ces trois commandes sans nécessiter de secrets Supabase. Les tests de base créent un PostgreSQL temporaire en mémoire ; ils ne touchent aucune donnée réelle.

## Périmètre de cette version

Il s’agit d’une première version fonctionnelle. Pas de paiement, d’éditeur de modèles pour administrateur, de gestion d’invités nominative, d’envoi automatique de messages, de suivi d’ouverture, de dépôt de photos ni de synchronisation en temps réel. Les liens sont uniques par **événement**, pas par invité. Les confirmations se mettent à jour via le bouton « Actualiser ».

Le formulaire public possède des protections de base (validation, piège à robots, limite SQL : 50 réponses modifiées par minute et 5 000 réponses par événement, délai de 10 secondes entre modifications du même jeton). Une protection anti-bot / rate limiting à l’entrée doit être ajoutée avant une ouverture commerciale importante. Toute personne possédant le lien peut répondre et les réponses ne sont pas une vérification d’identité.

Les organisateurs peuvent supprimer une invitation et toutes ses réponses depuis leur espace. Prévoir vos mentions légales, politique de confidentialité, règles de conservation des données et assistance client avant une commercialisation.

## Dépanner la création de compte

Le message « Demande d’inscription reçue » signifie qu’aucune session n’est ouverte tant que l’email n’est pas confirmé. Il ne garantit pas la livraison : Supabase masque aussi volontairement certains cas d’adresses déjà inscrites.

1. Vérifier les indésirables et, si le compte a déjà été confirmé, essayer **Se connecter**.
2. Le bouton **Renvoyer l’email de confirmation** apparaît après une inscription ou une connexion refusée pour email non confirmé. Un délai de 60 secondes évite les renvois immédiats.
3. Dans Supabase **Authentication → Users**, vérifier si l’utilisateur existe et si son email est confirmé. Consulter **Authentication → Logs** pour les erreurs d’envoi.
4. Le service email intégré Supabase est réservé aux tests : il n’envoie qu’aux adresses des membres de l’organisation, avec une limite de 2 emails par heure. Pour les inscriptions clients, configurer un fournisseur SMTP dans les paramètres d’email Supabase. La migration SQL n’installe pas de serveur d’envoi d’emails.
5. Vérifier la **Site URL**, les **Redirect URLs** et le modèle d’email, puis redéployer Vercel si les variables d’environnement changent.

Documentation officielle : https://supabase.com/docs/guides/auth/auth-smtp et https://supabase.com/docs/guides/auth/testing-auth-flows
