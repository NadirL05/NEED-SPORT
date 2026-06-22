# Audit de sécurité — NEEDFOOT / need-sport

**Date :** 2026-06-19
**Périmètre :** `need-sport/` (Next.js 16 App Router, Drizzle ORM + Neon, Stripe, Vercel Blob, Resend)
**Commit :** `068067c` (main)
**Méthode :** analyse statique du code, configuration, dépendances et historique git
**Référence :** complète et met à jour `docs/security-audit-2026-06-17.md`

> **✅ Mise à jour 2026-06-19 — correctifs appliqués.** Les deux findings **CRITIQUES** et trois findings **ÉLEVÉS** (H1, H2, H3) ont été corrigés :
> - **C1 + H3** — `lib/employee-auth.ts` : suppression du secret codé en dur (échec fermé si `EMPLOYEE_SESSION_SECRET` absent / < 32 car.) et ajout d'un `expiresAt` signé et vérifié dans le jeton.
> - **C2** — `proxy.ts` protège désormais les pages `/admin/*` (redirection vers `/admin/login`, sauf la page de login) ; garde de défense en profondeur `requireAdminPage()` (`lib/admin-page-guard.ts`) ajouté en tête des 7 Server Components admin.
> - **H1** — limiteur de débit backed-Postgres (`lib/rate-limit.ts`, table `rate_limits`) appliqué aux logins admin/fournisseur/employé, à l'inscription fournisseur et au checkout (réponse `429` + `Retry-After`). Validé par test (RFC + bascule à la limite).
> - **H2** — login admin renforcé : mot de passe **fort** (remplace `needsport2026`) + **2FA TOTP** optionnel (`lib/totp.ts`, activé dès que `ADMIN_TOTP_SECRET` est défini ; enrôlement via `npm run admin:2fa`). Bonus : cookie de logout admin conserve `httpOnly`/`secure`.
> - Secrets de session (`ADMIN_/SUPPLIER_/EMPLOYEE_SESSION_SECRET`) générés et renseignés dans `.env.local`, documentés dans `.env.example`.
> - **M1/M5** — uploads durcis (`lib/upload.ts`) : allowlist MIME + limite 10 Mo + extension dérivée du MIME + nom aléatoire (`crypto.randomUUID`), côté admin **et** employé.
> - **M4** — `requireSupplierAuth` reverifie le statut en base : un compte **suspendu** est bloqué en live (plus seulement au login).
> - **M3** — `getSupplierOrders` minimise la PII : suppression de l'email client et de l'ID de session Stripe, total propre au fournisseur (au lieu du total global).
> - **M7** — valeurs dynamiques (nom/adresse/email client) échappées dans les emails HTML (`lib/email.ts`).
> - **M2** — CSP durcie (`object-src 'none'`, `base-uri 'self'`, `form-action 'self'`). `script-src 'unsafe-inline'` **conservé** : les pages publiques sont prérendues statiquement (une CSP nonce/`strict-dynamic` imposerait un rendu 100 % dynamique). Risque résiduel faible : aucun script inline applicatif, pas de `dangerouslySetInnerHTML`, CMS échappé par React.
> - **M6** — `npm audit` : 6 modérées **dev/build uniquement** (esbuild via drizzle-kit, postcss via next) ; `audit fix --force` downgrade Next (cassant) → écarté. `overrides postcss>=8.5.10` ajouté (s'applique au prochain `install`) ; surveiller drizzle-kit upstream pour esbuild.
>
> **Score réévalué : ~85/100.** Restent quelques findings **FAIBLES** (flags cookie de logout fournisseur/employé, validation Zod côté employé, secret webhook au cold-start, double lockfile npm/pnpm).
> **À faire en prod (Vercel) :** définir les `*_SESSION_SECRET`, un `ADMIN_SECRET` fort, et `ADMIN_TOTP_SECRET` ; appliquer le schéma (`npm run db:push` ou table `rate_limits` déjà créée) ; lancer `install` pour activer l'override postcss.

---

## 1. Résumé exécutif

| Métrique | Valeur |
|---|---|
| **Score de risque** | **55 / 100** (100 = sûr) |
| **Niveau global** | **ÉLEVÉ** |
| Findings actuels | 2 CRITIQUES · 3 ÉLEVÉS · 7 MOYENS · 6 FAIBLES |
| Évolution depuis le 2026-06-17 | Forte amélioration (18 → 55) |

L'audit précédent (44 findings, score 18/100) a déclenché une remédiation **substantielle** : les routes `/api/admin/*` sont désormais authentifiées (proxy + `requireAdminAuth` + Zod), le secret HMAC fournisseur ne tombe plus sur une valeur codée en dur, les sessions admin/fournisseur sont séparées et expirent, l'IDOR fournisseur est corrigé, les en-têtes de sécurité et la CSP sont en place, les prix sont calculés côté serveur, le webhook Stripe vérifie la signature.

**Mais** le sous-système « employé » ajouté ensuite a réintroduit deux failles de la même classe que celles corrigées, et le contrôle d'accès des **pages** `/admin/*` (par opposition aux **API** `/api/admin/*`) a été oublié. Deux problèmes critiques subsistent donc :

1. **Secret de session employé codé en dur** (`employee-dev-secret-change-in-production`) → forge possible de jetons employé → prise de contrôle de l'espace employé (gestion complète du catalogue).
2. **Pages `/admin/*` non protégées** → le tableau de bord `/admin` affiche, sans authentification, le **chiffre d'affaires** et les **emails clients** des dernières commandes (fuite de données personnelles / RGPD).

S'ajoute l'**absence totale de limitation de débit** sur l'authentification, combinée à un **mot de passe admin faible** (`needsport2026`), qui rend une prise de contrôle admin réaliste par force brute.

---

## 2. Findings CRITIQUES

### C1 — Secret de session employé codé en dur (forge de jetons)
**Fichier :** `lib/employee-auth.ts:18`
```ts
function getSecret(): string {
  return process.env.EMPLOYEE_SESSION_SECRET ?? 'employee-dev-secret-change-in-production'
}
```
**Impact :** si `EMPLOYEE_SESSION_SECRET` n'est pas défini en production (il est absent de `.env.local`), le secret de signature devient une **constante publique présente dans le code source**. N'importe qui peut alors calculer `HMAC('employee-dev-secret-change-in-production', employeeId)` et forger un cookie `employee_session` valide, sans mot de passe. Accès complet à `/employee/*` et `/api/employee/*` : lister, **créer, modifier, supprimer (soft-delete)** des produits du catalogue, et **uploader des fichiers** vers le Blob public. C'est la régression exacte de l'ancien finding C2/H7, corrigé côté fournisseur mais réintroduit côté employé.
**Correctif :** supprimer le fallback, à l'image de `supplier-auth.ts` / `admin-auth.ts` :
```ts
function getSecret(): string {
  const s = process.env.EMPLOYEE_SESSION_SECRET
  if (!s || s.length < 32) throw new Error('EMPLOYEE_SESSION_SECRET requis (≥ 32 caractères)')
  return s
}
```
Générer `openssl rand -hex 32` et le définir dans les variables d'environnement Vercel.

### C2 — Contrôle d'accès cassé sur les pages `/admin/*` (fuite PII + CA)
**Fichiers :** `proxy.ts:39-41`, `app/admin/page.tsx`, `app/admin/products/page.tsx`, `app/admin/pages/page.tsx`, `app/admin/nations/page.tsx`, `app/admin/products/[id]/page.tsx`, `app/admin/pages/[id]/page.tsx`, `app/admin/products/new/page.tsx`, `app/admin/pages/new/page.tsx`, `app/admin/employees/new/page.tsx`
**Cause :** le proxy (middleware Next 16) ne couvre que les API :
```ts
export const config = { matcher: ['/supplier/:path*', '/api/admin/:path*'] }
```
Les **pages** `/admin/*` ne sont donc protégées par aucun garde central, et seule `app/admin/employees/page.tsx` réimplémente un contrôle d'auth. Le tableau de bord `app/admin/page.tsx` est un Server Component `force-dynamic` qui interroge directement la base et **rend en HTML** :
```tsx
const [orders] = await Promise.all([ getOrders(), ... ])
// ... CA total ...
{recentOrders.map(o => <td>{o.customerEmail ?? '—'}</td> ...)}
```
**Impact :** un visiteur anonyme atteignant `https://<site>/admin` voit le **chiffre d'affaires total**, le nombre de commandes et les **8 dernières commandes avec l'email client**, le montant, le statut et la date → fuite de données personnelles (RGPD) et d'informations commerciales. Les autres pages exposent le catalogue interne, le stock, le lien fournisseur et les pages CMS en brouillon. *(Les routes `/api/admin/*` sont, elles, bien protégées : les pages clientes qui passent par l'API ne fuitent pas — le problème vient des pages rendues côté serveur.)*
**Correctif (au choix, idéalement les deux) :**
- Étendre le matcher du proxy : `matcher: ['/supplier/:path*', '/admin/:path*', '/api/admin/:path*']` et y vérifier le cookie `admin_session` (en redirigeant les pages vers `/admin/login`, sauf `/admin/login`).
- Et/ou ajouter un garde d'auth dans `app/admin/layout.tsx` (vérifier `verifyAdminSessionToken` puis `redirect('/admin/login')`), pour ne pas dépendre uniquement du middleware (défense en profondeur, cf. CVE-2025-29927).

---

## 3. Findings ÉLEVÉS

### H1 — Aucune limitation de débit / anti-brute-force sur l'authentification
**Fichiers :** `app/api/admin/login/route.ts`, `app/api/supplier/auth/login/route.ts`, `app/api/employee/auth/login/route.ts`, `app/api/supplier/auth/register/route.ts`, `app/api/checkout/route.ts`
**Impact :** aucun compteur de tentatives, verrouillage, délai ni CAPTCHA. Brute-force/credential-stuffing à pleine vitesse serverless ; inscription fournisseur et création de session Stripe spammables (épuisement du pool DB / quota Stripe). Combiné à H2, prise de contrôle admin réaliste.
**Correctif :** `@upstash/ratelimit` (sliding window) clé IP + email, ex. 5 essais/15 min sur login admin, 10/15 min/email + 30/min/IP sur login fournisseur, 3/h/IP sur l'inscription, 10/min/IP sur le checkout. Répondre `429` + `Retry-After`, journaliser les échecs.

### H2 — Mot de passe admin faible et devinable
**Fichier :** `.env.local` → `ADMIN_SECRET=needsport2026`
**Impact :** secret unique, mono-facteur, basé sur la marque + l'année — trivialement devinable. Sans limitation de débit (H1), il est brute-forçable. Vérifier que la valeur en production (Vercel) n'est pas celle-ci.
**Correctif :** secret aléatoire long (`openssl rand -base64 24`) stocké uniquement dans Vercel ; idéalement passer à un vrai compte admin + 2FA (TOTP).

### H3 — Les jetons de session employé n'expirent jamais
**Fichier :** `lib/employee-auth.ts:24-31`
**Impact :** le payload signé ne contient que l'`employeeId` (aucun `expiresAt` vérifié côté serveur). Un jeton volé (log, XSS, interception) — ou forgé via C1 — reste valide indéfiniment, sans mécanisme de révocation. Régression du finding H3 (corrigé pour admin et fournisseur, qui embarquent un `expiresAt`).
**Correctif :** inclure un `expiresAt` dans le payload signé et le vérifier dans `verifyEmployeeToken`, comme `supplier-auth.ts`.

---

## 4. Findings MOYENS

| # | Titre | Fichier(s) | Note / Correctif |
|---|---|---|---|
| M1 | Upload employé sans validation de type ni de taille | `app/api/employee/upload/route.ts` | Contrairement à `admin/upload` (allowlist MIME + 10 Mo), aucune restriction. Upload de SVG/HTML (hébergement de contenu, phishing) ou de gros fichiers (coût/DoS) vers le Blob public. Aligner sur l'allowlist MIME + limite de taille de l'upload admin. |
| M2 | CSP autorise `'unsafe-inline'` pour les scripts en production | `next.config.ts:9` | `script-src 'self' 'unsafe-inline'` neutralise une grande partie de la protection XSS de la CSP. Migrer vers des nonces/hash par requête. |
| M3 | PII client largement partagée avec les fournisseurs | `lib/db/queries.ts:111-144` | `getSupplierOrders` renvoie la commande entière (email, nom, adresse, `totalEur` incluant les articles d'autres fournisseurs) dès qu'un article appartient au fournisseur. Minimiser : ne renvoyer que les champs nécessaires à l'expédition. |
| M4 | Statut fournisseur vérifié seulement au login | `app/api/supplier/auth/login/route.ts:22` | Un fournisseur `pending` obtient une session 30 j ; une suspension postérieure n'est pas appliquée avant expiration. Revérifier le statut à chaque requête authentifiée et bloquer `pending`. |
| M5 | Nom/extension de fichier d'upload contrôlés par l'attaquant + chemin prévisible | `app/api/admin/upload/route.ts:24-28`, `app/api/employee/upload/route.ts:17-20` | `file.name.split('.').pop()` non assaini, `products/${Date.now()}.${ext}` avec `addRandomSuffix:false` → injection de chemin/extension, collisions/écrasement devinables. Générer l'extension depuis le type MIME validé et activer `addRandomSuffix`. |
| M6 | Dépendances vulnérables (`npm audit` : 6 modérées) | `drizzle-kit`→`esbuild`, `next`→`postcss` | esbuild ≤0.24.2 (SSRF/lecture fichier du serveur de dev) et postcss <8.5.10 (XSS via `</style>`). Impact surtout en dev/build. Mettre à jour `next`/`drizzle-kit` quand possible. |
| M7 | Injection HTML dans les emails | `lib/email.ts:33-41,65+` | Données de commande/client (issues de Stripe, partiellement contrôlables par le client : nom, adresse) interpolées dans des templates HTML par concaténation. Risque de phishing dans les emails admin/transporteur. Échapper les valeurs dynamiques. |

---

## 5. Findings FAIBLES / hygiène

| # | Titre | Fichier(s) | Note |
|---|---|---|---|
| L1 | Identifiant DB de production + secret admin en clair sur disque | `.env.local` | **Jamais commité, absent de l'historique git, non fuité ailleurs** (vérifié ✓). Néanmoins : l'URL Neon (pooler, prod) et `ADMIN_SECRET` faible sont en clair localement. Recommandé : faire tourner le mot de passe DB par hygiène et ne garder les secrets que dans Vercel. |
| L2 | Cookies de logout sans `httpOnly`/`secure` | `app/api/admin/login/route.ts:36`, `supplier/auth/login`, `employee/auth/login` | Les handlers `DELETE` effacent le cookie sans répéter les flags (cosmétique). |
| L3 | Pas de validation Zod sur produits employé (POST/PUT) | `app/api/employee/products/route.ts`, `.../[id]/route.ts` | Cast `as {…}` sans validation runtime (mais authentifié). Aligner sur le schéma Zod admin. |
| L4 | Secret webhook manquant → 500 à la requête (pas au démarrage) | `app/api/webhooks/stripe/route.ts:30` | Stripe réessaie indéfiniment. Valider au cold-start. |
| L5 | `projectId`/`orgId` Vercel exposés | `.vercel/project.json` | Faible valeur, mais à exclure des artefacts publics. |
| L6 | Pas de contrôle de stock avant création de session Stripe | `app/api/checkout/route.ts` | Survente possible (intégrité, non sécurité). Vérifier `product.stock >= quantity`. |

---

## 6. Points confirmés SÛRS (bonnes pratiques en place)

- **Pas d'injection SQL** : toutes les requêtes passent par Drizzle (paramétré : `eq`, `inArray`, `and`).
- **Pas de XSS stocké** : le contenu CMS `{page.content}` est échappé par React (aucun `dangerouslySetInnerHTML` dans le code).
- **Prix calculés côté serveur** au checkout (`getProductsByIds`) — aucune falsification de prix possible.
- **Webhook Stripe** : signature vérifiée (`constructEvent`) + idempotence (`getOrderBySession` + `onConflictDoNothing`).
- **IDOR fournisseur corrigé** : `updateSupplierProductStock` filtre atomiquement sur `supplierId` ; `requireSupplierAuth` lit le cookie (pas d'en-tête `x-supplier-id` spoofable).
- **Mots de passe** : PBKDF2-SHA256 100k itérations + comparaison à temps constant (`verifyPassword`, login admin).
- **En-têtes de sécurité** présents : CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS `preload`.
- **`STRIPE_SECRET_KEY`** non préfixé `NEXT_PUBLIC_` → non embarqué côté client.
- **Secrets jamais commités** dans git (vérifié sur tout l'historique).

---

## 7. Plan d'action prioritaire

1. **Supprimer le fallback du secret employé** (C1) — 15 min. Définir `EMPLOYEE_SESSION_SECRET` + ajouter un `expiresAt` au jeton (H3).
2. **Protéger les pages `/admin/*`** (C2) — étendre le matcher du proxy à `/admin/:path*` **et** ajouter un garde dans `app/admin/layout.tsx`.
3. **Ajouter la limitation de débit** (H1) sur login admin/fournisseur/employé, inscription et checkout ; remplacer le mot de passe admin faible (H2) par un secret aléatoire + 2FA.
4. **Durcir l'upload employé** (M1/M5) et **renforcer la CSP** (M2, retirer `'unsafe-inline'`).
5. **Hygiène secrets** (L1) : rotation de l'identifiant DB, secrets uniquement dans Vercel.

---

## Annexe — Définition des niveaux

| Niveau | Signification |
|---|---|
| CRITIQUE | Exploitable sans authentification ; perte/exposition de données, prise de contrôle, fraude |
| ÉLEVÉ | Exploitable à faible effort ou en contexte authentifié ; exposition significative |
| MOYEN | Conditions spécifiques requises ; augmente la surface d'attaque |
| FAIBLE | Théorique ou faible impact ; défense en profondeur |
