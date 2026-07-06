# proc_pap_comandos.md — Comandos e Pipeline Detalhado
### 2026-07-06

## #pap — Iniciar sessão PAP
1. Ler `tango/tango.md` (índice fractal)
2. Ler `tango/proc_pap_estado.md` (estado atual)
3. Ler `YURI-NAVEGACAO.md` (visão geral de vida e projetos)
4. Carregar memórias: `project_pap.md`, `user_yuri.md` em `/root/.claude/projects/-root/memory/`
5. Ler `/root/.pap-secrets`
6. Ler `MAPA.md` (estado completo)
7. Se necessário: `PSEUDO.md` via `PSEUDO-INDICE.md`, `APRENDIZADO.md` via `APRENDIZADO-INDICE.md`
8. Confirmar contexto e começar

## #secrets — Preencher credenciais
1. Ler `/root/.pap-secrets`
2. Para cada campo vazio: exibir caixinha pedindo o valor
3. Aguardar resposta de Yuri
4. Escrever no arquivo (`chmod 600`)
5. Confirmar e passar para o próximo campo vazio
**Regras:** campos preenchidos — não perguntar. Nunca exibir o valor de volta.

## #processo — Pipeline completo (9 passos, com dependências)
1. **Extrair** — Gmail `luddlocke@gmail.com`, assunto "Assembleia #N" + docs novos de Yuri. Script: `sync-assembleias.py`
2. **Aprendizados** → `APRENDIZADO.md`. Formato: `| #NNN | categoria | descrição | ângulo |`
3. **Ideias** → `IDEIAS.md`. Formato: `### I[N]: título` com prioridade, complexidade, descrição técnica
4. **MAPA.md** — schema DB, rotas API, pendências, histórico de sessões, gotchas
5. **PSEUDO.md** — decisões tomadas, debates, tensões não resolvidas, contexto de Yuri
6. **PSEUDO2.md** — pseudocódigo close-to-code (só se lógica/fluxo mudou)
7. **Código** — `aliancapanorama-src/` | `artifacts/pap-app/src/` | `artifacts/api-server/src/` | `lib/db/src/schema/`
8. **Deploy** — `git push origin main` → Railway auto-deploya. Migrations via `drizzle-kit push` ou psql direto
9. **Registros** — ATA em `/tmp/pap-ata.md` → `pap-email-fim`

**Atalhos:** só código → começar no passo 4. Só documentação → parar no 6. Passo 9 sempre obrigatório.

## Tango — Regra de Fragmentação
Qualquer arquivo que ultrapasse 200 linhas de densidade deve ser quebrado:
1. Criar arquivo-índice com 1-2 linhas por seção
2. O arquivo original vira "folha estanque" (lida sob demanda)
3. Referenciar a folha no `tango.md`
