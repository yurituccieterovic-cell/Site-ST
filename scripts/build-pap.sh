#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/aliancapanorama-src"
OUT="$ROOT/aliancapanorama"

echo "==> Ativando pnpm@9 via corepack..."
corepack enable
corepack prepare pnpm@9.15.9 --activate 2>/dev/null || npm install -g pnpm@9.15.9 --silent --force
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
