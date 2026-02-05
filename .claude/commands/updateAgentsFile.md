---
description: Update AGENTS.md with learnings from current changes or PR
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

Analyze recent changes in the current branch or PR and update AGENTS.md with any new findings that would help future LLM sessions work more effectively in this codebase.

## 1. Gather Context

First, understand what has changed:

```bash
# Check if we're on a feature branch with commits ahead of main
git log main..HEAD --oneline 2>/dev/null || git log -10 --oneline

# See the scope of changes
git diff main...HEAD --stat 2>/dev/null || git diff HEAD~5 --stat

# Check for any uncommitted changes
git status --short
```

## 2. Analyze Changes for Learnings

Review the changes to identify patterns that would benefit future agents:

- **New conventions**: Did we establish new coding patterns or conventions?
- **Gotchas discovered**: Did we encounter unexpected behavior or pitfalls?
- **Architecture changes**: Were there structural changes to how code is organized?
- **New tools/scripts**: Were new developer tools or scripts added?
- **API/schema changes**: Were there changes to shared types or API contracts?
- **Workflow improvements**: Did we learn better ways to accomplish tasks?

Read the relevant changed files to understand the context:

```bash
git diff main...HEAD --name-only 2>/dev/null || git diff HEAD~5 --name-only
```

## 3. Read Current AGENTS.md

```
Read AGENTS.md
```

Pay special attention to the "Learning From Mistakes" section at the end of the file.

## 4. Update AGENTS.md

Update AGENTS.md following these principles:

- **Keep it compact**: Remove outdated or redundant information. Consolidate similar points. Every line should earn its place.
- **Keep it useful**: Focus on actionable guidance that prevents mistakes or speeds up development.
- **Keep it accurate**: Remove or correct any information that no longer reflects the codebase.
- **Add to "Learning From Mistakes"**: This section exists specifically for learnings discovered during development.
- **Be specific**: Include concrete gotchas, patterns, or discoveries that prevent repeating mistakes.
- **Avoid duplication**: Don't repeat what's already documented elsewhere in the file.
- **Match existing style**: Follow the formatting and tone of the existing document.

## 5. Validate Changes

After updating, verify the file is still well-structured:

```bash
# Ensure no syntax issues - check the end of the file
tail -30 AGENTS.md
```

## 6. Summary

Report to the user:
- What changes were analyzed
- What learnings were identified
- What was added/updated in AGENTS.md
- Whether any learnings were skipped and why
