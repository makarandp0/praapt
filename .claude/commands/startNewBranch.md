---
description: Create a new branch off the latest main without switching branches
allowed-tools:
  - Bash
  - Read
---

Create a new feature branch based on the latest origin/main and switch to it.

## Steps

1. Read the LLM_INSTRUCTIONS.md file to understand project conventions:
   ```
   Read LLM_INSTRUCTIONS.md
   ```

2. Fetch the latest main from origin:
   ```bash
   git fetch origin main
   ```

3. Create the new branch based on origin/main and switch to it:
   ```bash
   git checkout -b "$ARGUMENTS" origin/main
   ```

4. Merge from origin/main to ensure the branch is up to date:
   ```bash
   git merge origin/main
   ```

5. After successful creation, inform the user:

   ```
   Branch '$ARGUMENTS' created off origin/main, merged with latest main, and checked out.

   To push and set up tracking:

       git push -u origin "$ARGUMENTS"
   ```
