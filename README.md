# Praapt

> Face recognition app with TypeScript monorepo: Express API, React frontend, Python face service.

**For LLMs:** Read `LLM_INSTRUCTIONS.md` for efficient navigation.

## Quick Start

**Prerequisites:** Node.js 22.18.0, npm 10.9.0+, Docker Desktop

```bash
# Clone and install
git clone git@github.com:makarandp0/praapt.git
cd praapt
npm install

# Start services (Postgres + Python face service)
docker compose up -d db face

# Setup database
npm run migrate

# Start app
npm run dev:all
```

**Open:** http://localhost:5173

That's it! The app is running with:

- Frontend: http://localhost:5173
- API: http://localhost:3000
- Face service: http://localhost:8000

## What It Does

Upload or capture images with names, then compare them using AI-powered face recognition (ArcFace embeddings via InsightFace).

## Development Commands

```bash
npm run dev:all   # Start API + frontend
npm run dev       # API only (:3000)
npm run dev:web   # Frontend only (:5173)

npm run migrate   # Run database migrations
npm run seed      # Add sample data (optional)

npm run verify    # Type-check, lint, and build

npx tsx apps/face-py/test-compare-all.ts  # Test: compare all images (requires face service)
```

## Docker Commands

```bash
npm run docker:up       # Start all services (db + face + api)
npm run docker:down     # Stop all services
npm run docker:logs     # View logs from all services
npm run docker:build    # Rebuild containers
npm run docker:restart  # Restart all services
```

## Production Deployment

Docker Compose is for **local development only**. In production, use managed services.

### Deploy to Railway (Recommended)

**📖 See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for complete deployment guide.**

**Quick overview:**

1. Install Railway CLI: `brew install railway` (or `npm i -g @railway/cli`)
2. Create Railway project from GitHub repo
3. Deploy Face Service:
   ```bash
   cd apps/face-py
   railway up
   railway domain  # Get public URL
   ```
4. Deploy API Service:
   ```bash
   cd ../..
   railway variables --service api --set NODE_ENV=production
   railway variables --service api --set FACE_SERVICE_URL=https://face-py-production.up.railway.app
   railway up --service api
   railway domain --service api
   ```
5. Your app is live! 🚀

**Important Notes:**

- Face service requires **2GB+ memory** (set in Railway Settings → Resources)
- Uses `buffalo_s` model in production (~500MB, optimized for memory)
- PostgreSQL is optional (DB code is commented out for now)
- First deployment takes ~2-3 minutes as models download

**Test production build locally:**

```bash
npm run prod:build  # Build everything
npm run prod:start  # Run at http://localhost:3000
```

Production serves frontend at `/` and API at `/api/*` from port 3000.

---

## Architecture

**Workspaces:**

- `apps/api` – Express + TypeScript + Knex + PostgreSQL
- `apps/web` – React + Vite + Tailwind
- `apps/face-py` – FastAPI + InsightFace + ONNX Runtime
- `packages/shared` – Shared TypeScript types

**API Endpoints:**

- `GET /api/health` – Health check (API + face service status)
- `POST /api/images` – Save image with name
- `GET /api/images` – List saved images
- `GET /api/images/:name` – Get specific image
- `POST /api/images/compare` – Compare two faces

**Face Recognition:**
Uses InsightFace model (default: `buffalo_l` for local dev, `buffalo_s` for production). Compares 512-dimensional embeddings with cosine similarity. Default threshold: 0.5.
