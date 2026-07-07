#!/usr/bin/env bash
# smoke-test.sh — Smoke tests contra Railway (prod) ou localhost
# Uso: bash scripts/smoke-test.sh [--local]
# Requer: curl, jq

set -euo pipefail

BASE="${1:-https://site-st-production.up.railway.app}"
AI_KEY="C6tleNqjwMEDLzkyKL22XssePZqeqCeBD0G6ebvf2JU"
PASS=0; FAIL=0

ok()   { echo "  [OK]  $1"; ((PASS++)) || true; }
fail() { echo "  [FAIL] $1"; ((FAIL++)) || true; }
hdr()  { echo; echo "=== $1 ==="; }

check() {
  local label="$1" url="$2" expected_status="$3"
  shift 3
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" "$@")
  if [ "$http_code" = "$expected_status" ]; then
    ok "$label → $http_code"
  else
    fail "$label → esperado $expected_status, obteve $http_code"
  fi
}

check_body() {
  local label="$1" url="$2" pattern="$3"
  shift 3
  local body
  body=$(curl -s "$url" "$@")
  if echo "$body" | grep -q "$pattern"; then
    ok "$label → contém '$pattern'"
  else
    fail "$label → '$pattern' não encontrado em: ${body:0:200}"
  fi
}

# ── Health ────────────────────────────────────────────────────────────────────
hdr "Health"
check "GET /api/healthz" "$BASE/api/healthz" 200
check_body "healthz.status" "$BASE/api/healthz" '"status"'

# ── Auth ──────────────────────────────────────────────────────────────────────
hdr "Auth"
check "POST /api/auth/login (sem body)" "$BASE/api/auth/login" 400 -X POST -H "Content-Type: application/json" -d "{}"
check "POST /api/auth/login (credenciais erradas)" "$BASE/api/auth/login" 401 \
  -X POST -H "Content-Type: application/json" \
  -d '{"login":"ninguem","password":"errada"}'

# Login como aluno1 e salvar cookie
COOKIE_JAR=$(mktemp)
LOGIN_STATUS=$(curl -s -o /tmp/login_body.txt -w "%{http_code}" \
  -c "$COOKIE_JAR" \
  -X POST -H "Content-Type: application/json" \
  -d '{"login":"aluno1","password":"pap"}' \
  "$BASE/api/auth/login")

if [ "$LOGIN_STATUS" = "200" ]; then
  ok "POST /api/auth/login (aluno1) → $LOGIN_STATUS"
else
  fail "POST /api/auth/login (aluno1) → $LOGIN_STATUS (body: $(cat /tmp/login_body.txt | head -c 200))"
fi

# ── Nodes (sem sessão → tier 0, acesso restrito) ─────────────────────────────
hdr "Nodes"
# tier 0 (guest sem login) não vê nós — array vazio é comportamento correto
check_body "GET /api/nodes (sem auth, tier 0)" "$BASE/api/nodes" "\[\]"
check_body "GET /api/nodes/1 (Ciências)" "$BASE/api/nodes/1" '"title"'
# código inexistente retorna 403 ou 404 (tier 0 recebe 403)
HTTP_NOTEXIST=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/nodes/XXXNOTEXIST")
if [[ "$HTTP_NOTEXIST" == "404" || "$HTTP_NOTEXIST" == "403" ]]; then
  ok "GET /api/nodes/XXXNOTEXIST → $HTTP_NOTEXIST (403 ou 404)"
else
  fail "GET /api/nodes/XXXNOTEXIST → $HTTP_NOTEXIST (esperado 403 ou 404)"
fi

# ── Nodes com sessão (tier 1) ─────────────────────────────────────────────────
hdr "Nodes (autenticado)"
# tier 1 acessa subnós (ex: /nodes?parentCode=1) — root sem parentCode lista nós level=0
# que incluem "0" (Conhecimento Humano) acessível com canAccess
check_body "GET /api/nodes/1 (Ciências, autenticado)" "$BASE/api/nodes/1" '"code"' -b "$COOKIE_JAR"
check_body "GET /api/nodes?parentCode=1 (filhos Ciências)" "$BASE/api/nodes?parentCode=1" '"code"' -b "$COOKIE_JAR"

# ── Progress ─────────────────────────────────────────────────────────────────
hdr "Progress"
check "GET /api/progress (sem auth)" "$BASE/api/progress" 401
check_body "GET /api/progress (com auth)" "$BASE/api/progress" "explorationPercent" -b "$COOKIE_JAR"
check_body "GET /api/summary (com auth)" "$BASE/api/summary" "nodesExplored" -b "$COOKIE_JAR"
check_body "GET /api/progress/weekly-score" "$BASE/api/progress/weekly-score" "\[" -b "$COOKIE_JAR"
check_body "GET /api/score" "$BASE/api/score" '"score"' -b "$COOKIE_JAR"
check_body "GET /api/achievements" "$BASE/api/achievements" "\[" -b "$COOKIE_JAR"

# ── Exercises ─────────────────────────────────────────────────────────────────
hdr "Exercises"
check "GET /api/exercises (sem auth)" "$BASE/api/exercises?nodeCode=131" 401
check "GET /api/exercises (sem nodeCode)" "$BASE/api/exercises" 400 -b "$COOKIE_JAR"

# ── Collective Memory ─────────────────────────────────────────────────────────
hdr "Collective Memory"
check_body "GET /api/collective (público)" "$BASE/api/collective" "entries"
check "POST /api/collective (sem auth)" "$BASE/api/collective" 401 \
  -X POST -H "Content-Type: application/json" \
  -d '{"content":"teste"}'
# POST com AI_API_KEY (ISA)
POST_STATUS=$(curl -s -o /tmp/coll_body.txt -w "%{http_code}" \
  -X POST -H "Content-Type: application/json" \
  -H "x-api-key: $AI_KEY" \
  -d '{"content":"[smoke-test] ISA posting to collective memory — ignorar"}' \
  "$BASE/api/collective")
if [ "$POST_STATUS" = "200" ]; then
  ok "POST /api/collective (ISA x-api-key) → $POST_STATUS"
else
  fail "POST /api/collective (ISA) → $POST_STATUS ($(cat /tmp/coll_body.txt | head -c 200))"
fi
# POST com sessão humana (o bug estava aqui)
POST_HUMAN=$(curl -s -o /tmp/coll_human.txt -w "%{http_code}" \
  -b "$COOKIE_JAR" \
  -X POST -H "Content-Type: application/json" \
  -d '{"content":"[smoke-test] Aluno1 posting — ignorar"}' \
  "$BASE/api/collective")
if [ "$POST_HUMAN" = "200" ]; then
  ok "POST /api/collective (aluno1 humano) → $POST_HUMAN  [bug coletivo corrigido ✓]"
else
  fail "POST /api/collective (aluno1) → $POST_HUMAN ($(cat /tmp/coll_human.txt | head -c 200))"
fi

# ── Assembly ──────────────────────────────────────────────────────────────────
hdr "Assembly"
check_body "GET /api/assembly/status (público)" "$BASE/api/assembly/status" '"agents"'
check_body "GET /api/assembly/playcenter (público)" "$BASE/api/assembly/playcenter" '"messages"'
check "GET /api/assembly/agents (sem auth)" "$BASE/api/assembly/agents" 401
check_body "GET /api/assembly/agents (ISA)" "$BASE/api/assembly/agents" '"agents"' \
  -H "x-api-key: $AI_KEY"

# ── ISA ───────────────────────────────────────────────────────────────────────
hdr "ISA"
check "GET /api/isa/memory (sem auth)" "$BASE/api/isa/memory" 401
check_body "GET /api/isa/memory (com auth)" "$BASE/api/isa/memory" "\[" -b "$COOKIE_JAR"

# ── Sitemap ───────────────────────────────────────────────────────────────────
hdr "Sitemap"
check_body "GET /api/sitemap.xml" "$BASE/api/sitemap.xml" "urlset"

# ── Cleanup ───────────────────────────────────────────────────────────────────
rm -f "$COOKIE_JAR" /tmp/login_body.txt /tmp/coll_body.txt /tmp/coll_human.txt

# ── Resultado ─────────────────────────────────────────────────────────────────
echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  RESULTADO: $PASS OK | $FAIL FAIL"
echo "  Base: $BASE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ "$FAIL" -eq 0 ] && exit 0 || exit 1
