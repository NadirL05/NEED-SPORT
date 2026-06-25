# Bonnes pratiques — Stack Next.js + Vercel + Stripe + Resend

Ce document résume les leçons apprises sur le projet NEEDFOOT.
À lire avant de démarrer un nouveau projet e-commerce avec cette stack.

---

## 1. Stack recommandée

| Besoin | Outil |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Base de données | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| Stockage fichiers | Vercel Blob |
| Paiement | Stripe Checkout Sessions |
| Emails transactionnels | Resend |
| Analytics | Vercel Analytics |
| Déploiement | Vercel |
| Gestionnaire de paquets | pnpm |

---

## 2. Base de données — Drizzle + Neon

### Ne jamais initialiser la connexion DB à l'import du module

```ts
// ❌ MAUVAIS — plante au build Vercel (DATABASE_URL pas disponible)
export const db = drizzle(neon(process.env.DATABASE_URL!), { schema })

// ✅ BON — connexion lazy via Proxy, créée seulement à la première requête
let _instance: Db | undefined
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    if (!_instance) {
      if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')
      _instance = drizzle(neon(process.env.DATABASE_URL), { schema })
    }
    return (_instance as any)[prop]
  },
})
```

### Pourquoi : Next.js évalue les modules au build pour l'analyse statique.
Si la DB s'initialise à l'import, le build échoue parce que `DATABASE_URL`
n'est pas injecté à ce moment-là (seulement au runtime).

---

## 3. Stripe — Paiement

### Toujours utiliser `product_data` inline, pas `product: stripeProductId`

```ts
// ❌ MAUVAIS — nécessite "Products: Read" sur la clé restreinte
{ price_data: { product: product.stripeProductId, unit_amount: 2499 } }

// ✅ BON — aucune permission supplémentaire requise
{ price_data: { product_data: { name: 'Maillot France Fan' }, unit_amount: 2499 } }
```

### Toujours entourer `sessions.create()` d'un try/catch

```ts
// ❌ MAUVAIS — une erreur Stripe renvoie une page HTML 500, le client
//              voit "erreur inconnue" sans aucune indication
const session = await stripe.checkout.sessions.create({ ... })

// ✅ BON — erreur JSON exploitable côté client
try {
  session = await stripe.checkout.sessions.create({ ... })
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  console.error('[checkout] Stripe error:', message)
  return NextResponse.json({ error: `Erreur Stripe : ${message}` }, { status: 500 })
}
```

### Calculer les prix côté serveur — ne jamais faire confiance au client

```ts
// ❌ MAUVAIS — le client envoie le prix
body: JSON.stringify({ price: 24.99 })

// ✅ BON — prix recalculé depuis la DB + options validées côté serveur
const unitAmount = unitPriceCents(product.priceEur, normalizeOptions(item.options), isVintage)
```

### Limite Stripe metadata : 500 caractères par valeur

```ts
const itemsMeta = JSON.stringify(payload.items)
const metadata = itemsMeta.length <= 500
  ? { items: itemsMeta }
  : { items: itemsMeta.slice(0, 497) + '…' }
```

---

## 4. Emails — Resend

### Vérifier le domaine expéditeur avant la mise en production

- L'adresse `onboarding@resend.dev` est un sandbox : les emails n'arrivent
  qu'au propriétaire du compte Resend. **Les clients ne reçoivent rien.**
- Vérifier le domaine dans Resend Dashboard → Domains avant le lancement.
- Utiliser `noreply@ton-domaine.fr` comme expéditeur.

### Configurer le webhook Stripe pour déclencher les emails

```
Stripe Dashboard → Webhooks → Ajouter endpoint
URL : https://ton-site.fr/api/webhooks/stripe
Événements : checkout.session.completed
```

Mettre `STRIPE_WEBHOOK_SECRET` dans les variables d'environnement Vercel.

---

## 5. Images — Cache et invalidation

### Problème : URL identique = cache navigateur stale

Quand on remplace un fichier blob avec la même URL (ex: `nations/fr.jpg`),
le navigateur et Next.js Image gardent l'ancienne version en cache.

**Solution : ajouter un paramètre de version basé sur la date d'upload**

```ts
// Dans la fonction qui liste les images Blob
const v = new Date(b.uploadedAt).getTime()
images[code] = `${b.url}?v=${v}`
```

### Appeler `revalidatePath()` après chaque modification admin

```ts
// Après upload d'image produit
revalidatePath('/')
revalidatePath('/shop')

// Après modification d'un produit
revalidatePath('/')
revalidatePath('/shop')
revalidatePath(`/products/${id}`)

// Après changement d'image hero/éditoriale
revalidatePath('/')
```

### Configurer `next.config.ts` pour autoriser les domaines d'images

```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    { protocol: 'https', hostname: 'images.unsplash.com' },
  ],
}
```

---

## 6. Architecture Next.js App Router

### `force-dynamic` vs `revalidate`

```ts
// Page rechargée à CHAQUE requête (données toujours fraîches, plus lent)
export const dynamic = 'force-dynamic'

// Page mise en cache, régénérée toutes les X secondes
export const revalidate = 60 // 1 minute
export const revalidate = 3600 // 1 heure
```

Règle pratique :
- Pages produit individuelles → `force-dynamic` (prix et stock peuvent changer)
- Page accueil → `revalidate = 300` (5 min, bon compromis perf/fraîcheur)
- Pages statiques (CGV, mentions légales) → pas de directive (SSG, ultra rapide)

### API routes admin — toujours valider l'authentification en premier

```ts
export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth  // 401 si pas connecté

  // Suite du traitement...
}
```

### Rate limiting sur les routes sensibles

```ts
// Sur le checkout, le login, les formulaires publics
const limited = await enforceRateLimit(`checkout:ip:${getClientIp(req)}`, 20, 300, 'Trop de tentatives.')
if (limited) return limited
```

---

## 7. Variables d'environnement Vercel

### Séparation runtime / build time

| Variable | Accessible au build | Accessible au runtime |
|---|---|---|
| `DATABASE_URL` | ❌ Ne pas exposer | ✅ Oui |
| `STRIPE_SECRET_KEY` | ❌ | ✅ |
| `NEXT_PUBLIC_URL` | ✅ Oui | ✅ |
| `NEXT_PUBLIC_*` | ✅ Inclus dans le bundle | ✅ |

**Règle** : ne jamais mettre de secrets dans `NEXT_PUBLIC_*` (visible côté client).

### Ajouter/modifier une variable Vercel via CLI

```bash
# Supprimer si elle existe déjà (sinon l'add échoue)
vercel env rm NOM_VARIABLE production --yes

# Ajouter
echo 'valeur' | vercel env add NOM_VARIABLE production

# Redéployer pour appliquer
vercel --prod
```

---

## 8. Zustand — State management panier

### Ne jamais changer le `name` du store persisté

```ts
// Ce nom est la clé localStorage. Le changer vide le panier de tous les utilisateurs.
persist(store, { name: 'needsport-cart' })
```

### Pattern addItem avec quantité

```ts
addItem(product, { size, options, playerName, playerNumber, quantity })
// quantity par défaut = 1 si non fourni
```

---

## 9. Vercel Analytics

### Intégration en une ligne dans le layout

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/next'

// Dans le <body>
<Analytics />
```

Données visibles dans Vercel Dashboard → Analytics.
Ne pas oublier d'installer : `pnpm add @vercel/analytics`

---

## 10. Checklist avant mise en ligne

- [ ] `DATABASE_URL` configuré dans Vercel (runtime seulement)
- [ ] `STRIPE_SECRET_KEY` configuré (clé live, pas test)
- [ ] `STRIPE_WEBHOOK_SECRET` configuré et webhook créé dans Stripe Dashboard
- [ ] `NEXT_PUBLIC_URL` = URL de production exacte (ex: `https://www.needfoot.fr`)
- [ ] `RESEND_API_KEY` configuré
- [ ] `EMAIL_FROM` = adresse sur domaine vérifié dans Resend (pas `@resend.dev`)
- [ ] `ADMIN_EMAIL` = email qui reçoit les alertes nouvelles commandes
- [ ] Domaine email vérifié dans Resend Dashboard → Domains
- [ ] Test de commande complet (du panier jusqu'à l'email de confirmation)
- [ ] Test du webhook Stripe (Stripe CLI ou commande test)
- [ ] Vercel Analytics installé (`@vercel/analytics`)

---

## 11. Pièges fréquents

| Symptôme | Cause probable | Fix |
|---|---|---|
| `DATABASE_URL is not set` au build | Connexion DB à l'import du module | Lazy init via Proxy |
| "Impossible de lancer le paiement" sans détail | Pas de try/catch sur `sessions.create()` | Ajouter try/catch + JSON error |
| Images admin pas visibles après upload | Même URL Blob = cache stale | `?v=timestamp` + `revalidatePath()` |
| Emails clients non reçus | Domaine expéditeur non vérifié dans Resend | Vérifier domaine + changer EMAIL_FROM |
| Paiement Stripe échoue avec clé restreinte | `product: stripeProductId` sans permission "Products: Read" | Utiliser `product_data` inline |
| Double prix affiché sur la page produit | Deux composants prix sans condition | Un seul prix dynamique, détail si qty > 1 |
| `npm i` échoue sur ce projet | Le projet utilise `pnpm` | Utiliser `pnpm add` |
