---
description: Start local development environment
allowed-tools:
  - Bash
  - Read
---

Start the local development environment for praapt.

## Steps

1. Read the AGENTS.md file:
   ```
   Read AGENTS.md
   ```

2. Check if Docker is running and start the database:
   ```bash
   docker compose up -d
   ```

3. Run database migrations if needed:
   ```bash
   pnpm migrate
   ```

4. Start the development servers:
   ```bash
   pnpm dev:all
   ```

5. Inform the user of the running services:
   - API: http://localhost:3001
   - Web: http://localhost:5173
