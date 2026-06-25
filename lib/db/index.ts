import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

type Db = ReturnType<typeof drizzle<typeof schema>>

let _instance: Db | undefined

function getInstance(): Db {
  if (!_instance) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')
    _instance = drizzle(neon(process.env.DATABASE_URL), { schema })
  }
  return _instance
}

// Proxy so all existing `db.select()`, `db.insert()` etc. callers keep working
// without changes, but the actual connection is created only on first use
// (i.e. at request time, never at build time).
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    return (getInstance() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
