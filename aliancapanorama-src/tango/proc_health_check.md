# proc_health_check.md — Health Check de Todos os Sistemas
### Executar automaticamente no #pap · Atualizado: 2026-07-07 · Sessão 26b

---

## Checklist de Saúde — rodar a cada sessão

### 1. Vercel (Frontend PAP)
```bash
curl -s -o /dev/null -w "%{http_code}" https://site-st.vercel.app/aliancapanorama/
# Esperado: 200. Se 4xx/5xx → ver seção de fix abaixo.
```
**Pontos de falha comuns:**
- `pnpm install --frozen-lockfile` → trocar por `--no-frozen-lockfile` em `scripts/build-pap.sh`
- Lockfile desatualizado → `pnpm install --no-frozen-lockfile` local + commit do `pnpm-lock.yaml`
- Nova rota SPA sem rewrite → adicionar em `vercel.json` (fonte: `/aliancapanorama/ROTA`, destino: `/aliancapanorama/index.html`)
- TypeScript com erro → `npx tsc --noEmit -p artifacts/pap/tsconfig.json`
- Variável de ambiente faltando → checar `VITE_API_URL` no painel Vercel

### 2. Railway (API Express)
```bash
curl -s https://site-st-production.up.railway.app/api/healthz | python3 -m json.tool
# Esperado: {"status":"ok"} — nota: rota é /healthz (não /health)
```
**Pontos de falha comuns:**
- Tabela não criada → verificar `ensureDomesticoTables()`, `ensureMekyTables()` no bootstrap
- Variável de ambiente faltando → checar Railway dashboard (DATABASE_URL, SESSION_SECRET, etc.)
- Build TypeScript com erro → `npx tsc --noEmit -p artifacts/api-server/tsconfig.json`

### 3. Rotas SPA — verificar se todas estão no vercel.json
```
/aliancapanorama/adm      → ✅
/aliancapanorama/arquitetura → ✅
/aliancapanorama/buscar   → ✅
/aliancapanorama/mapa     → ✅
/aliancapanorama/eco      → ✅
/aliancapanorama/toyota   → ✅
/aliancapanorama/meky     → ✅ (adicionado sessão 26b)
/aliancapanorama/portal   → ✅ (adicionado sessão 26b)
/aliancapanorama/dodge    → ✅ (adicionado sessão 26b)
```
**Regra:** toda nova página React criada em `App.tsx` precisa de um rewrite em `vercel.json`.

### 4. PostgreSQL Railway
```bash
# Via smoke test (rodar localmente com DATABASE_URL)
DATABASE_URL="..." psql -c "SELECT count(*) FROM nodes;" 2>/dev/null
# Esperado: número > 0
```
**Tabelas que devem existir:**
- `nodes`, `users`, `exercises`, `exercise_attempts`, `notes`, `progress`
- `meky_telemetry`, `meky_events`, `meky_memory`, `meky_dreams`, `meky_art`
- `assembly_agents`, `assembly_messages`, `assembly_tasks`, `collective_memory`
- `lar_tasks`, `gastador_listas`, `patient_profiles`, `agenda_slots` ← criadas sessão 26b
- `session`

### 5. Build local antes de todo push
```bash
cd /root/Site-ST/aliancapanorama-src
# TypeScript backend
npx tsc --noEmit -p artifacts/api-server/tsconfig.json 2>&1 | grep "error TS" | grep -v "pre-existente"
# TypeScript frontend
npx tsc --noEmit -p artifacts/pap/tsconfig.json 2>&1 | grep "error TS" | grep -v "pre-existente"
# Build completo (simula o Vercel)
bash /root/Site-ST/scripts/build-pap.sh
```

---

## Protocolo de Fix Rápido por Sintoma

| Sintoma | Causa provável | Fix |
|---------|---------------|-----|
| Vercel: `ERR_PNPM_FROZEN_LOCKFILE` | Versão pnpm local ≠ CI | `--no-frozen-lockfile` em `build-pap.sh` |
| Vercel: nova rota retorna 404 | Falta rewrite no vercel.json | Adicionar entrada em `vercel.json` |
| Vercel: build falha em 4s | Script não existe | Verificar `scripts/build-pap.sh` existe |
| Railway: rota retorna 500 | Tabela não existe no banco | Adicionar `CREATE TABLE IF NOT EXISTS` no bootstrap |
| Railway: rota retorna 403 | Tier insuficiente na sessão | Verificar `req.session.userTier` na rota |
| Frontend: tela branca | Erro JS no console | Abrir DevTools → Console |
| Login não persiste | Sessão não salva | Verificar `req.session.save()` no login |

---

## Script de Smoke Test Rápido
```bash
API="https://site-st-production.up.railway.app"
FRONT="https://site-st.vercel.app/aliancapanorama"

echo "=== HEALTH CHECK PAP ==="
for url in \
  "$API/api/health" \
  "$FRONT/" \
  "$FRONT/adm" \
  "$FRONT/portal" \
  "$FRONT/dodge" \
  "$FRONT/meky" \
  "$FRONT/eco"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  echo "$code  $url"
done
```

---

## Checklist ao Fazer Push

Antes de cada `git push`, verificar:
- [ ] Nova rota React → entrada em `vercel.json`?
- [ ] Nova tabela → `CREATE TABLE IF NOT EXISTS` no bootstrap?
- [ ] Novo pacote npm → `pnpm install` rodou e lockfile atualizado?
- [ ] `pnpm install --no-frozen-lockfile` no script de build (nunca `--frozen-lockfile`)?
- [ ] TypeScript compila sem erros novos nos arquivos editados?
