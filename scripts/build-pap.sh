#!/usr/bin/env bash
set -e

# Garante que pnpm instalado via npm global tenha prioridade sobre versão do sistema.
# Necessário no Vercel CI onde pnpm 6.x do sistema pode estar antes de /usr/local/bin.
NPM_GLOBAL_BIN="$(npm prefix -g)/bin"
export PATH="$NPM_GLOBAL_BIN:$PATH"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/aliancapanorama-src"
OUT="$ROOT/aliancapanorama"

echo "==> Verificando pnpm..."
pnpm --version

echo "==> Instalando dependências..."
cd "$SRC"
pnpm install --no-frozen-lockfile --ignore-scripts=false

echo "==> Buildando frontend PAP..."
BASE_PATH=/aliancapanorama/ PORT=3000 NODE_ENV=production \
  pnpm --filter @workspace/pap run build

echo "==> Copiando output para $OUT..."
rm -rf "$OUT"
mkdir -p "$OUT"
cp -r "$SRC/artifacts/pap/dist/public/." "$OUT/"

echo "==> PAP build concluído em /aliancapanorama/"
