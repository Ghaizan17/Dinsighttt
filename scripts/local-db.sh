#!/usr/bin/env bash
# Menjalankan MySQL/MariaDB khusus untuk development lokal, tanpa perlu root.
# Data disimpan di .localdb/ (di-gitignore), port default 3307.
#
# Pemakaian:
#   bash scripts/local-db.sh start   (atau: npm run db:local)
#   bash scripts/local-db.sh stop    (atau: npm run db:stop)
#   bash scripts/local-db.sh status
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE="$ROOT/.localdb"
DATA_DIR="$BASE/data"
SOCK="$BASE/mysql.sock"
PID_FILE="$BASE/mysqld.pid"
LOG="$BASE/mysqld.log"
PORT="${DB_PORT:-3307}"
DB_NAME="${DB_NAME:-dinsight}"

MYSQLD="$(command -v mysqld || command -v mariadbd || true)"
INSTALL_DB="$(command -v mariadb-install-db || command -v mysql_install_db || true)"
CLIENT="$(command -v mariadb || command -v mysql || true)"
ADMIN="$(command -v mariadb-admin || command -v mysqladmin || true)"

fail() { echo "[local-db] $*" >&2; exit 1; }

alive() {
  [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE" 2>/dev/null)" 2>/dev/null
}

case "${1:-start}" in
  start)
    [ -n "$MYSQLD" ] || fail "mysqld/mariadbd tidak ditemukan. Install MariaDB/MySQL dulu."
    [ -n "$INSTALL_DB" ] || fail "mariadb-install-db tidak ditemukan."
    mkdir -p "$BASE"

    if alive; then
      echo "[local-db] sudah berjalan (pid $(cat "$PID_FILE")), port $PORT"
    else
      if [ ! -d "$DATA_DIR/mysql" ]; then
        echo "[local-db] inisialisasi data directory pertama kali..."
        "$INSTALL_DB" --no-defaults --datadir="$DATA_DIR" \
          --auth-root-authentication-method=normal --skip-test-db >/dev/null 2>&1 \
          || fail "gagal inisialisasi datadir"
      fi
      echo "[local-db] menjalankan server di 127.0.0.1:$PORT ..."
      nohup "$MYSQLD" --no-defaults --datadir="$DATA_DIR" --port="$PORT" \
        --socket="$SOCK" --pid-file="$PID_FILE" --bind-address=127.0.0.1 \
        --skip-log-bin >"$LOG" 2>&1 &
      for _ in $(seq 1 40); do
        if "$CLIENT" --protocol=TCP -h127.0.0.1 -P"$PORT" -uroot -e "SELECT 1" >/dev/null 2>&1; then break; fi
        sleep 0.5
      done
      "$CLIENT" --protocol=TCP -h127.0.0.1 -P"$PORT" -uroot -e "SELECT 1" >/dev/null 2>&1 \
        || fail "server tidak merespons, cek $LOG"
    fi

    "$CLIENT" --protocol=TCP -h127.0.0.1 -P"$PORT" -uroot \
      -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4" 
    echo "[local-db] siap. Database '$DB_NAME' di 127.0.0.1:$PORT (user: root, tanpa password)"
    echo "[local-db] MYSQL_URL=mysql://root@127.0.0.1:$PORT/$DB_NAME"
    ;;

  stop)
    if alive; then
      PID="$(cat "$PID_FILE")"
      "$ADMIN" --protocol=TCP -h127.0.0.1 -P"$PORT" -uroot shutdown >/dev/null 2>&1 \
        || kill "$PID" 2>/dev/null || true
      for _ in $(seq 1 20); do alive || break; sleep 0.5; done
      rm -f "$PID_FILE"
      echo "[local-db] dihentikan."
    else
      echo "[local-db] tidak sedang berjalan."
    fi
    ;;

  status)
    if alive; then
      echo "[local-db] berjalan (pid $(cat "$PID_FILE")) di 127.0.0.1:$PORT"
      "$CLIENT" --protocol=TCP -h127.0.0.1 -P"$PORT" -uroot -e "SHOW DATABASES" 2>/dev/null || true
    else
      echo "[local-db] tidak berjalan."
    fi
    ;;

  *) fail "perintah tidak dikenal: $1 (pakai start|stop|status)" ;;
esac
