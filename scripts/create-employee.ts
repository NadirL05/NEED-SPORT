/**
 * CLI to create an employee account.
 * Usage: npx tsx scripts/create-employee.ts <id> <email> <name> <password>
 * Example: npx tsx scripts/create-employee.ts emp-001 jean@needfoot.fr "Jean Dupont" monMotDePasse123
 */

import { existsSync } from 'fs'

// Load env before db imports (static imports would be hoisted past this)
if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local')
}

const [,, id, email, name, password] = process.argv

if (!id || !email || !name || !password) {
  console.error('Usage: npx tsx scripts/create-employee.ts <id> <email> <name> <password>')
  process.exit(1)
}

async function main() {
  const { db } = await import('../lib/db')
  const { employees } = await import('../lib/db/schema')
  const { hashPassword } = await import('../lib/supplier-auth')

  const passwordHash = await hashPassword(password)

  const [row] = await db.insert(employees).values({
    id,
    email: email.toLowerCase(),
    name,
    passwordHash,
    active: true,
  }).returning()

  console.log(`Employé créé : ${row.name} <${row.email}> (id: ${row.id})`)
  console.log(`Login : /employee/login`)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
