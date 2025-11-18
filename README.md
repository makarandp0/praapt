# Praapt Monorepo

Agents: Read `AGENTS.md` first for efficient navigation and ignore rules. Canonical instructions live in `LLM_INSTRUCTIONS.md`.

TypeScript monorepo with Express API and React frontend. Uses Postgres database (via Docker) and modern Node ESM.

## Quick Setup

**Prerequisites:** Node.js 22.18.0, npm 10.9.0+, Docker Desktop

```bash
# 1. Clone and install
git clone git@github.com:makarandp0/praapt.git
cd praapt
npm install

# 2. Start database
docker compose up -d

# 3. Configure environment
cp .env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Initialize database
npm run migrate
npm run seed  # Optional: sample data

# 5. Start development
npm run dev:all  # Both API and Web
```

## Development

```bash
npm run dev:all   # Start both API (3000) and Web (5173)
npm run dev       # API only
npm run dev:web   # Web only
```

**How `dev:all` works:**

- If API port 3000 is busy, assumes API is already running
- If Web port 5173 is busy, starts Vite on next available port
- Automatically sets `VITE_API_URL` for frontend to point to API

## Verification

```bash
npm run verify  # Type-check, lint, and build
curl http://localhost:3000/health  # Should return 200 OK
```

## Architecture

- **Database**: Postgres runs in Docker (`docker compose up -d`)
- **API**: Express + TypeScript, runs locally with Node.js (`npm run dev`)
- **Web**: React + Vite + Tailwind, runs locally (`npm run dev:web`)
- **Production**: API can be containerized for deployment

## Workspaces

- `apps/api` – Express API (TypeScript + Knex + Postgres)
- `apps/web` – React + Vite + Tailwind (shadcn-style UI)

## Commands

**Database:**

- `npm run migrate` – Apply latest DB migrations
- `npm run rollback` – Rollback last migration batch
- `npm run seed` – Run TypeScript seeds

**Development:**

- `npm run typecheck` – Type-check without emit
- `npm run lint` / `lint:fix` – ESLint
- `npm run format` / `format:check` – Prettier

**Build & Deploy:**

- `npm run build` – Build both API and Web
- `npm run start` – Start built API
- `npm run docker:build` – Build API Docker image for production
- `npm run docker:run` – Run API in Docker container

## Production Deployment

The API can be containerized for production:

```bash
npm run docker:build  # Build image
npm run docker:run    # Run container
# Or manually: docker run --env-file ./apps/api/.env.docker -p 3000:3000 praapt-api
```

## Frontend Setup

- Copy `apps/web/.env.example` to `apps/web/.env`
- `VITE_API_URL` defaults to `http://localhost:3000`
- Access at `http://localhost:5173` during development

## Image Capture Prototype

- UI lives in `apps/web/src/components/FaceCapture.tsx` and is rendered in `apps/web/src/App.tsx`.
- API endpoint: `POST /face/capture` accepts a JSON body `{ image: string }` where `image` is a base64 data URL (e.g. from `canvas.toDataURL('image/jpeg')`).
- Saved uploads are written under `apps/api/.tmp/uploads/` for inspection.

Quick test:

```bash
npm run dev:all          # Start API (3000) and Web (5173)
# Visit the web app, allow camera, click Capture then Send to Backend
# Check API logs and the saved file under apps/api/.tmp/uploads
```
