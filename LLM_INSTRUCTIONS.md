Purpose

This guide helps an LLM work efficiently in this repo without parsing the entire codebase. It outlines where to look first, which paths to prioritize, and what to ignore unless explicitly relevant.

Repository Map (high signal first)

1) README.md: Project overview, commands, and workflows.
2) package.json (root): Workspace scripts and tooling entry points.
3) apps/api (Express API)
   - src/index.ts: API server entry.
   - src/db.ts: Database connection via Knex/PG.
   - migrations/*, seeds/*: DB schema and sample data (TypeScript).
   - knexfile.ts, tsconfig.json: Build/runtime config.
4) apps/web (React + Vite)
   - src/main.tsx | src/main.js: Frontend bootstrap.
   - src/App.tsx | src/App.js: Primary app component.
   - src/components/*, src/lib/*: UI and helpers.
   - index.css, tailwind config: Styling.
5) docker-compose.yml: Local Postgres.
6) scripts/*.mjs: Repo scripts (e.g., verification).

Paths To Prioritize

- apps/api/src/**/*.ts
- apps/api/migrations/**/*.ts
- apps/api/seeds/**/*.ts
- apps/web/src/**/*.{ts,tsx,js,jsx,css}
- README.md, package.json, apps/*/package.json, docker-compose.yml

Paths To Avoid (unless directly needed)

- node_modules/**
- apps/*/dist/**, dist/**, build/**, coverage/**
- .git/**, .github/**
- .cache/**, .turbo/**, .next/**, .output/**
- *.log, *.pid, *.lock (lockfiles), .DS_Store
- .env, .env.* (use `.env.example` for reference instead)

Working Rules For The LLM

1) Start Small
   - Read README.md and root/package.json to understand scripts and topology.
   - Open only the minimal entry points (listed above) related to the task.

2) Search, Then Open
   - Use text search to locate relevant symbols/strings before opening files.
   - Suggested commands (non-destructive):
     - ripgrep: `rg -n "<term>" apps/**/src`
     - git grep: `git grep -n "<term>" -- apps`

3) Expand By Dependency
   - After finding the relevant file, selectively open directly-related imports/exports.
   - Avoid scanning entire folders; follow the call/import chain.

4) Prefer Source Over Artifacts
   - Never read build outputs in dist/, coverage reports, or minified bundles.
   - Use TypeScript/JS source under src/.

5) Keep Changes Surgical
   - Make the smallest viable edits consistent with existing style.
   - Do not refactor unrelated code or rename files unless requested.
   - Update or add minimal docs only when necessary for the task.

6) Validate With Existing Scripts
   - Use `npm run typecheck`, `npm run lint`, and relevant workspace scripts.
   - For DB work, consult migrations and seeds; do not alter them unless the task requires.

7) Environment & Secrets
   - Do not read or rely on real `.env` files; use `.env.example` for keys/shape.

Task-Focused Entry Points (quick checklist)

- API route/behavior issue: apps/api/src/index.ts (+ files it imports), apps/api/src/db.ts
- DB schema/seed change: apps/api/migrations/*, apps/api/seeds/*, knexfile.ts
- Frontend UI/state change: apps/web/src/App.(ts|js)x, apps/web/src/main.(ts|js)x, components/, lib/
- Project setup/scripts: README.md, root/package.json, apps/*/package.json, scripts/*.mjs

If In Doubt

- Ask for the minimal file list needed for context.
- Summarize assumptions and confirm before opening more files.

