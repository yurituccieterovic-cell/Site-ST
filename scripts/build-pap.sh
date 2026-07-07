#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/aliancapanorama-src"
OUT="$ROOT/aliancapanorama"

echo "==> Instalando pnpm@9..."
npm install -g pnpm@9 --silent --force

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
