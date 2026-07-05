#!/usr/bin/env bash
# dev-local.sh — Setup e start do ambiente de desenvolvimento local PAP
# Uso: bash scripts/dev-local.sh [setup|start|stop|reset|db]
# Requer: Docker + Docker Compose v2

set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MONOREPO="$REPO_ROOT/aliancapanorama-src"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[PAP-DEV]${NC} $*"; }
warn()  { echo -e "${YELLOW}[PAP-DEV]${NC} $*"; }
error() { echo -e "${RED}[PAP-DEV]${NC} $*" >&2; exit 1; }

check_docker() {
  command -v docker &>/dev/null || error "Docker não encontrado. Instale em https://docs.docker.com/get-docker/"
  docker info &>/dev/null 2>&1 || error "Docker daemon não está rodando. Inicie o Docker."
}

cmd_setup() {
  info "Configurando ambiente local..."

  check_docker

  # Criar .env.local se não existir
  if [[ ! -f "$MONOREPO/.env.local" ]]; then
    cp "$MONOREPO/.env.local.example" "$MONOREPO/.env.local"
    warn ".env.local criado a partir de .env.local.example"
    warn "Edite $MONOREPO/.env.local e preencha as chaves de API antes de usar"
  else
    info ".env.local já existe — não sobrescrevendo"
  fi

  # Instalar dependências localmente (para IDEs/linters)
  cd "$MONOREPO"
  if command -v pnpm &>/dev/null; then
    info "Instalando dependências pnpm..."
    pnpm install
  else
    warn "pnpm não encontrado localmente — dependências só instaladas dentro do Docker"
  fi

  info "Setup concluído. Rode: bash scripts/dev-local.sh start"
}

cmd_start() {
  check_docker
  cd "$MONOREPO"

  [[ -f ".env.local" ]] || error ".env.local não encontrado. Rode: bash scripts/dev-local.sh setup"

  info "Subindo banco de dados local..."
  docker compose -f docker-compose.dev.yml up -d db

  info "Aguardando PostgreSQL ficar pronto..."
  until docker exec pap-db-local pg_isready -U pap -d pap &>/dev/null; do
    sleep 1
  done

  info "Rodando migrações no banco local..."
  DATABASE_URL="postgresql://pap:pap@localhost:5433/pap" \
    pnpm --filter @workspace/db run push 2>/dev/null || \
    warn "drizzle-kit push falhou — banco pode já estar atualizado"

  info "Subindo API e frontend..."
  docker compose -f docker-compose.dev.yml up -d api frontend

  echo ""
  info "Ambiente local no ar:"
  info "  Frontend: http://localhost:5173"
  info "  API:      http://localhost:8080"
  info "  Banco:    postgresql://pap:pap@localhost:5433/pap"
  info "  Logs:     docker compose -f docker-compose.dev.yml logs -f"
}

cmd_stop() {
  check_docker
  cd "$MONOREPO"
  info "Parando containers locais..."
  docker compose -f docker-compose.dev.yml down
  info "Containers parados. Dados do banco preservados."
}

cmd_reset() {
  check_docker
  cd "$MONOREPO"
  warn "Isso vai APAGAR todos os dados do banco local!"
  read -rp "Confirmar? (s/N): " confirm
  [[ "$confirm" == "s" || "$confirm" == "S" ]] || { info "Cancelado."; exit 0; }
  docker compose -f docker-compose.dev.yml down -v
  info "Reset completo. Rode: bash scripts/dev-local.sh start"
}

cmd_db() {
  check_docker
  info "Abrindo psql no banco local..."
  docker exec -it pap-db-local psql -U pap -d pap
}

CMD="${1:-start}"
case "$CMD" in
  setup)  cmd_setup ;;
  start)  cmd_start ;;
  stop)   cmd_stop ;;
  reset)  cmd_reset ;;
  db)     cmd_db ;;
  *)      echo "Uso: $0 [setup|start|stop|reset|db]"; exit 1 ;;
esac
