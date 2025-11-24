# Praapt Monorepo

Agents: Read `AGENTS.md` first for efficient navigation and ignore rules. Canonical instructions live in `LLM_INSTRUCTIONS.md`.

TypeScript monorepo with Express API and React frontend. Uses Postgres database (via Docker) and modern Node ESM.

## Quick Setup

Prerequisites: Node.js 22.18.0, npm 10.9.0+, Docker Desktop

```bash
# 1) Clone and install
git clone git@github.com:makarandp0/praapt.git
cd praapt
npm install

# 2) Start infra (Postgres + Face service)
docker compose up -d db face

# 3) Configure env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# FACE_SERVICE_URL defaults to http://localhost:8000 (adjust to http://face:8000 if API runs in Docker)

# 4) Initialize database
npm run migrate
npm run seed  # Optional: sample data

# 5) Run app (API on 3000, Web on 5173)
npm run dev:all

# 6) Verify health
curl http://localhost:3000/health   # -> { ok: true, service: 'api', face: { ok: true, ... } }
curl http://localhost:8000/health   # -> { ok: true, ... }
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
curl http://localhost:3000/health  # API + Face service health summary
```

## Services (High-level)

- **Web (apps/web)**: React + Vite + Tailwind frontend. Provides Image Manager to capture/upload and compare images.
- **API (apps/api)**: Express + TypeScript backend. Stores named images, aggregates health, and proxies compare to the Face service (fallback to sha256 if unavailable).
- **Face Service (apps/face-py)**: FastAPI + InsightFace + ONNXRuntime (CPU). Detects faces and returns ArcFace embeddings; used by API for robust comparisons.
- **Database (Docker `db`)**: Postgres for app data.

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

- Copy `apps/web/.env.example` to `apps/web/.env` (already in Quick Setup).
- `VITE_API_URL` defaults to `http://localhost:3000`.
- Access at `http://localhost:5173` during development.

## Named Images API (Prototype)

- Directory: Backend stores images in `IMAGES_DIR` (env) or defaults to `./images` under the API CWD. Ensure the directory is writable.
- Endpoints:
  - `POST /images` – Body `{ name: string, image: string }` (image is data URL or base64). Saves as `<sanitized-name>.<ext>`.
  - `GET /images` – Returns `{ images: string[], files: string[] }` where `images` are filename stems.
  - `POST /images/compare` – Body `{ a: string, b: string }` compares two saved images. If the face service is available, uses face embeddings (ArcFace) and returns `{ same, distance, threshold, algo: 'face-arcface' }`. Otherwise falls back to `{ same, algo: 'sha256' }` by file equality.
- UI: `apps/web/src/components/ImageManager.tsx` offers capture/upload with name, lists images, and compares two chosen names.

## Face Service Notes

- Service path: `apps/face-py` (FastAPI). Docker Compose service name: `face` (port `8000`).
- Models are cached in the `face-models` volume; first run may take a minute to download.
- If the API runs in Docker, set `FACE_SERVICE_URL=http://face:8000` in `apps/api/.env`.

## Face Comparison Technical Details

Face comparison uses **InsightFace** with the `buffalo_l` model pack (RetinaFace for detection + ArcFace for embeddings). For each image, the largest face is detected and converted to a 512-dimensional normalized embedding vector via ArcFace. Distance is computed as **1 - cosine_similarity** between embeddings, where 0 means identical and values closer to 0 indicate similarity. The default threshold is **0.4**—distances below this are considered matches.
