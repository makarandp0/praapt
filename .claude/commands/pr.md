---
description: Create a pull request with automated checks and description generation
allowed-tools:
  - Bash
  - Bash(gh:*)
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

Create a pull request for the current branch. Follow these steps:

## 1. Pre-flight Checks

First, make another pass at the changes made. Make sure there is no dead code left behind.
Second, run the project checks to ensure the PR is ready:

```bash
pnpm check
```

If checks fail, stop and help fix the issues before proceeding.

## 2. Update LLM Instructions

Run the /updateAgentsFile workflow to capture any learnings from this work into LLM_INSTRUCTIONS.md. If updates are made, commit them before proceeding.

## 3. Gather Context

- Run `git log main..HEAD --oneline` to see all commits being merged
- Run `git diff main...HEAD --stat` to understand the scope of changes
- Check if there are uncommitted changes that should be included

## 4. Generate PR Description

Based on the commits and changes, create a PR with:

**Title**: Use conventional commit style based on the primary change type:

- `feat: ...` for new features
- `fix: ...` for bug fixes
- `chore: ...` for maintenance

**Body structure**:

```
## Summary
[2-3 bullet points describing what this PR does]

## Changes
[List key files/areas modified]

## Testing
- [ ] `pnpm check` passes (build, typecheck, lint)
- [ ] Verified visually (for UI changes)

## Notes
[Any additional context, breaking changes, or follow-up items]
```

## 5. Create the PR

Use `gh pr create` with the generated title and body. Target the `main` branch.

If the branch hasn't been pushed yet, push it first with `git push -u origin HEAD`.

After creating the PR, display the PR URL and open it in the browser:

```bash
open <PR_URL>
```
