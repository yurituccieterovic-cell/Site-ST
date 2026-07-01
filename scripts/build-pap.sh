#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/aliancapanorama-src"
OUT="$ROOT/aliancapanorama"

echo "==> Instalando pnpm..."
if ! command -v pnpm &>/dev/null; then
  npm install -g pnpm --silent
fi

echo "==> Instalando dependências..."
cd "$SRC"
pnpm install --frozen-lockfile

echo "==> Buildando frontend PAP..."
BASE_PATH=/aliancapanorama/ PORT=3000 NODE_ENV=production \
  pnpm --filter @workspace/pap run build

echo "==> Copiando output para $OUT..."
rm -rf "$OUT"
mkdir -p "$OUT"
cp -r "$SRC/artifacts/pap/dist/public/." "$OUT/"

echo "==> PAP build concluído em /aliancapanorama/"
