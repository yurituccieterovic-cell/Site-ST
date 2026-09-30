# Árvore Oracular

Chat em português brasileiro com identidade própria, memória persistente e múltiplas vozes de IA.

## Diferencial

Cada provedor de IA expressa uma **voz distinta** da Árvore:

| Voz | Provedor | Tom | Gratuito |
|---|---|---|---|
| ⚡ Veloz | Groq (Llama 3.3 70b) | Direto, sem floreio | Sim (com limite) |
| 🌿 Expansiva | Gemini 2.0 Flash | Associativo, conectivo | Sim (com limite) |
| 🪨 Mínima | Cloudflare Workers AI | Essencial, econômico | Sim (com limite) |
| 🌊 Livre | OpenRouter | Exploratório | Pago — opt-in explícito |

O fallback entre vozes é automático. A identidade da Árvore é mantida independente de qual provedor responde.

## Pré-requisitos

- Node.js 22+
- pnpm 9+
- PostgreSQL (Neon ou local)
- Pelo menos uma chave de API (Groq ou Gemini recomendados para começar)

## Rodando localmente

```bash
cd arvore-src
cp .env.example .env
# Edite .env com DATABASE_URL + SESSION_SECRET + ao menos uma API key

pnpm install --no-frozen-lockfile
pnpm dev   # api na :3001, frontend na :5173
```

## Variáveis de ambiente obrigatórias

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | String aleatória longa para cookies |
| `ADMIN_EMAIL` | Email do primeiro usuário admin |
| `ADMIN_PASSWORD` | Senha do admin (mínimo 6 chars) |

## Provedores (ao menos um)

| Variável | Descrição |
|---|---|
| `GROQ_API_KEY` | console.groq.com — gratuito com limite |
| `GEMINI_API_KEY` | aistudio.google.com — gratuito com limite |
| `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` | dash.cloudflare.com |
| `OPENROUTER_API_KEY` | openrouter.ai — **pago por uso, desabilitado por padrão** |

> **Limites gratuitos:** Groq ~14.400 req/dia, Gemini ~1.500 req/dia. Ambos têm rate limiting por minuto. Quando atingidos, o roteador tenta o próximo provedor disponível.

## Deploy no Render

1. Crie um Web Service apontando para o repositório, pasta raiz: `arvore-src/apps/api`
2. Build command: `cd ../.. && pnpm install --no-frozen-lockfile && pnpm build`
3. Start command: `node dist/index.js`
4. Adicione as variáveis de ambiente no painel do Render
5. O banco cria as tabelas automaticamente no primeiro boot

## Deploy em Linux (VPS)

```bash
git clone <repo> && cd arvore-src
pnpm install --no-frozen-lockfile
pnpm build

# Usando PM2
pm2 start apps/api/dist/index.js --name arvore-api
pm2 save

# Ou systemd (edite o path conforme necessário)
# Ver scripts/arvore-api.service
```

## Importar histórico do Replit

```bash
DATABASE_URL=postgres://... tsx scripts/import-history.ts \
  path/to/arvore_chat.json \
  1   # user_id do admin
```

Importa mensagens da Árvore como memórias categoria `assembleia`, visibilidade `private`.
Nunca importa como público. Deduplication via `origin_ref`.

## Backup e restauração

```bash
# Backup
pg_dump $DATABASE_URL -t 'ao_*' -Fc > arvore-backup-$(date +%Y%m%d).dump

# Restauração
pg_restore -d $DATABASE_URL --data-only -t 'ao_*' arvore-backup.dump
```

> Nunca commite arquivos `.dump` ou `.env` no git.

## Testes

```bash
pnpm test                          # todos os pacotes
pnpm --filter router test          # só o roteador
```

Os testes usam mocks para os provedores. Nenhuma chamada real é feita automaticamente.

## Limitações conhecidas

- Circuit breaker em memória: em múltiplas instâncias do backend, cada uma tem seu estado. Para produção com múltiplas instâncias, o estado deve ser migrado para o PostgreSQL (`ao_circuit_breakers`).
- Busca de memórias: usa `ILIKE` (textual). Embeddings/semântica não são necessários para começar, mas melhorariam a recuperação.
- OpenRouter: modelo padrão (`mistral-7b-instruct`) é pago por uso. Verifique preços em openrouter.ai antes de habilitar.
- Exportação ZIP e painel de admin completo: implementados parcialmente (API básica disponível, UI ainda em construção).
