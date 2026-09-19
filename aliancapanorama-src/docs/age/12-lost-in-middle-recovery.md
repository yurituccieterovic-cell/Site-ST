# Age — Protocolo de Recuperação Lost-in-Middle

**Para quando Cláudio ou qualquer IA perder o contexto do Age**

## Checklist de recuperação (ordem)

1. Ler `docs/age/00-manifest.md` — índice e boundary IA/humano
2. Ler `docs/age/01-current-truth.md` — estado operacional atual
3. Ler `docs/age/03-decisions.md` — decisões canônicas
4. Ler `tango/sys_age_core.md` — contexto Tango do Age
5. Checar health:
   ```bash
   for slug in lisange susana; do
     echo "$(curl -s -o /dev/null -w '%{http_code}' "https://site-st.onrender.com/api/age/$slug") /api/age/$slug"
   done
   ```
6. Se tarefa de código: ler `artifacts/api-server/src/routes/age.ts` + `artifacts/pap/src/pages/AgePage.tsx`

## O que NÃO fazer ao recuperar contexto

- Não recriar tabelas que já existem
- Não re-implementar rotas que já estão em age.ts
- Não tomar decisões comerciais (%, contratos) sem Mayumi/Yuri
- Não inventar estados de profissional sem checar `01-current-truth.md`
