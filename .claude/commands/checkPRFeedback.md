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

## 3. Analyze and Triage Feedback

Analyze each piece of feedback and decide whether to address it:

**Address automatically** (no user confirmation needed):
- Security issues, bugs, broken functionality
- Missing error handling, null checks, edge cases
- Type safety improvements (removing unsafe casts, adding validation)
- Legitimate code quality concerns
- Inconsistencies with project patterns
- Dead code removal
- Reasonable refactors that improve clarity

**Push back on** (consult user before skipping):
- Changes that would introduce unnecessary complexity
- Suggestions based on misunderstanding of the code
- Changes that conflict with project conventions
- Out of scope changes (belongs in a separate PR)
- Purely stylistic preferences with no clear benefit
- Performance optimizations without demonstrated need

If you plan to NOT address certain feedback, present those items to the user with your reasoning and ask for confirmation before proceeding. For example:

"I plan to skip the following feedback:
- **Issue X**: [Your reasoning why this shouldn't be addressed]
- **Issue Y**: [Your reasoning]

Should I proceed, or would you like me to address any of these?"

## 4. Address Feedback

For each issue being addressed:

1. Read the relevant file(s)
2. Understand the context and the reviewer's concern
3. Make the appropriate fix
4. Keep changes minimal and focused

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

- **Act autonomously on reasonable feedback**: Don't ask permission to fix legitimate issues - just fix them
- **Consult before skipping**: Only ask the user when you plan to NOT address feedback
- **Be thorough but judicious**: Address legitimate concerns, but don't blindly accept every suggestion
- **Explain your reasoning**: When not addressing feedback, provide clear justification
- **Keep changes focused**: Only change what's necessary to address the feedback
- **Maintain code quality**: Don't introduce new issues while fixing others
- **Communicate clearly**: The PR comment should make it easy for reviewers to verify changes
- **Push back professionally**: When declining feedback, be respectful but firm with clear technical reasoning
