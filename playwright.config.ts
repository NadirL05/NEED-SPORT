import { defineConfig } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const port = 3102

// Load .env.debug for local dev E2E runs (not in CI where real env vars are injected).
// Next.js only auto-loads .env.local / .env / .env.development — .env.debug is a
// project-local file that carries the DB URL for local test runs.
const envDebug: Record<string, string> = {}
const debugPath = resolve(process.cwd(), '.env.debug')
if (!process.env.CI && existsSync(debugPath)) {
  for (const line of readFileSync(debugPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)="?([^"]*)"?$/)
    if (m) envDebug[m[1]] = m[2]
  }
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 1,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `pnpm exec next dev -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: envDebug,
  },
})
