/**
 * Run: DATABASE_URL="..." npx tsx scripts/seed.ts
 * Seeds the DB with the initial product catalog.
 */
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../lib/db/schema'

const CATALOG: schema.NewProduct[] = [
  { id: 'psg-home-2026',      club: 'Paris Saint-Germain', name: 'Home 2026',     priceEur: 14990, cat: ['clubs'],            img: 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?auto=format&fit=crop&w=700&q=80' },
  { id: 'real-home-2026',     club: 'Real Madrid',         name: 'Home 2026',     priceEur: 15900, cat: ['clubs'],            img: 'https://images.unsplash.com/photo-1599050751795-6cdaafbc2319?auto=format&fit=crop&w=700&q=80' },
  { id: 'arg-copa-edit',      club: 'Argentine',           name: 'Copa Edit',     priceEur: 16900, cat: ['nations','limited'],img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=700&q=80' },
  { id: 'france-home-2026',   club: 'France',              name: 'Home 2026',     priceEur: 16900, cat: ['nations'],          img: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=700&q=80' },
  { id: 'mancity-third',      club: 'Manchester City',     name: 'Third Kit',     priceEur: 14400, cat: ['clubs'],            img: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=700&q=80' },
  { id: 'barca-away-2026',    club: 'FC Barcelona',        name: 'Away 2026',     priceEur: 15400, cat: ['clubs'],            img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=700&q=80' },
  { id: 'bresil-home-2026',   club: 'Brésil',              name: 'Home 2026',     priceEur: 15900, cat: ['nations'],          img: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=700&q=80' },
  { id: 'italie-heritage',    club: 'Italie',              name: 'Heritage 90',   priceEur: 18900, cat: ['limited','vintage'],img: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?auto=format&fit=crop&w=700&q=80' },
  { id: 'arsenal-home-2026',  club: 'Arsenal',             name: 'Home 2026',     priceEur: 14400, cat: ['clubs'],            img: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=700&q=80' },
  { id: 'allemagne-away-2026',club: 'Allemagne',           name: 'Away 2026',     priceEur: 15900, cat: ['nations'],          img: 'https://images.unsplash.com/photo-1571745544682-143ea663cf2c?auto=format&fit=crop&w=700&q=80' },
  { id: 'inter-limited-black',club: 'Inter Milan',         name: 'Limited Black', priceEur: 17900, cat: ['clubs','limited'],  img: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=700&q=80' },
  { id: 'maroc-home-2026',    club: 'Maroc',               name: 'Home 2026',     priceEur: 14400, cat: ['nations'],          img: 'https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?auto=format&fit=crop&w=700&q=80' },
]

async function seed() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')

  const sql = neon(url)
  const db  = drizzle(sql, { schema })

  console.log('Seeding products…')
  await db.insert(schema.products).values(CATALOG).onConflictDoNothing()
  console.log(`✓ ${CATALOG.length} products inserted (skipped existing)`)
}

seed().catch((e) => { console.error(e); process.exit(1) })
