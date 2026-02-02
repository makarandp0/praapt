# syntax=docker/dockerfile:1

FROM node:22.18-bookworm-slim AS base
# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
# Accept git commit hash as build arg (Railway provides RAILWAY_GIT_COMMIT_SHA at build time)
ARG RAILWAY_GIT_COMMIT_SHA=unknown
ARG GIT_COMMIT=${RAILWAY_GIT_COMMIT_SHA}
ENV GIT_COMMIT=${GIT_COMMIT}
# Copy the full repo (needed for TypeScript sources)
COPY . .
# Build shared package, API, and frontend via TurboRepo
RUN pnpm run build
# Deploy API with all its dependencies to /app/deploy
RUN pnpm --filter @praapt/api deploy --prod /app/deploy

FROM node:22.18-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    procps \
    net-tools \
    lsof \
    && rm -rf /var/lib/apt/lists/*
# Accept git commit hash for runtime (must redeclare ARG - Railway provides RAILWAY_GIT_COMMIT_SHA)
ARG RAILWAY_GIT_COMMIT_SHA=unknown
ARG GIT_COMMIT=${RAILWAY_GIT_COMMIT_SHA}
ENV GIT_COMMIT=${GIT_COMMIT}
ENV NODE_ENV=production
ENV STATIC_PATH=/app/apps/web/dist
WORKDIR /app

# Copy the deployed API (includes node_modules with all deps)
COPY --from=build /app/deploy /app/apps/api

# Copy API dist and migrations from build
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY --from=build /app/apps/api/migrations /app/apps/api/migrations

# Copy web dist and shared dist
COPY --from=build /app/apps/web/dist /app/apps/web/dist
COPY --from=build /app/packages/shared/dist /app/packages/shared/dist

# Copy package.json files for module resolution
COPY package.json /app/package.json
COPY packages/shared/package.json /app/packages/shared/package.json

# Copy entrypoint script
COPY apps/api/scripts/docker-entrypoint.sh /app/apps/api/scripts/docker-entrypoint.sh
RUN chmod +x /app/apps/api/scripts/docker-entrypoint.sh

# Copy seed images if they exist
COPY apps/api/images /app/images

EXPOSE 3000
WORKDIR /app/apps/api
ENTRYPOINT ["/app/apps/api/scripts/docker-entrypoint.sh"]
