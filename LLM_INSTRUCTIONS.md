Purpose

This guide helps an LLM work efficiently in this repo without parsing the entire codebase. It outlines where to look first, which paths to prioritize, and what to ignore unless explicitly relevant.

Repository Map (high signal first)

1. README.md: Project overview, commands, and workflows.
2. package.json (root): Workspace scripts, TurboRepo config, and tooling entry points.
3. apps/api (Express API)
   - src/index.ts: API server entry.
   - src/config.ts: Centralized typed configuration via `getConfig()`.
   - src/routes/\*.ts: Route handlers (auth, images, health).
   - src/db.ts: Database connection via Drizzle/PG.
   - src/schema.ts: Drizzle schema definitions.
   - migrations/: Database migrations (node-pg-migrate).
   - **Note:** Migrations are tracked in the `pgmigrations` table in `public` schema.
4. apps/web (React + Vite)
   - src/main.tsx: Frontend bootstrap.
   - src/App.tsx: Primary app component with routing.
   - src/pages/: Page components (Login, Signup, Library, User).
   - src/contexts/: React contexts (AuthContext).
   - src/hooks/: Custom React hooks (e.g., useFaceDetection).
   - src/components/, src/lib/: UI and helpers.
   - index.css, tailwind config: Styling.
5. packages/shared (Shared Types)
   - src/index.ts: Re-exports schemas and contracts.
   - src/schemas.ts: Zod schemas for API request/response types.
   - src/contracts/api.ts: API contract definitions (method, path, schemas).
   - src/contracts/types.ts: Contract type definitions and inference helpers.
   - **Always use these shared types for API request/response contracts.**
6. docker-compose.yml: Local Postgres.
7. scripts/\*.mjs: Repo scripts (e.g., verification).

Paths To Prioritize

- packages/shared/src/index.ts (shared Zod schemas - check first for API contracts)
- apps/api/src/\*_/_.ts
- apps/api/migrations/\*.ts
- apps/web/src/\*_/_.{ts,tsx,css}
- README.md, package.json, apps/\*/package.json, docker-compose.yml

Paths To Avoid (unless directly needed)

- node_modules/\*\*
- apps/\*/dist/**, dist/**, build/**, coverage/**
- .git/**, .github/**
- .cache/**, .turbo/**, .next/**, .output/**
- _.log, _.pid, \*.lock (lockfiles), .DS_Store
- .env, .env.\* (use `.env.example` for reference instead)

Working Rules For The LLM

1. Start Small
   - Read README.md and root/package.json to understand scripts and topology.
   - Open only the minimal entry points (listed above) related to the task.

2. Search, Then Open
   - Use text search to locate relevant symbols/strings before opening files.
   - Suggested commands (non-destructive):
     - ripgrep: `rg -n "<term>" apps/**/src`
     - git grep: `git grep -n "<term>" -- apps`

3. Expand By Dependency
   - After finding the relevant file, selectively open directly-related imports/exports.
   - Avoid scanning entire folders; follow the call/import chain.

4. Prefer Source Over Artifacts
   - Never read build outputs in dist/, coverage reports, or minified bundles.
   - Use TypeScript/JS source under src/.

5. Keep Changes Surgical
   - Make the smallest viable edits consistent with existing style.
   - Do not refactor unrelated code or rename files unless requested.
   - Update or add minimal docs only when necessary for the task.

6. Validate With Existing Scripts
   - Use `pnpm check` to run the full validation suite (build, typecheck, lint, test).
   - Use `turbo run <task>` (e.g., `turbo run test`) to run specific tasks across workspaces.
   - After making any code changes, run `pnpm lint:fix` for autofixes and resolve remaining issues.
   - **Note:** The pre-push hook automatically runs `pnpm check` before pushing. If it fails, fix issues before pushing.
   - For DB work, consult drizzle/ migrations and src/schema.ts; do not alter them unless the task requires.

7. Use Shared Types (packages/shared)
   - All API request/response types MUST be defined as Zod schemas in `packages/shared/src/index.ts`.
   - Import types from `@praapt/shared` in both API routes and web pages.
   - After adding new schemas, run `pnpm build --filter=@praapt/shared` to compile.
   - Example: `SignupBodySchema`, `LoginResponseSchema`, `UserSchema`.

8. Discriminated Union API Responses
   - All API responses use discriminated unions with `ok: true` or `ok: false`.
   - Use `createApiResponse()` helper from `@praapt/shared` for simple schemas:
     ```typescript
     // Creates: { ok: true, users: User[], count: number } | { ok: false, error: string }
     export const ListUsersResponseSchema = createApiResponse(
       z.object({ users: z.array(UserSchema), count: z.number() }),
     );
     ```
   - For custom error schemas (like login with topMatches), define directly:
     ```typescript
     export const LoginResponseSchema = z.discriminatedUnion('ok', [
       z.object({ ok: z.literal(true), user: UserSchema, match: MatchSchema }),
       z.object({ ok: z.literal(false), error: z.string(), topMatches: z.array(...).optional() }),
     ]);
     ```

9. Contract-Based API Routes (Preferred)
   - Define contracts in `packages/shared/src/contracts/api.ts` using `defineContract()`.
   - Backend: Use `createRouteBuilder(router).fromContract(Contracts.xyz, handler)`.
   - Frontend: Use `callContract(baseUrl, Contracts.xyz, { body })` from `contractClient.ts`.
   - Contracts are the single source of truth for method, path, and schemas.
   - **Example (backend)**:
     ```typescript
     const routes = createRouteBuilder(router);
     routes.fromContract(Contracts.login, async (req) => {
       const { faceImage } = req.body; // typed from contract
       return { ok: true as const, user, match, topMatches };
     }, { errorStatus: 401 });
     ```
   - **Note**: File-serving routes (e.g., `GET /images/:name`) don't use contracts—they return binary data, not JSON.

10. Legacy validatedHandler (still supported)
   - Direct `validatedHandler` usage still works for routes not yet migrated.
   - Use `as const` on `ok` values to preserve literal types:
     ```typescript
     router.post('/login', validatedHandler(
       { body: LoginBodySchema, response: LoginResponseSchema, errorStatus: 401 },
       async (req) => {
         return { ok: true as const, user: { ... } };
       }
     ));
     ```

11. Unexpected Errors (Exceptions)

- For truly unexpected errors (validation, database, etc.), throw normally.
- Simple errors (ValidationError, NotFoundError, etc.) return `{ error, code }`.
- Complex typed errors with schemas are rarely needed now that expected failures use discriminated unions.

12. Web Client Response Handling

- Always check `response.ok` before accessing success-only properties:
  ```typescript
  const response = await api.listUsers();
  if (!response.ok) {
    throw new Error(response.error);
  }
  // TypeScript now knows response.users exists
  setUsers(response.users);
  ```
- Use helper types like `ApiSuccess<T>` and `ApiError<T>` to extract union branches.
- Use exported types like `ListUser` instead of `ListUsersResponse['users'][number]`.

13. Environment & Secrets

- Do not read or rely on real `.env` files; use `.env.example` for keys/shape.
- **Use `getConfig()` from `apps/api/src/config.ts`** for all environment variable access in the API. Never use `process.env` directly in route handlers or services.

Task-Focused Entry Points (quick checklist)

- API route/behavior issue: apps/api/src/routes/\*.ts, apps/api/src/index.ts
- DB schema/seed change: apps/api/src/schema.ts, apps/api/migrations/\*.ts
- Frontend UI/state change: apps/web/src/App.tsx, apps/web/src/pages/_.tsx, apps/web/src/contexts/_.tsx, apps/web/src/hooks/\*.ts
- API contracts/types: packages/shared/src/index.ts (Zod schemas)
- Project setup/scripts: README.md, root/package.json, apps/_/package.json, scripts/_.mjs

If In Doubt

- Ask for the minimal file list needed for context.
- Summarize assumptions and confirm before opening more files.

Learning From Mistakes

When you make a mistake or discover something unexpected about this codebase, **add a note to this file** to prevent repeating the same mistake. This helps future LLM sessions avoid known pitfalls.

- **Circular dependency in shared package**: Schemas are in `schemas.ts`, contracts are in `contracts/api.ts`. Contracts import from `schemas.ts` (not `index.ts`) to avoid circular imports. If you add new schemas, put them in `schemas.ts`. TypeScript compiles circular imports successfully, but Node.js fails at runtime with "Cannot access X before initialization".
- **Contract paths are relative to Express mount points**: If `app.use('/api/auth', authRoutes)` mounts auth routes, and a contract has `path: '/auth/login'`, the full path becomes `/api/auth/auth/login` (doubled). The contract path should be `/login` to get `/api/auth/login`. Check how routes are mounted in `apps/api/src/index.ts` before defining contract paths.
- **AnyApiContract type**: When writing generic functions that accept any contract, use `AnyApiContract` from `@praapt/shared`—don't try to define your own with `z.ZodTypeAny` constraints (causes import issues in packages without direct zod dependency).
- **drizzle.config.ts cannot import config.ts**: drizzle-kit uses CommonJS require, so it cannot import ESM modules. Keep `process.env.DATABASE_URL` access directly in `drizzle.config.ts` with `import 'dotenv/config'`.

## Database Migrations (node-pg-migrate)

This project uses **node-pg-migrate** for database migrations. Drizzle ORM is still used for queries, but migrations are handled separately for a simpler, more predictable workflow.

### Why node-pg-migrate?

- **Simple**: No snapshots, no journals, just numbered TypeScript migration files
- **Predictable**: You write the SQL, you know exactly what runs
- **Explicit**: Uses standard `up`/`down` migration pattern
- **CI-friendly**: Works in scripts without human interaction

### Migration Workflow

```bash
# 1. Create a new migration (from apps/api directory)
pnpm migrate:create my_descriptive_name

# 2. Edit the generated file in apps/api/migrations/
#    The file will have a timestamp prefix like: 1738000000000_my-descriptive-name.ts

# 3. Run migrations
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/praaptdb" pnpm migrate

# Or use the CLI directly for up/down:
DATABASE_URL="..." pnpm migrate:up    # Run pending migrations
DATABASE_URL="..." pnpm migrate:down  # Rollback one migration
```

### Migration File Pattern

```typescript
import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE face_registrations ADD COLUMN role TEXT;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE face_registrations DROP COLUMN role;
  `);
}
```

### Key Files

| File | Purpose |
|------|---------|
| `apps/api/src/schema.ts` | Drizzle table definitions (keep in sync with migrations) |
| `apps/api/migrations/*.ts` | Migration files (timestamped) |
| `pgmigrations` table | Tracks applied migrations (auto-managed by node-pg-migrate) |

### Important Notes

- **Keep schema.ts in sync**: After running a migration, update `src/schema.ts` to match the new database state
- **Idempotent migrations**: Use `IF NOT EXISTS` / `IF EXISTS` for safety when possible
- **Rollbacks**: The `down` function should cleanly undo the `up` function

### Database Connection

For local development with Docker:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/praaptdb?sslmode=disable"
```

### Checking Migration Status

```bash
# List applied migrations
docker exec $(docker ps -q --filter "ancestor=postgres:16") \
  psql -U postgres -d praaptdb -c "SELECT * FROM pgmigrations ORDER BY id;"

# List current tables
docker exec $(docker ps -q --filter "ancestor=postgres:16") \
  psql -U postgres -d praaptdb -c "\dt public.*"
```
