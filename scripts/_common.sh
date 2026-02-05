#!/usr/bin/env bash
#
# Shared utilities for scripts.
# Source this file, don't execute it directly.
#

# Colors
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[0;33m'
export CYAN='\033[0;36m'
export NC='\033[0m'

# Logging helpers
info() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}!${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }

# Get the current worktree name (directory name of git root)
get_worktree_name() {
  basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
}

# Calculate port offset from worktree name (deterministic hash)
# Returns offset in increments of 10 (0, 10, 20, ... 990)
# Uses worktree name so ports stay consistent regardless of branch
get_port_offset() {
  local worktree="${1:-$(get_worktree_name)}"
  if [[ "$worktree" == "main" || "$worktree" == "master" || "$worktree" == "praapt" ]]; then
    echo "0"
  else
    echo $(( $(echo "$worktree" | cksum | cut -d' ' -f1) % 100 * 10 ))
  fi
}

# Export functions for use in subshells
export -f info warn error get_worktree_name get_port_offset
