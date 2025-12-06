# Railway Deployment Guide

This guide walks you through deploying Praapt to Railway with all services (API + Face Service + Postgres).

## Architecture

The app consists of three services on Railway:

1. **API Service** – Node.js/Express (serves frontend + API)
2. **Face Service** – Python/FastAPI (face recognition)
3. **PostgreSQL** – Managed database (Railway plugin)

## Prerequisites

- [Railway CLI](https://docs.railway.app/guides/cli) installed: `brew install railway` (macOS) or `npm i -g @railway/cli`
- Railway account at [railway.app](https://railway.app)
- GitHub repository connected to Railway
- Git installed locally

## Step-by-Step Deployment

### 1. Create Railway Project

1. Sign in to [Railway](https://railway.app)
2. Click **"New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Select your `praapt` repository

### 2. Add PostgreSQL Database

1. In your Railway project, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will automatically create a `DATABASE_URL` variable
3. Note: Since we've commented out DB code, you can skip this for now, but it's ready when you need it

### 3. Deploy the Face Service

#### Using Railway Dashboard:

1. Click **"New"** → **"GitHub Repo"** → Select `praapt`
2. **Configure the service:**
   - **Name:** `face-py`
   - **Root Directory:** Leave empty (deploy from root)
   - **Dockerfile Path:** `apps/face-py/Dockerfile`
3. **Settings → Resources:**
   - Increase memory to at least **2GB** (face recognition models require significant memory)
4. **Environment Variables** (will be auto-set, but verify):
   - `PORT` = Auto-assigned by Railway
   - `INSIGHTFACE_HOME` = `/models`
5. Click **"Deploy"**
6. Once deployed, go to **Settings → Networking** and click **Generate Domain** to get public URL
7. Copy the URL (e.g., `https://face-py-production.up.railway.app`)

#### Using Railway CLI:

```bash
# Link to your Railway project
railway link

# Select the face-py service
railway service

# Deploy from root directory (railway.json in apps/face-py handles config)
cd apps/face-py
railway up

# Generate public domain
railway domain
```

**Important:** The face service uses the `buffalo_s` model (smaller, ~500MB) instead of `buffalo_l` to fit within Railway's memory limits. First startup takes 30-60s to download models.

### 4. Deploy the API Service

#### Using Railway Dashboard:

1. Click **"New"** → **"GitHub Repo"** → Select `praapt`
2. **Configure the service:**
   - **Name:** `api`
   - **Root Directory:** Leave empty (deploy from root)
   - **Dockerfile Path:** `apps/api/Dockerfile`
3. **Add environment variables:**
   - `NODE_ENV` = `production`
   - `FACE_SERVICE_URL` = `https://face-py-production.up.railway.app` (from step 3)
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (if using DB - optional)
4. Click **"Deploy"**
5. Once deployed, go to **Settings → Networking** and click **Generate Domain**
6. Your app is now live at the provided URL!

#### Using Railway CLI:

```bash
# From project root
railway link

# Set environment variables
railway variables --service api --set NODE_ENV=production
railway variables --service api --set FACE_SERVICE_URL=https://face-py-production.up.railway.app

# Deploy
railway up --service api

# Generate public domain
railway domain --service api
```

The API service serves both the backend API and the React frontend at the same URL.

### 5. Configure Custom Domain (Optional)

1. Go to your API service settings
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain and follow DNS instructions

## Environment Variables Reference

### API Service

```bash
NODE_ENV=production
PORT=3000  # Railway auto-assigns
FACE_SERVICE_URL=https://your-face-service.up.railway.app
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-linked if using DB
IMAGES_DIR=/app/images  # Mounted to Railway volume for persistence
CORS_ORIGIN=*  # Or specific domain for production
```

### Face Service

```bash
PORT=8000  # Railway auto-assigns
INSIGHTFACE_HOME=/models
```

## Volumes

The API service uses a Railway volume to persist uploaded images (profile photos):

- **Mount path:** `/app/images`
- **Volume name:** `praapt-images`

This is configured in `railway.json`. Images survive redeploys and container restarts.

## Quick Deployment Commands (CLI)

After initial setup, use these commands to redeploy:

```bash
# Deploy face service
cd apps/face-py
railway up --service face-py

# Deploy API service
cd ../..
railway up --service api

# Check service status
railway status

# View logs
railway logs --service api
railway logs --service face-py
```

## Troubleshooting

### Face Service Issues

- **"Killed" messages / OOM errors:** The service is running out of memory. Increase memory to 2GB+ in Railway Settings → Resources.
- **503 errors:** The face service takes ~30-60s to download models on first start. Check logs.
- **Model download fails:** Check logs for network issues. Models are downloaded from GitHub releases.
- **CUDA warnings:** Normal - the service runs on CPU only. These warnings can be ignored.

### API Service Issues

- **"Cannot find module" errors:** Ensure TypeScript builds correctly. The built files are in `apps/api/dist/src/`.
- **Build failures:** Ensure all workspaces install correctly. Check `npm install` logs.
- **Static files not found:** Verify `apps/web/dist` exists after build step in logs.
- **Frontend shows 404:** The API serves the frontend - ensure `apps/web/dist` is copied in Dockerfile.

### Connection Issues

- **API can't reach face service:** Double-check `FACE_SERVICE_URL` in API environment variables matches the face service's public URL (use Railway CLI: `railway variables --service api`).
- **CORS errors:** Set `CORS_ORIGIN` environment variable to your frontend domain.
- **Private network not working:** Services can communicate via `RAILWAY_PRIVATE_DOMAIN` for internal requests (e.g., `http://face-py.railway.internal`).

## Logs and Monitoring

View logs for each service:

```bash
# Using Railway CLI
railway logs --service api
railway logs --service face-service
```

Or use the Railway dashboard to view logs in real-time.

## CI/CD

Railway automatically redeploys when you push to your connected branch. To configure:

1. Go to **Settings** → **Deploy Triggers**
2. Choose branch (e.g., `main` or `production`)
3. Enable **"Auto-deploy"**

## Database Migrations

Migrations run **automatically** on every deployment as part of container startup. The API container runs `apps/api/dist/scripts/migrate.js` before starting the app, which applies any pending migrations.

### How It Works

1. **Container starts** → Entrypoint script runs migrations → App starts
2. Knex tracks applied migrations in `knex_migrations` table
3. Only pending migrations are applied; already-run migrations are skipped
4. If migrations fail, the container exits (deploy fails)

### Local Development

```bash
# Start local Postgres
docker compose up db -d

# Run migrations
npm run migrate --workspace=@praapt/api

# Rollback last batch (if needed)
npm run rollback --workspace=@praapt/api

# Run seeds (sample data)
npm run seed --workspace=@praapt/api
```

### Creating New Migrations

```bash
# Create a new migration file (from apps/api directory)
cd apps/api
npx knex migrate:make your_migration_name --knexfile knexfile.ts -x ts

# Or using the full path from repo root
node --loader ts-node/esm node_modules/knex/bin/cli.js \
  --knexfile apps/api/knexfile.ts \
  migrate:make your_migration_name -x ts
```

Migration files go in `apps/api/migrations/` and are compiled to JS during build.

### Production Considerations

- **Migrations are forward-only** – Never run rollbacks in production automatically
- **Test migrations locally first** – Run against a copy of production data if possible
- **Keep migrations small** – Break large schema changes into multiple migrations
- **Add indexes separately** – Create indexes in a separate migration to minimize lock time
- **No destructive changes** – Avoid `DROP TABLE` or removing columns in the same deploy as code changes

### Manual Migration Commands (Production)

If you need to run migrations manually on Railway:

```bash
# SSH into Railway service
railway run --service api bash

# Check migration status
node apps/api/dist/scripts/migrate.js

# Or use Railway's shell directly
railway shell --service api
```

## Cost Optimization

- **Starter Plan:** ~$5/month for hobby projects
- **PostgreSQL:** $5/month (can skip if not using DB features)
- **Face Service:** ~$10-15/month (CPU/memory intensive)
- **API Service:** ~$5/month

**Total:** ~$10-25/month depending on usage

## Local Testing Before Deploy

Test the production build locally:

```bash
# Build everything
npm run prod:build

# Start production server
NODE_ENV=production \
FACE_SERVICE_URL=http://localhost:8000 \
npm run prod:start
```

Visit http://localhost:3000 to verify frontend is served correctly.

## Configuration Files

The project includes these configuration files for Railway:

- **`railway.json`** (root) - Configuration for API service
- **`apps/face-py/railway.json`** - Configuration for face service
- **`apps/api/Dockerfile`** - Multi-stage build for API + frontend
- **`apps/face-py/Dockerfile`** - Python/FastAPI container

## Deployment Checklist

Before deploying, ensure:

- [ ] Railway CLI installed and authenticated (`railway login`)
- [ ] Project linked to Railway (`railway link`)
- [ ] All dependencies in package.json and requirements.txt are correct
- [ ] Environment variables are set for both services
- [ ] Face service has 2GB+ memory allocated
- [ ] Both services have public domains generated
- [ ] `FACE_SERVICE_URL` in API service matches face service URL

## Redeploying After Changes

Railway auto-deploys on push if connected to GitHub. Or manually:

```bash
# Option 1: Push to GitHub (auto-deploys if enabled)
git add .
git commit -m "Your changes"
git push origin main

# Option 2: Deploy directly via CLI
railway up --service api
railway up --service face-py
```

## Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: https://github.com/makarandp0/praapt/issues
- Railway CLI Help: `railway --help`
