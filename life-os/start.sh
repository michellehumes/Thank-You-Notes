#!/bin/bash
# Life OS launcher — works around Node.js v25 bug where require() hangs
# when CWD contains spaces. We launch node from /tmp with explicit paths.
REAL_DIR="$(cd "$(dirname "$0")" && pwd)"

case "${1:-start}" in
  init-db)
    cd /tmp
    node "$REAL_DIR/scripts/init-db.js"
    ;;
  start|"")
    echo "Life OS starting..."
    echo "Dashboard: http://127.0.0.1:3045/dashboard/"
    cd /tmp
    node "$REAL_DIR/server.js"
    ;;
  *)
    echo "Usage: ./start.sh [start|init-db]"
    ;;
esac
