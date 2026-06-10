/**
 * Run: DATABASE_URL="..." npx tsx scripts/seed.ts
 * Seeds the DB with the full product catalog (~60 products).
 */
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../lib/db/schema'

// Rotating temp images — real photos provided by Ghaith later
const IMGS = [
  'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1599050751795-6cdaafbc2319?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1571745544682-143ea663cf2c?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=700&q=80',
]
const img = (i: number) => IMGS[i % IMGS.length]

const CATALOG: schema.NewProduct[] = [
  // ── CLUBS ──────────────────────────────────────────────────────────────────
  { id: 'psg-home-2026',        club: 'Paris Saint-Germain', name: 'Home 2026',       priceEur: 14990, cat: ['clubs'],             img: img(0)  },
  { id: 'psg-away-2026',        club: 'Paris Saint-Germain', name: 'Away 2026',       priceEur: 14990, cat: ['clubs'],             img: img(1)  },
  { id: 'psg-third-2026',       club: 'Paris Saint-Germain', name: 'Third 2026',      priceEur: 14990, cat: ['clubs'],             img: img(2)  },
  { id: 'real-home-2026',       club: 'Real Madrid',         name: 'Home 2026',       priceEur: 15900, cat: ['clubs'],             img: img(3)  },
  { id: 'real-away-2026',       club: 'Real Madrid',         name: 'Away 2026',       priceEur: 15900, cat: ['clubs'],             img: img(4)  },
  { id: 'real-third-2026',      club: 'Real Madrid',         name: 'Third 2026',      priceEur: 15900, cat: ['clubs'],             img: img(5)  },
  { id: 'mancity-home-2026',    club: 'Manchester City',     name: 'Home 2026',       priceEur: 14400, cat: ['clubs'],             img: img(6)  },
  { id: 'mancity-away-2026',    club: 'Manchester City',     name: 'Away 2026',       priceEur: 14400, cat: ['clubs'],             img: img(7)  },
  { id: 'mancity-third',        club: 'Manchester City',     name: 'Third Kit',       priceEur: 14400, cat: ['clubs'],             img: img(8)  },
  { id: 'barca-home-2026',      club: 'FC Barcelona',        name: 'Home 2026',       priceEur: 15400, cat: ['clubs'],             img: img(9)  },
  { id: 'barca-away-2026',      club: 'FC Barcelona',        name: 'Away 2026',       priceEur: 15400, cat: ['clubs'],             img: img(10) },
  { id: 'arsenal-home-2026',    club: 'Arsenal',             name: 'Home 2026',       priceEur: 14400, cat: ['clubs'],             img: img(11) },
  { id: 'arsenal-away-2026',    club: 'Arsenal',             name: 'Away 2026',       priceEur: 14400, cat: ['clubs'],             img: img(12) },
  { id: 'inter-limited-black',  club: 'Inter Milan',         name: 'Limited Black',   priceEur: 17900, cat: ['clubs', 'limited'],  img: img(13) },
  { id: 'inter-home-2026',      club: 'Inter Milan',         name: 'Home 2026',       priceEur: 14900, cat: ['clubs'],             img: img(14) },
  { id: 'bayern-home-2026',     club: 'Bayern Munich',       name: 'Home 2026',       priceEur: 14900, cat: ['clubs'],             img: img(0)  },
  { id: 'bayern-away-2026',     club: 'Bayern Munich',       name: 'Away 2026',       priceEur: 14900, cat: ['clubs'],             img: img(1)  },
  { id: 'juventus-home-2026',   club: 'Juventus',            name: 'Home 2026',       priceEur: 14400, cat: ['clubs'],             img: img(2)  },
  { id: 'juventus-away-2026',   club: 'Juventus',            name: 'Away 2026',       priceEur: 14400, cat: ['clubs'],             img: img(3)  },
  { id: 'liverpool-home-2026',  club: 'Liverpool',           name: 'Home 2026',       priceEur: 14900, cat: ['clubs'],             img: img(4)  },
  { id: 'liverpool-away-2026',  club: 'Liverpool',           name: 'Away 2026',       priceEur: 14900, cat: ['clubs'],             img: img(5)  },
  { id: 'chelsea-home-2026',    club: 'Chelsea',             name: 'Home 2026',       priceEur: 14400, cat: ['clubs'],             img: img(6)  },
  { id: 'manutd-home-2026',     club: 'Manchester United',   name: 'Home 2026',       priceEur: 14900, cat: ['clubs'],             img: img(7)  },
  { id: 'dortmund-home-2026',   club: 'Borussia Dortmund',   name: 'Home 2026',       priceEur: 13900, cat: ['clubs'],             img: img(8)  },
  { id: 'acmilan-home-2026',    club: 'AC Milan',            name: 'Home 2026',       priceEur: 14900, cat: ['clubs'],             img: img(9)  },
  { id: 'atletico-home-2026',   club: 'Atlético Madrid',     name: 'Home 2026',       priceEur: 14400, cat: ['clubs'],             img: img(10) },
  { id: 'napoli-home-2026',     club: 'Napoli',              name: 'Home 2026',       priceEur: 13900, cat: ['clubs'],             img: img(11) },
  { id: 'ajax-home-2026',       club: 'Ajax',                name: 'Home 2026',       priceEur: 12900, cat: ['clubs'],             img: img(12) },
  { id: 'roma-home-2026',       club: 'AS Roma',             name: 'Home 2026',       priceEur: 13400, cat: ['clubs'],             img: img(13) },
  { id: 'spurs-home-2026',      club: 'Tottenham Hotspur',   name: 'Home 2026',       priceEur: 14400, cat: ['clubs'],             img: img(14) },

  // ── NATIONS ────────────────────────────────────────────────────────────────
  { id: 'france-home-2026',     club: 'France',              name: 'Home 2026',       priceEur: 16900, cat: ['nations'],            img: img(0)  },
  { id: 'france-away-2026',     club: 'France',              name: 'Away 2026',       priceEur: 16900, cat: ['nations'],            img: img(1)  },
  { id: 'arg-home-2026',        club: 'Argentine',           name: 'Home 2026',       priceEur: 16400, cat: ['nations'],            img: img(2)  },
  { id: 'arg-copa-edit',        club: 'Argentine',           name: 'Copa Edit',       priceEur: 16900, cat: ['nations', 'limited'], img: img(3)  },
  { id: 'bresil-home-2026',     club: 'Brésil',              name: 'Home 2026',       priceEur: 15900, cat: ['nations'],            img: img(4)  },
  { id: 'bresil-away-2026',     club: 'Brésil',              name: 'Away 2026',       priceEur: 15900, cat: ['nations'],            img: img(5)  },
  { id: 'allemagne-home-2026',  club: 'Allemagne',           name: 'Home 2026',       priceEur: 15900, cat: ['nations'],            img: img(6)  },
  { id: 'allemagne-away-2026',  club: 'Allemagne',           name: 'Away 2026',       priceEur: 15900, cat: ['nations'],            img: img(7)  },
  { id: 'espagne-home-2026',    club: 'Espagne',             name: 'Home 2026',       priceEur: 15400, cat: ['nations'],            img: img(8)  },
  { id: 'espagne-away-2026',    club: 'Espagne',             name: 'Away 2026',       priceEur: 15400, cat: ['nations'],            img: img(9)  },
  { id: 'italie-home-2026',     club: 'Italie',              name: 'Home 2026',       priceEur: 15400, cat: ['nations'],            img: img(10) },
  { id: 'italie-heritage',      club: 'Italie',              name: 'Heritage 90',     priceEur: 18900, cat: ['limited', 'vintage'], img: img(11) },
  { id: 'portugal-home-2026',   club: 'Portugal',            name: 'Home 2026',       priceEur: 15400, cat: ['nations'],            img: img(12) },
  { id: 'portugal-away-2026',   club: 'Portugal',            name: 'Away 2026',       priceEur: 15400, cat: ['nations'],            img: img(13) },
  { id: 'angleterre-home-2026', club: 'Angleterre',          name: 'Home 2026',       priceEur: 16400, cat: ['nations'],            img: img(14) },
  { id: 'pays-bas-home-2026',   club: 'Pays-Bas',            name: 'Home 2026',       priceEur: 14900, cat: ['nations'],            img: img(0)  },
  { id: 'belgique-home-2026',   club: 'Belgique',            name: 'Home 2026',       priceEur: 14900, cat: ['nations'],            img: img(1)  },
  { id: 'maroc-home-2026',      club: 'Maroc',               name: 'Home 2026',       priceEur: 14400, cat: ['nations'],            img: img(2)  },
  { id: 'japon-home-2026',      club: 'Japon',               name: 'Home 2026',       priceEur: 14400, cat: ['nations'],            img: img(3)  },
  { id: 'mexique-home-2026',    club: 'Mexique',             name: 'Home 2026',       priceEur: 13900, cat: ['nations'],            img: img(4)  },
  { id: 'usa-home-2026',        club: 'USA',                 name: 'Home 2026',       priceEur: 14400, cat: ['nations'],            img: img(5)  },
  { id: 'croatie-home-2026',    club: 'Croatie',             name: 'Home 2026',       priceEur: 13900, cat: ['nations'],            img: img(6)  },
  { id: 'senegal-home-2026',    club: 'Sénégal',             name: 'Home 2026',       priceEur: 13400, cat: ['nations'],            img: img(7)  },
  { id: 'colombie-home-2026',   club: 'Colombie',            name: 'Home 2026',       priceEur: 13900, cat: ['nations'],            img: img(8)  },
  { id: 'uruguay-home-2026',    club: 'Uruguay',             name: 'Home 2026',       priceEur: 13400, cat: ['nations'],            img: img(9)  },
  { id: 'pologne-home-2026',    club: 'Pologne',             name: 'Home 2026',       priceEur: 13400, cat: ['nations'],            img: img(10) },
  { id: 'danemark-home-2026',   club: 'Danemark',            name: 'Home 2026',       priceEur: 13400, cat: ['nations'],            img: img(11) },
  { id: 'coree-home-2026',      club: 'Corée du Sud',        name: 'Home 2026',       priceEur: 13900, cat: ['nations'],            img: img(12) },
  { id: 'nigeria-home-2026',    club: 'Nigeria',             name: 'Home 2026',       priceEur: 13400, cat: ['nations'],            img: img(13) },
  { id: 'algerie-home-2026',    club: 'Algérie',             name: 'Home 2026',       priceEur: 13400, cat: ['nations'],            img: img(14) },
]

async function seed() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')

  const sql = neon(url)
  const db  = drizzle(sql, { schema })

  console.log(`Seeding ${CATALOG.length} products…`)
  await db.insert(schema.products).values(CATALOG).onConflictDoNothing()
  console.log(`✓ Done — existing products skipped, new ones inserted`)
}

seed().catch((e) => { console.error(e); process.exit(1) })
