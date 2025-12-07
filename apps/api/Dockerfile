# syntax=docker/dockerfile:1

FROM node:22.18-bookworm-slim AS deps
WORKDIR /app
COPY package.json .
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install --ignore-scripts

FROM deps AS build
WORKDIR /app
# Accept git commit hash as build arg (Railway provides RAILWAY_GIT_COMMIT_SHA at build time)
ARG RAILWAY_GIT_COMMIT_SHA=unknown
ARG GIT_COMMIT=${RAILWAY_GIT_COMMIT_SHA}
ENV GIT_COMMIT=${GIT_COMMIT}
# Copy the full repo (needed for TypeScript sources)
COPY . .
# Build shared package, API, and frontend via TurboRepo
RUN npm run build

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

# Copy built artifacts: API dist, web dist, shared dist, and node_modules
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY --from=build /app/apps/api/drizzle /app/apps/api/drizzle
COPY --from=build /app/apps/web/dist /app/apps/web/dist
COPY --from=build /app/packages/shared/dist /app/packages/shared/dist
COPY --from=deps /app/node_modules /app/node_modules
COPY package.json /app/package.json
COPY apps/api/package.json /app/apps/api/package.json
COPY packages/shared/package.json /app/packages/shared/package.json

# Copy entrypoint script
COPY apps/api/scripts/docker-entrypoint.sh /app/apps/api/scripts/docker-entrypoint.sh
RUN chmod +x /app/apps/api/scripts/docker-entrypoint.sh

# Copy seed images if they exist
COPY apps/api/images /app/images

EXPOSE 3000
WORKDIR /app
ENTRYPOINT ["/app/apps/api/scripts/docker-entrypoint.sh"]
