Agent Guidance

Canonical instructions live in LLM_INSTRUCTIONS.md. Agents should read that file first, then operate using the search→open→expand workflow described there. Respect .llmignore to avoid scanning heavy/irrelevant paths.

- Primary: ./LLM_INSTRUCTIONS.md
- Ignore hints: ./.llmignore

If your client does not automatically read this file, include this one‑liner in your first message to the agent:

"Please read ./LLM_INSTRUCTIONS.md first and follow it for minimal, targeted file access."

