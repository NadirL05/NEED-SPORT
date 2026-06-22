import type { Config } from 'drizzle-kit'
import { existsSync } from 'fs'

// Load .env.local for drizzle-kit (which doesn't use Next.js env loading)
if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local')
}

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
