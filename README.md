# Praapt Monorepo

Agents: Read `AGENTS.md` first for efficient navigation and ignore rules. Canonical instructions live in `LLM_INSTRUCTIONS.md`.

TypeScript monorepo with an Express API and a Postgres database (via Docker) using Knex. Uses modern Node ESM (NodeNext) across the repo.

## Prerequisites
- Node.js >= 18.17
- npm >= 9 (or pnpm/yarn if you prefer)
- Docker Desktop (for Postgres)

## Getting Started
1. Start Postgres:
   - `docker compose up -d`
2. Install dependencies:
   - `npm install`
3. Configure environment variables:
   - Copy `.env.example` to `apps/api/.env` and update as needed.
4. Run database migrations (ESM via ts-node loader):
   - `npm run migrate`
5. Start the API in dev mode:
   - `npm run dev`

API listens on `http://localhost:3000` by default.

## Workspaces
- `apps/api` – Express API (TypeScript + Knex)
- `apps/web` – React + Vite + Tailwind (shadcn-style UI)

## Useful Commands
- `npm run dev` – Start API in watch mode (tsx)
- `npm run dev:web` – Start frontend at `http://localhost:5173`
- `npm run build` – Build the API
- `npm run start` – Start built API
- `npm run migrate` – Apply latest DB migrations
- `npm run rollback` – Rollback last migration batch
- `npm run seed` – Run TypeScript seeds
- `npm run typecheck` – Type-check the code (no emit)
- `npm run lint` / `lint:fix` – ESLint checks and fixes
- `npm run format` / `format:check` – Prettier formatting

## Docker
- Build image: `docker build -t praapt-api ./apps/api`
- Run container: `docker run --env-file ./apps/api/.env -p 3000:3000 praapt-api`

## Frontend
- Configure `.env` in `apps/web` (copy `.env.example`).
- API URL is read from `VITE_API_URL` (defaults to `http://localhost:3000`).
- Start dev server: `npm run dev:web` then open `http://localhost:5173`.
