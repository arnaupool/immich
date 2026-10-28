#!/usr/bin/env bash
# install: pnpm dependencies for the web (and the SDK it builds from source).
# start: stock Immich in Docker, then the fork's web dev server on port 3360.
set -euo pipefail
cd "$(dirname "$0")/../.."
log=/tmp/immich-360-web.log
pnpm="npx -y pnpm@11.27.1"

case "${1:-start}" in
  install)
    $pnpm install --frozen-lockfile --filter immich-web...
    $pnpm --filter @immich/sdk build
    ;;
  start)
    docker compose -f .devcontainer/360-test/docker-compose.yml up -d
    cd web
    IMMICH_SERVER_URL=http://localhost:2283/ nohup $pnpm exec vite dev --host 0.0.0.0 --port 3360 --strictPort > "$log" 2>&1 &
    echo "web: http://localhost:3360 (log in $log)"
    ;;
esac
