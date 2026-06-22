/**
 * Assigne des produits à un fournisseur pour qu'ils apparaissent dans son
 * espace commandes (/supplier/orders). À lancer une fois pour relier le
 * catalogue existant à un fournisseur.
 *
 * Usage:
 *   npx tsx scripts/assign-supplier.ts <emailOuId>          # produits sans fournisseur
 *   npx tsx scripts/assign-supplier.ts <emailOuId> --all    # tous les produits
 */
import { db } from '../lib/db'
import { products, suppliers } from '../lib/db/schema'
import { eq, isNull } from 'drizzle-orm'

async function main() {
  const arg = process.argv[2]
  const all = process.argv.includes('--all')

  if (!arg) {
    console.error('Usage: npx tsx scripts/assign-supplier.ts <emailOuId> [--all]')
    process.exit(1)
  }

  const found =
    (await db.select().from(suppliers).where(eq(suppliers.id, arg)))[0] ??
    (await db.select().from(suppliers).where(eq(suppliers.email, arg)))[0]

  if (!found) {
    console.error(`✗ Aucun fournisseur trouvé pour « ${arg} ».`)
    process.exit(1)
  }

  const updated = all
    ? await db.update(products).set({ supplierId: found.id }).returning({ id: products.id })
    : await db
        .update(products)
        .set({ supplierId: found.id })
        .where(isNull(products.supplierId))
        .returning({ id: products.id })

  console.log(`✓ ${updated.length} produit(s) assigné(s) à ${found.companyName} (${found.email}).`)
  console.log(all ? '  → tous les produits' : '  → uniquement les produits sans fournisseur')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
