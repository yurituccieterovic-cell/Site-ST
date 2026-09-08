#!/usr/bin/env bash
# import-rodar-dump.sh — Importa pg_dump do RODAR (Replit) para banco Neon
# Uso: ./import-rodar-dump.sh <arquivo.dump>
#
# Requer: NEON_RODAR_URL ou NEON_DATABASE_URL em .pap-secrets
# O dump deve ser gerado no Replit Shell com:
#   pg_dump $DATABASE_URL -Fc > rodar-backup-$(date +%Y%m%d).dump

set -euo pipefail

DUMP_FILE="${1:-}"
if [[ -z "$DUMP_FILE" ]]; then
  echo "Uso: $0 <arquivo.dump>"
  echo "Exemplo: $0 rodar-backup-20260908.dump"
  exit 1
fi

if [[ ! -f "$DUMP_FILE" ]]; then
  echo "Arquivo não encontrado: $DUMP_FILE"
  exit 1
fi

# Carregar secrets
SECRETS_FILE="/root/.pap-secrets"
if [[ -f "$SECRETS_FILE" ]]; then
  # shellcheck disable=SC1090
  source <(grep -v '^#' "$SECRETS_FILE" | sed 's/^/export /')
fi

TARGET_DB="${NEON_RODAR_URL:-${NEON_DATABASE_URL:-}}"
if [[ -z "$TARGET_DB" ]]; then
  echo "ERRO: defina NEON_RODAR_URL ou NEON_DATABASE_URL em /root/.pap-secrets"
  exit 1
fi

echo "=== Import RODAR → Neon ==="
echo "Arquivo: $DUMP_FILE"
echo "Tamanho: $(du -sh "$DUMP_FILE" | cut -f1)"
SHA256=$(sha256sum "$DUMP_FILE" | awk '{print $1}')
echo "SHA256:  $SHA256"
echo ""

# Verificar se pg_restore está disponível
if ! command -v pg_restore &>/dev/null; then
  echo "pg_restore não encontrado — tentando psql com SQL puro..."
  # Se o dump for .sql (texto), usar psql diretamente
  if file "$DUMP_FILE" | grep -q "text"; then
    psql "$TARGET_DB" < "$DUMP_FILE"
  else
    echo "ERRO: pg_restore necessário para formato binário (-Fc)"
    echo "Instalar: apt-get install postgresql-client"
    exit 1
  fi
else
  echo "Restaurando com pg_restore (sem --clean para não apagar dados existentes)..."
  pg_restore \
    --no-owner \
    --no-privileges \
    --if-exists \
    -d "$TARGET_DB" \
    "$DUMP_FILE" \
    2>&1 | tail -20
fi

echo ""
echo "=== Verificando contagens ==="
psql "$TARGET_DB" -c "
SELECT
  'assembleia_sessions' AS tabela, COUNT(*) AS linhas FROM assembleia_sessions
UNION ALL SELECT 'arvore_chat', COUNT(*) FROM arvore_chat
UNION ALL SELECT 'clube_messages', COUNT(*) FROM clube_messages
UNION ALL SELECT 'arvore_memoria', COUNT(*) FROM arvore_memoria
;" 2>/dev/null || echo "(tabelas ainda não existem — verifique o dump)"

echo ""
echo "=== Manifest gerado ==="
MANIFEST_FILE="rodar-manifest-$(date +%Y%m%d-%H%M).json"
cat > "$MANIFEST_FILE" <<EOF
{
  "arquivo": "$DUMP_FILE",
  "sha256": "$SHA256",
  "tamanho_bytes": $(wc -c < "$DUMP_FILE"),
  "importado_em": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "destino": "neon",
  "status": "importado"
}
EOF
echo "Salvo em: $MANIFEST_FILE"
echo ""
echo "✅ Import concluído. Verificar dados antes de desligar o Replit."
echo "   Manter backup por 30 dias após validação."
