# Preuves TDD — expérience accueil et fiche produit

## Source et parcours

Les parcours et critères proviennent directement de la demande utilisateur du 23 juin 2026 ; aucun fichier de plan n'a été fourni.

- Depuis l'accueil, un client voit le slogan et la signature d'avis, bascule entre Clubs et Nations, suit un lien « Voir tout » cohérent et ouvre un produit via « Commander ».
- Sur une fiche produit, un client voit dans cet ordre : nom court, prix, une à quatre photos, options/taille, puis quatre caractéristiques.
- Le prix administré en base est la source du catalogue, du configurateur, du panier, des données structurées et du checkout serveur.
- Un administrateur ou employé ajoute, remplace, ordonne et valide une à quatre photos ; les pages concernées sont invalidées après sauvegarde.
- Les états des options visuelles sont annoncés aux technologies d'assistance.

## RED / GREEN

| Comportement | RED observé | GREEN observé | Garantie |
|---|---|---|---|
| Prix DB sur les cartes actives | Le test de contrat a échoué sur `components/ShopSection.tsx` car `product.priceEur` était absent et `FROM_PRICE_CENTS` encore utilisé. Le premier lancement comportait aussi un faux négatif de regex sur les espaces autour de « Commander », corrigé dans le test. | `npx tsx --test tests/storefront-contract.test.ts` : 4/4 PASS après correction de `/shop` et des collections. | Les trois surfaces actives de catalogue utilisent le prix du produit et non un tarif global. |
| États accessibles du configurateur | `npx tsx --test tests/storefront-contract.test.ts` : 4 PASS, 1 FAIL ; aucune occurrence `aria-pressed`. | Même commande : 5/5 PASS après ajout de `aria-pressed` aux neuf boutons d'options. | Version, type, flocage et emballage exposent leur état sélectionné. |
| Éditeur employé et invalidation | Suite complète observée à 16/17 PASS : `EmployeeProductForm.tsx` n'appliquait pas encore le contrat partagé ni les contrôles de remplacement. | Validation finale : 26/26 PASS. | Les interfaces admin et employé limitent à quatre photos, valident, remplacent et réordonnent ; les routes invalident les vitrines après mutation. |
| Seuil de couverture ECC | Mesure intermédiaire : fonctions 61,73 %, sous le seuil de 80 %. | `pnpm test:coverage` : lignes 96,06 %, branches 90,57 %, fonctions 89,02 %. | Les branches utiles des helpers de prix, images et SEO sont couvertes avec des assertions comportementales. |

## Spécification des tests

| Ce qui est garanti | Test / commande | Type | Résultat final |
|---|---|---|---|
| Prix administré et suppléments déterministes, normalisation des options, clés et libellés | `tests/pricing.test.ts` | Unité | PASS |
| Une à quatre images valides, ordre, doublons, payloads dangereux et cibles de revalidation | `tests/product-images.test.ts` | Unité | PASS |
| Prix, stock, images, organisation, site et fil d'Ariane dans les données structurées | `tests/seo.test.ts` | Unité | PASS |
| Accueil, CTA, switch, lien dynamique, ordre strict de la fiche, prix des cartes et états accessibles | `tests/storefront-contract.test.ts` | Contrat source | PASS |
| Contrat photos et revalidation sur le parcours employé | `tests/employee-product-editor.test.ts` | Contrat source | PASS |
| Compilation TypeScript | `npx tsc --noEmit` | Statique | PASS |
| Fichiers touchés | ESLint ciblé | Statique | PASS, 0 avertissement |
| Diff | `git diff --check` | Statique | PASS |

## Validation finale et limites

- `pnpm test` : 26 tests, 26 PASS, 0 échec.
- `pnpm test:coverage` : 96,06 % lignes, 90,57 % branches, 89,02 % fonctions.
- `pnpm lint` : 0 erreur, 5 avertissements préexistants hors périmètre dans des routes fournisseurs.
- `pnpm build` : compilation optimisée et TypeScript réussis ; échec ensuite pendant la collecte des pages car `DATABASE_URL` n'est pas configuré. Aucun fichier `.env` n'a été lu.
- Contrôle navigateur : le navigateur intégré n'était pas disponible. Le serveur local a démarré, mais `/` a retourné HTTP 500 pour la même absence de `DATABASE_URL`. La revue responsive/accessibilité repose donc sur le DOM, le CSS, ESLint et les contrats automatisés ; aucune validation visuelle en navigateur n'est revendiquée.
- Aucun commit, push ou lecture de secret n'a été effectué.
