Purpose

This guide helps an LLM work efficiently in this repo without parsing the entire codebase. It outlines where to look first, which paths to prioritize, and what to ignore unless explicitly relevant.

Repository Map (high signal first)

1. README.md: Project overview, commands, and workflows.
2. package.json (root): Workspace scripts and tooling entry points.
3. apps/api (Express API)
   - src/index.ts: API server entry.
   - src/routes/\*.ts: Route handlers (auth, images, health).
   - src/db.ts: Database connection via Drizzle/PG.
   - src/schema.ts: Drizzle schema definitions.
   - drizzle/: SQL migrations.
4. apps/web (React + Vite)
   - src/main.tsx | src/main.js: Frontend bootstrap.
   - src/App.tsx | src/App.js: Primary app component with routing.
   - src/pages/: Page components (Login, Signup, Library).
   - src/contexts/: React contexts (AuthContext).
   - src/components/_, src/lib/_: UI and helpers.
   - index.css, tailwind config: Styling.
5. packages/shared (Shared Types)
   - src/index.ts: Zod schemas and TypeScript types shared between API and web.
   - **Always use these shared types for API request/response contracts.**
6. docker-compose.yml: Local Postgres.
7. scripts/\*.mjs: Repo scripts (e.g., verification).

Paths To Prioritize

- packages/shared/src/index.ts (shared Zod schemas - check first for API contracts)
- apps/api/src/\*_/_.ts
- apps/api/drizzle/\*.sql
- apps/web/src/\*_/_.{ts,tsx,js,jsx,css}
- README.md, package.json, apps/\*/package.json, docker-compose.yml

Paths To Avoid (unless directly needed)

- node_modules/\*\*
- apps/\*/dist/**, dist/**, build/**, coverage/**
- .git/**, .github/**
- .cache/**, .turbo/**, .next/**, .output/**
- _.log, _.pid, \*.lock (lockfiles), .DS_Store
- .env, .env.\* (use `.env.example` for reference instead)

Working Rules For The LLM

1. Start Small
   - Read README.md and root/package.json to understand scripts and topology.
   - Open only the minimal entry points (listed above) related to the task.

2. Search, Then Open
   - Use text search to locate relevant symbols/strings before opening files.
   - Suggested commands (non-destructive):
     - ripgrep: `rg -n "<term>" apps/**/src`
     - git grep: `git grep -n "<term>" -- apps`

3. Expand By Dependency
   - After finding the relevant file, selectively open directly-related imports/exports.
   - Avoid scanning entire folders; follow the call/import chain.

4. Prefer Source Over Artifacts
   - Never read build outputs in dist/, coverage reports, or minified bundles.
   - Use TypeScript/JS source under src/.

5. Keep Changes Surgical
   - Make the smallest viable edits consistent with existing style.
   - Do not refactor unrelated code or rename files unless requested.
   - Update or add minimal docs only when necessary for the task.

6. Validate With Existing Scripts
   - Use `npm run typecheck`, `npm run lint`, and relevant workspace scripts.
   - After making any code changes, run `npm run lint` from the repo root and fix all reported issues. Use `npm run lint:fix` for autofixes, then resolve any remaining problems manually.
   - For DB work, consult drizzle/ migrations and src/schema.ts; do not alter them unless the task requires.

7. Use Shared Types (packages/shared)
   - All API request/response types MUST be defined as Zod schemas in `packages/shared/src/index.ts`.
   - Import types from `@praapt/shared` in both API routes and web pages.
   - After adding new schemas, run `npm run build --workspace=@praapt/shared` to compile.
   - Example: `SignupBodySchema`, `LoginResponseSchema`, `UserSchema`.

8. Environment & Secrets
   - Do not read or rely on real `.env` files; use `.env.example` for keys/shape.

Task-Focused Entry Points (quick checklist)

- API route/behavior issue: apps/api/src/routes/\*.ts, apps/api/src/index.ts
- DB schema/seed change: apps/api/src/schema.ts, apps/api/drizzle/\*.sql
- Frontend UI/state change: apps/web/src/App.tsx, apps/web/src/pages/_.tsx, apps/web/src/contexts/_.tsx
- API contracts/types: packages/shared/src/index.ts (Zod schemas)
- Project setup/scripts: README.md, root/package.json, apps/_/package.json, scripts/_.mjs

If In Doubt

- Ask for the minimal file list needed for context.
- Summarize assumptions and confirm before opening more files.
