---
description: Check PR feedback, address issues, and respond with resolution status
allowed-tools:
  - Bash
  - Bash(gh:*)
  - Bash(git:*)
  - Bash(pnpm:*)
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Task
---

Review and address feedback on the current PR. Follow these steps:

## 1. Identify the PR

Find the PR number for the current branch:

```bash
gh pr view --json number,url,title,state --jq '"\(.number) \(.title) (\(.state))"'
```

If no PR exists, stop and inform the user.

## 2. Fetch PR Feedback

Get all review comments and reviews:

```bash
# Get review summary
gh pr view --json reviews --jq '.reviews[] | "\(.author.login): \(.state) - \(.body | split("\n")[0])"'

# Get inline comments
gh api repos/{owner}/{repo}/pulls/{number}/comments --jq '.[] | "[\(.path):\(.line // .original_line)] \(.body | split("\n")[0])"'
```

## 3. Categorize Feedback

Group the feedback into categories:

- **High Priority**: Security issues, bugs, broken functionality
- **Medium Priority**: Code quality, missing error handling, inconsistencies
- **Low Priority / Stylistic**: Naming, comments, minor refactors
- **Suggestions**: Optional improvements, "nice to have"
- **Questions**: Clarifications needed (may not require code changes)

Present a summary to the user asking which issues to address. If the user already specified which issues, proceed with those.

## 4. Address Feedback

For each issue being addressed:

1. Read the relevant file(s)
2. Understand the context and the reviewer's concern
3. Make the appropriate fix
4. Keep changes minimal and focused

**When to push back** (don't make changes):
- The suggestion would introduce unnecessary complexity
- The current approach is intentional and well-reasoned
- The feedback is based on a misunderstanding of the code
- The change would conflict with project conventions
- The change is out of scope for this PR

## 5. Run Checks

After making changes, verify everything still works:

```bash
pnpm check
```

If checks fail, fix the issues before proceeding.

## 6. Commit and Push

Stage and commit the changes with a descriptive message:

```bash
git add <files>
git commit -m "fix: address PR review feedback

- <brief description of changes>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
git push
```

## 7. Resolve Addressed Comments

For each inline comment that was addressed with a code change, reply to that specific comment indicating it's been fixed. This helps reviewers track which comments have been resolved.

```bash
# Reply to a specific comment (resolves the thread)
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments/{comment_id}/replies \
  -f body="Fixed in commit $(git rev-parse --short HEAD). [describe the fix briefly]"
```

To find comment IDs and reply to them:

```bash
# Get comment details including IDs
gh api repos/{owner}/{repo}/pulls/{number}/comments \
  --jq '.[] | {id: .id, path: .path, line: (.line // .original_line), body: .body}'
```

## 8. Respond to PR

Post a summary comment on the PR:

```bash
gh pr comment --body "$(cat <<'EOF'
## PR Feedback Addressed

### Changes Made
- **Issue 1**: [Brief description of what was fixed] - replied to comment
- **Issue 2**: [Brief description of what was fixed] - replied to comment

### Not Addressed (with reasoning)
- **Issue X**: [Reason - e.g., "This is intentional because...", "Out of scope for this PR", "Would introduce unnecessary complexity"]

### Questions/Clarifications
- **Question Y**: [Response or request for more details]

---
Ready for re-review.
EOF
)"
```

## Guidelines

- **Be thorough but judicious**: Address legitimate concerns, but don't blindly accept every suggestion
- **Explain your reasoning**: When not addressing feedback, provide clear justification
- **Keep changes focused**: Only change what's necessary to address the feedback
- **Maintain code quality**: Don't introduce new issues while fixing others
- **Communicate clearly**: The PR comment should make it easy for reviewers to verify changes
