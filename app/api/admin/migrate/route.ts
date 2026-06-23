import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { requireAdminAuth } from '@/lib/api'

export async function POST() {
  const auth = await requireAdminAuth()
  if (auth !== true) return auth

  const sql = neon(process.env.DATABASE_URL!)

  await sql`
    CREATE TABLE IF NOT EXISTS promo_codes (
      id               TEXT PRIMARY KEY,
      code             TEXT NOT NULL UNIQUE,
      discount_pct     INTEGER NOT NULL,
      description      TEXT NOT NULL DEFAULT '',
      active           BOOLEAN NOT NULL DEFAULT TRUE,
      show_on_site     BOOLEAN NOT NULL DEFAULT FALSE,
      expires_at       TIMESTAMP,
      stripe_coupon_id TEXT,
      created_at       TIMESTAMP DEFAULT NOW()
    )
  `

  return NextResponse.json({ ok: true, message: 'Table promo_codes créée ou déjà existante.' })
}
