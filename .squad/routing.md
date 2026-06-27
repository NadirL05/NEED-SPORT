# Work Routing

How to decide who handles what.

## Routing Table

| Work Type | Route To | Examples |
|-----------|----------|----------|
| Architecture, décisions techniques, arbitrage | Danny 🏗️ | Structure features, trade-offs, revue avant merge |
| UI, composants, pages Next.js, styles | Rusty ⚛️ | ProductCard, ShopSection, pages App Router, Tailwind |
| APIs, DB, Stripe, webhooks, auth, emails | Linus 🔧 | Route handlers, Drizzle queries, checkout, promo codes |
| Tests, qualité, edge cases, couverture | Basher 🧪 | Vitest unitaires, Playwright E2E, régression |
| Vercel, CI/CD, env vars, migrations, monitoring | Livingston ⚙️ | pnpm db:push, env vars, builds, déploiements |
| Code review | Danny 🏗️ | Review PRs, qualité architecturale, cohérence |
| Scope & priorities | Danny 🏗️ | What to build next, backlog, trade-offs |
| Session logging | Scribe 📋 | Automatic — never needs routing |
| RAI review | Rai 🛡️ | Credentials, contenu, biais, sécurité |

## Issue Routing

| Label | Action | Who |
|-------|--------|-----|
| `squad` | Triage: analyze issue, assign `squad:{member}` label | Danny (Lead) |
| `squad:danny` | Architecture, revue, décisions | Danny |
| `squad:rusty` | Frontend, UI, composants | Rusty |
| `squad:linus` | Backend, API, DB, Stripe | Linus |
| `squad:basher` | Tests, qualité | Basher |
| `squad:livingston` | DevOps, infra, env | Livingston |

### How Issue Assignment Works

1. When a GitHub issue gets the `squad` label, **Danny** triages it — analyzing content, assigning the right `squad:{member}` label, and commenting with triage notes.
2. When a `squad:{member}` label is applied, that member picks up the issue in their next session.
3. Members can reassign by removing their label and adding another member's label.
4. The `squad` label is the "inbox" — untriaged issues waiting for Danny's review.

## Rules

1. **Eager by default** — spawn all agents who could usefully start work, including anticipatory downstream work.
2. **Scribe always runs** after substantial work, always as `mode: "background"`. Never blocks.
3. **Quick facts → coordinator answers directly.** Don't spawn an agent for "what port does the server run on?"
4. **When two agents could handle it**, pick the one whose domain is the primary concern.
5. **"Team, ..." → fan-out.** Spawn all relevant agents in parallel as `mode: "background"`.
6. **Anticipate downstream work.** If a feature is being built, spawn Basher to write test cases from requirements simultaneously.
7. **Issue-labeled work** — when a `squad:{member}` label is applied to an issue, route to that member. Danny handles all `squad` (base label) triage.
