#!/usr/bin/env bash
#
# Start dev servers with auto-assigned ports based on worktree name.
#
# Usage:
#   pnpm dev              # Start api + web for this worktree
#
# Ports are calculated from worktree name (deterministic hash).
# Main worktree uses default ports, other worktrees get unique offsets.
#
# Shared services (db, face) run in Docker.
# Per-worktree services (api, web) run locally.
#

set -e

# Track background PIDs for cleanup
PIDS=()

# Cleanup function to kill all background processes
cleanup() {
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
}

# Trap signals to ensure cleanup on exit
trap cleanup EXIT INT TERM

cd "$(dirname "$0")/.."
source scripts/_common.sh

# Pre-flight checks
if [[ ! -d "node_modules" ]]; then
  error "Run pnpm install first"
fi

# Ensure Docker is running
if ! docker info &> /dev/null; then
  error "Docker is not running"
fi

# Start PostgreSQL if needed (shared service on port 5433)
if docker compose ps db 2>/dev/null | grep -q "running"; then
  info "PostgreSQL running"
else
  EXISTING_PG=$(docker ps --filter "publish=5433" --format "{{.Names}}" 2>/dev/null || true)
  if [[ -n "$EXISTING_PG" && "$EXISTING_PG" == *"praapt"*"db"* ]]; then
    info "Reusing PostgreSQL ($EXISTING_PG)"
  elif [[ -n "$EXISTING_PG" ]]; then
    error "Port 5433 in use by $EXISTING_PG"
  else
    warn "Starting PostgreSQL..."
    docker compose up db -d
    until docker compose exec -T db pg_isready -U postgres &> /dev/null; do
      sleep 1
    done
    info "PostgreSQL started"
  fi
fi

# Start face service if needed (shared service on port 8001)
if docker compose ps face 2>/dev/null | grep -q "running"; then
  info "Face service running"
else
  EXISTING_FACE=$(docker ps --filter "publish=8001" --format "{{.Names}}" 2>/dev/null || true)
  if [[ -n "$EXISTING_FACE" && "$EXISTING_FACE" == *"praapt"*"face"* ]]; then
    info "Reusing face service ($EXISTING_FACE)"
  elif [[ -n "$EXISTING_FACE" ]]; then
    error "Port 8001 in use by $EXISTING_FACE"
  else
    warn "Building & starting face service..."
    docker compose up face -d --build
    # Wait for face service to be ready
    for i in {1..60}; do
      if curl -s "http://localhost:8001/health" &> /dev/null; then
        break
      fi
      sleep 1
    done
    info "Face service started"
  fi
fi

# Calculate port offset from worktree name
WORKTREE=$(get_worktree_name)
OFFSET=$(get_port_offset)

# Calculate ports
API_PORT=$((3000 + OFFSET))
WEB_PORT=$((5173 + OFFSET))

info "Worktree '$WORKTREE' → offset $OFFSET"

# Kill any process using a given port
kill_port() {
  local port=$1
  local pids
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    for pid in $pids; do
      kill "$pid" 2>/dev/null || true
    done
    warn "Killed process(es) on port $port"
  fi
}

# Kill existing processes on our ports
kill_port "$API_PORT"
kill_port "$WEB_PORT"

# Get local network IP for mobile testing
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo "")

# Display URLs
echo ""
echo "  === Dev Servers ==="
echo "  Web: http://localhost:$WEB_PORT"
if [[ -n "$LOCAL_IP" ]]; then
  echo "  Web (network): http://$LOCAL_IP:$WEB_PORT"
fi
echo "  API: http://localhost:$API_PORT"
echo ""
echo "  === Shared Services (Docker) ==="
echo "  PostgreSQL: localhost:5433"
echo "  Face Service: http://localhost:8001"
echo ""

# Start API dev server
API_URL="http://localhost:$API_PORT"
PORT=$API_PORT pnpm --filter @praapt/api run dev &
PIDS+=($!)

# Start Web dev server (foreground - keeps script alive)
VITE_API_URL="${API_URL}/api" pnpm --filter @praapt/web run dev -- --port "$WEB_PORT"
