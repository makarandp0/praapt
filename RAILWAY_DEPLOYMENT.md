# Railway Deployment Guide

This guide walks you through deploying Praapt to Railway with all services (API + Face Service + Postgres).

## Architecture

The app consists of three services on Railway:

1. **API Service** – Node.js/Express (serves frontend + API)
2. **Face Service** – Python/FastAPI (face recognition)
3. **PostgreSQL** – Managed database (Railway plugin)

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

1. Click **"New"** → **"GitHub Repo"** → Select `praapt`
2. **Configure the service:**
   - **Name:** `face-service`
   - **Root Directory:** `apps/face-py`
   - **Dockerfile Path:** `apps/face-py/Dockerfile`
3. **Add environment variables:**
   - `PORT` = `8000` (Railway will auto-assign this)
   - `INSIGHTFACE_HOME` = `/models`
4. Click **"Deploy"**
5. Once deployed, copy the public URL (e.g., `https://face-service-production.up.railway.app`)

### 4. Deploy the API Service

1. Click **"New"** → **"GitHub Repo"** → Select `praapt`
2. **Configure the service:**
   - **Name:** `api`
   - **Root Directory:** `.` (leave as root)
   - **Dockerfile Path:** `apps/api/Dockerfile`
3. **Add environment variables:**
   - `NODE_ENV` = `production`
   - `PORT` = `3000` (Railway auto-assigns)
   - `FACE_SERVICE_URL` = `<face-service-url-from-step-3>`
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (if using DB later)
4. Click **"Deploy"**
5. Once deployed, your app is live at the provided URL!

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
IMAGES_DIR=/app/images  # Optional, defaults to ./images
CORS_ORIGIN=*  # Or specific domain for production
```

### Face Service

```bash
PORT=8000  # Railway auto-assigns
INSIGHTFACE_HOME=/models
```

## Troubleshooting

### Face Service Issues

- **503 errors:** The face service takes ~30-60s to download models on first start. Check logs.
- **Memory issues:** Increase memory allocation in Railway settings (recommended: 2GB+)

### API Service Issues

- **Build failures:** Ensure all workspaces install correctly. Check `npm install` logs.
- **Static files not found:** Verify `apps/web/dist` exists after build step

### Connection Issues

- **API can't reach face service:** Double-check `FACE_SERVICE_URL` matches the face service's public URL
- **CORS errors:** Set `CORS_ORIGIN` to your frontend domain

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

## Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: https://github.com/makarandp0/praapt/issues
