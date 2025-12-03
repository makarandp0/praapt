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
# Copy the full repo (needed for TypeScript sources)
COPY . .
# Build shared package, API, and frontend
RUN npm --workspace=@praapt/shared run build
RUN npm --workspace=@praapt/api run build
RUN npm --workspace=@praapt/web run build

FROM node:22.18-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy built artifacts: API dist, web dist, shared dist, and node_modules
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY --from=build /app/apps/web/dist /app/apps/web/dist
COPY --from=build /app/packages/shared/dist /app/packages/shared/dist
COPY --from=deps /app/node_modules /app/node_modules
COPY package.json /app/package.json
COPY apps/api/package.json /app/apps/api/package.json
COPY packages/shared/package.json /app/packages/shared/package.json

EXPOSE 3000
WORKDIR /app
CMD ["node", "apps/api/dist/index.js"]
