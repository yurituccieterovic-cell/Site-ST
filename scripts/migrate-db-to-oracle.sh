#!/usr/bin/env bash
# migrate-db-to-oracle.sh — Migrar dados do Railway PostgreSQL para Oracle Always Free
#
# Uso:
#   SOURCE_URL="postgresql://..." ORACLE_IP="x.x.x.x" bash migrate-db-to-oracle.sh
#
# O que faz:
#   1. Dump completo do Railway (schema + dados)
#   2. Transfere via SCP para o Oracle
#   3. Restaura no PostgreSQL do Oracle
#   4. Verifica integridade

set -euo pipefail
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[MIGRATE]${NC} $*"; }
warn()  { echo -e "${YELLOW}[MIGRATE]${NC} $*"; }
error() { echo -e "${RED}[MIGRATE]${NC} $*" >&2; exit 1; }

# Carrega secrets
source "${HOME}/.pap-secrets" 2>/dev/null || source "/root/.pap-secrets" 2>/dev/null || true

SOURCE_URL="${SOURCE_URL:-${DATABASE_URL:-}}"
ORACLE_IP="${ORACLE_IP:-}"
ORACLE_SSH_KEY="${ORACLE_SSH_KEY:-$HOME/.ssh/oracle_key}"
DUMP_FILE="/tmp/pap-railway-dump-$(date +%Y%m%d-%H%M).sql"

[[ -z "$SOURCE_URL" ]] && error "SOURCE_URL não configurado (banco Railway)"
[[ -z "$ORACLE_IP" ]] && error "ORACLE_IP não configurado"

info "Migração Railway → Oracle"
info "Fonte: $SOURCE_URL"
info "Destino: ubuntu@$ORACLE_IP"
echo ""

# 1. Dump do Railway
info "1/4 Fazendo dump do Railway..."
pg_dump "$SOURCE_URL" \
  --no-acl --no-owner \
  --format=plain \
  --file="$DUMP_FILE"
DUMP_SIZE=$(du -sh "$DUMP_FILE" | cut -f1)
info "Dump concluído: $DUMP_FILE ($DUMP_SIZE)"

# 2. Transferir para Oracle
info "2/4 Transferindo para Oracle..."
scp -i "$ORACLE_SSH_KEY" \
  "$DUMP_FILE" \
  "ubuntu@$ORACLE_IP:/tmp/pap-dump.sql"
info "Transferência concluída"

# 3. Restaurar no Oracle
info "3/4 Restaurando no Oracle PostgreSQL..."
# shellcheck disable=SC2087
ssh -i "$ORACLE_SSH_KEY" "ubuntu@$ORACLE_IP" << 'REMOTE'
set -euo pipefail
# O PostgreSQL roda dentro do Docker
docker exec pap-db psql -U pap -d postgres -c "DROP DATABASE IF EXISTS pap;" 2>/dev/null || true
docker exec pap-db psql -U pap -d postgres -c "CREATE DATABASE pap;" 2>/dev/null || true
docker cp /tmp/pap-dump.sql pap-db:/tmp/pap-dump.sql
docker exec pap-db psql -U pap -d pap -f /tmp/pap-dump.sql
echo "Restauração concluída"
REMOTE

# 4. Verificar contagens de tabelas
info "4/4 Verificando integridade..."
REMOTE_COUNT=$(ssh -i "$ORACLE_SSH_KEY" "ubuntu@$ORACLE_IP" \
  "docker exec pap-db psql -U pap -d pap -t -c \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';\"" \
  | tr -d ' ')

LOCAL_COUNT=$(psql "$SOURCE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')

info "Tabelas no Railway: $LOCAL_COUNT"
info "Tabelas no Oracle:  $REMOTE_COUNT"

if [[ "$LOCAL_COUNT" == "$REMOTE_COUNT" ]]; then
  echo ""
  echo -e "${GREEN}✓ Migração concluída com sucesso!${NC}"
  echo ""
  echo "Próximo passo: atualize o DATABASE_URL no Railway para apontar para o Oracle"
  echo "(ou atualize o .env.oracle no Oracle e reinicie o container)"
else
  warn "Número de tabelas diferente — verifique manualmente"
fi

rm -f "$DUMP_FILE"
