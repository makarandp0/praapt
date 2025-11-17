# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json .
COPY apps/api/package.json apps/api/package.json
RUN npm install --ignore-scripts

FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy only the API package and built artifacts
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY --from=deps /app/node_modules /app/node_modules
COPY package.json /app/package.json
COPY apps/api/package.json /app/apps/api/package.json

EXPOSE 3000
WORKDIR /app/apps/api
CMD ["node", "dist/index.js"]

