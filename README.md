# Praapt

> Face recognition app with TypeScript monorepo: Express API, React frontend, Python face service.

**For LLMs:** Read `AGENTS.md` for efficient navigation.

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
npm run db:push -w @praapt/api

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
npm run dev:all   # Start API + frontend (Local Dev)
npm run ci        # Run full CI suite (Build, Test, Lint, Typecheck, Verify)
npm start         # Run production build (requires npm run build first)
```

## Database Commands (Drizzle ORM)

The project uses **Drizzle ORM** for typesafe database access. Schema is defined in `apps/api/src/schema.ts`.

```bash
# Run all migrations (schema + custom)
npm run migrate

# Rollback last custom migration
npm run rollback

# Development - apply schema changes directly (no migration files)
npm run db:push -w @praapt/api

# Generate SQL migration file from schema changes
npm run db:generate -w @praapt/api

# Open Drizzle Studio (visual database browser)
npm run db:studio -w @praapt/api
```

### Reset Local Database

To completely reset your local database (removes all data):

```bash
# Stop containers and remove volumes
docker compose down -v

# Start fresh database
docker compose up -d db

# Run migrations
npm run migrate
```

### Schema Changes Workflow

1. **Edit schema:** Modify `apps/api/src/schema.ts`
2. **Development:** Run `npm run db:push -w @praapt/api` to apply changes directly
3. **Production:** Run `npm run db:generate -w @praapt/api` to create a migration file

### Custom Migrations (with TypeScript code)

For migrations that need code logic (data transformations, seeding, etc.), create a file in `apps/api/src/migrations/`:

```typescript
// apps/api/src/migrations/001_seed_admin_user.ts
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../schema.js';

type DB = PostgresJsDatabase<typeof schema>;

export async function up(db: DB): Promise<void> {
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, 'admin@example.com'));
  if (existing.length === 0) {
    await db.insert(schema.users).values({ email: 'admin@example.com', name: 'Admin' });
  }
}

export async function down(db: DB): Promise<void> {
  await db.delete(schema.users).where(eq(schema.users.email, 'admin@example.com'));
}
```

Custom migrations:

- Are stored in `apps/api/src/migrations/` (one file per migration)
- Must export `up(db)` and `down(db)` functions
- Use numeric prefix for ordering (e.g., `001_`, `002_`)
- Run automatically after schema migrations via `npm run migrate`
- Are tracked in `custom_migrations` table (won't run twice)
- Can be rolled back with `npm run rollback`

### Typesafe Queries

```typescript
import { db, users, User, NewUser } from './db.js';
import { eq } from 'drizzle-orm';

// SELECT - returns User[]
const allUsers = await db.select().from(users);

// SELECT with WHERE
const user = await db.select().from(users).where(eq(users.email, 'alice@example.com'));

// INSERT with type checking
const newUser: NewUser = { email: 'dave@example.com', name: 'Dave' };
await db.insert(users).values(newUser).returning();

// UPDATE
await db.update(users).set({ name: 'Alice Smith' }).where(eq(users.id, 1));

// DELETE
await db.delete(users).where(eq(users.id, 1));
```

## Docker Commands

```bash
npm run docker:up       # Build (if needed) & Start all services
npm run docker:down     # Stop all services
npm run docker:logs     # View logs
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
npm run build   # Build everything (Turbo)
npm start       # Run at http://localhost:3000
```

Production serves frontend at `/` and API at `/api/*` from port 3000.

---

## Architecture

**Workspaces:**

- `apps/api` – Express + TypeScript + Drizzle ORM + PostgreSQL
- `apps/web` – React + Vite + Tailwind
- `apps/face-py` – FastAPI + InsightFace + ONNX Runtime
- `packages/shared` – Shared TypeScript types

**Database Schema:** `apps/api/src/schema.ts` (typesafe, auto-generates migrations)

**API Endpoints:**

- `GET /api/health` – Health check (API + face service status)
- `POST /api/images` – Save image with name
- `GET /api/images` – List saved images
- `GET /api/images/:name` – Get specific image
- `POST /api/images/compare` – Compare two faces

**Face Recognition:**
Uses InsightFace model (default: `buffalo_l` for local dev, `buffalo_s` for production). Compares 512-dimensional embeddings with cosine similarity. Default threshold: 0.5.
