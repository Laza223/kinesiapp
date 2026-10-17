#!/usr/bin/env bash
# Postgres 16 efímero para tests de integración y desarrollo, sin Docker.
#
#   bash scripts/db/local-pg.sh up     # crea (si hace falta) y arranca en 127.0.0.1:54322
#   bash scripts/db/local-pg.sh down   # lo detiene (los datos quedan en .tmp/pg16)
#
# Superusuario local: postgres / postgres. Solo escucha en loopback.
# initdb se niega a correr como root: en ese caso todo pasa por `runuser -u postgres`.
set -euo pipefail

PORT="${PGPORT_LOCAL:-54322}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DATA="$ROOT/.tmp/pg16"
BIN="${PG_BIN:-$(pg_config --bindir 2>/dev/null || echo /usr/lib/postgresql/16/bin)}"
[ -x "$BIN/initdb" ] || BIN=/usr/lib/postgresql/16/bin

as_pg() {
  if [ "$(id -u)" = "0" ]; then runuser -u postgres -- "$@"; else "$@"; fi
}

case "${1:-}" in
  up)
    mkdir -p "$DATA"
    [ "$(id -u)" = "0" ] && chown -R postgres:postgres "$ROOT/.tmp"
    if [ ! -f "$DATA/PG_VERSION" ]; then
      PWFILE="$(mktemp)"
      echo postgres > "$PWFILE"
      [ "$(id -u)" = "0" ] && chown postgres "$PWFILE"
      as_pg "$BIN/initdb" -D "$DATA" -U postgres --auth-host=scram-sha-256 --auth-local=trust \
        --pwfile="$PWFILE" --encoding=UTF8 --locale=C.UTF-8 >/dev/null
      rm -f "$PWFILE"
    fi
    if as_pg "$BIN/pg_ctl" -D "$DATA" status >/dev/null 2>&1; then
      echo "Postgres ya estaba corriendo en 127.0.0.1:$PORT"
    else
      as_pg "$BIN/pg_ctl" -D "$DATA" -l "$DATA/server.log" -w \
        -o "-p $PORT -c listen_addresses=127.0.0.1 -c unix_socket_directories=$DATA" start >/dev/null
      echo "Postgres arriba en 127.0.0.1:$PORT"
    fi
    ;;
  down)
    if [ -f "$DATA/PG_VERSION" ]; then
      as_pg "$BIN/pg_ctl" -D "$DATA" -m fast stop >/dev/null 2>&1 || true
    fi
    echo "Postgres detenido"
    ;;
  *)
    echo "uso: $0 up|down" >&2
    exit 1
    ;;
esac
