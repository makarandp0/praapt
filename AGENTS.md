Purpose

This guide helps an LLM work efficiently in this repo. It outlines where to look first and what patterns to follow.

## Repository Structure

```
apps/
  api/          Express API (TypeScript)
    src/
      routes/     Route handlers
      middleware/ Auth middleware
      services/   Business logic
      lib/        Utilities (routeBuilder, errors, logger)
      schema.ts   Drizzle ORM schema
      config.ts   Typed env config via getConfig()
    migrations/   node-pg-migrate files
  web/          React + Vite frontend
    src/
      pages/      Page components
      contexts/   React contexts
      hooks/      Custom hooks
      components/ UI components
      lib/        Helpers (contractClient, firebase)
      flows/      Multi-step UI wizards
  face-py/      Python face recognition service (FastAPI + InsightFace)
packages/
  shared/       Shared TypeScript types
    src/
      schemas.ts      Zod schemas for API types
      contracts/      API contract definitions
scripts/        Dev scripts (dev.sh, _common.sh)
```

## Key Patterns

**API Contracts**: Define in `packages/shared/src/contracts/api.ts` using `defineContract()`. Backend uses `createRouteBuilder(router).fromContract()`. Frontend uses `callContract()`. Contracts are the source of truth for method, path, schemas, and auth.

**Shared Types**: All API request/response types go in `packages/shared/src/schemas.ts` as Zod schemas. Import from `@praapt/shared`.

**API Responses**: Use discriminated unions with `ok: true | false`. Use `createApiResponse()` helper for standard responses.

**Config**: Use `getConfig()` from `apps/api/src/config.ts`. Never use `process.env` directly in handlers.

**Migrations**: node-pg-migrate in `apps/api/migrations/`. Keep `schema.ts` in sync manually.

## Commands

```bash
pnpm dev        # Start all services (ports vary by worktree)
pnpm check      # Build + typecheck + lint + test
pnpm lint:fix   # Auto-fix lint issues
pnpm migrate    # Run database migrations
```

## Paths To Avoid

`node_modules/`, `dist/`, `build/`, `coverage/`, `.git/`, `.turbo/`, `*.log`, `*.lock`, `.env`

## Working Rules

1. **Search first** - Use ripgrep/grep to find symbols before opening files
2. **Follow imports** - Expand context by dependency chain, not folder scanning
3. **Surgical edits** - Smallest viable changes, don't refactor unrelated code
4. **Validate** - Run `pnpm check` before considering work complete
5. **Source only** - Never read build outputs; use TypeScript source

## Learning From Mistakes

Add notes here when you discover pitfalls. This section persists institutional knowledge.

- **Circular imports in shared**: Contracts import from `schemas.ts` (not `index.ts`). Node.js fails at runtime with circular deps even when TypeScript compiles fine.
- **Contract paths are relative to mount points**: If routes mount at `/api/auth`, contract path `/login` becomes `/api/auth/login`. Don't double up.
- **drizzle.config.ts is CommonJS**: Cannot import ESM modules. Use `process.env` directly with `import 'dotenv/config'`.
- **Migration timestamps must be sequential**: New migrations need timestamps greater than all applied ones.
- **`updated_at` has a trigger**: Don't set it manually in Drizzle `.set()` calls.
- **callContract needs token**: Pass `token: await getIdToken()` for protected endpoints.
- **Down migrations need tsx**: `DATABASE_URL="..." npx tsx node_modules/node-pg-migrate/bin/node-pg-migrate.js down --migrations-dir migrations`

## Local Development

- Docker services (shared): PostgreSQL `:5433`, Face service `:8001`
- API/Web ports vary by worktree name hash (main uses 3000/5173)
- `pnpm dev` auto-kills existing processes on those ports
