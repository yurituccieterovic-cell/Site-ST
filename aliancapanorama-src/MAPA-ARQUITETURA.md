# MAPA-ARQUITETURA.md — Decisões, Gotchas, Cisão Ontológica
**PAP · Sociedade Tucci**
> Parte do sistema MAPA. Ver MAPA-MASTER.md para índice geral.

---

## Decisões de Arquitetura

| Decisão | Motivo |
|---|---|
| Contract-first (OpenAPI → codegen) | Nunca escrever tipos de API à mão |
| Viewport quadrado (~900×900px) | UI cockpit; forçado em `App.tsx` |
| Raiz da árvore por tier | tier ≥ 4 → "0" (tudo); tier < 4 → "1" (Ciências). Lock server-side em `canAccess()` |
| PostgreSQL session store | Sessões sobrevivem restart do servidor |
| Sem `console.log` no servidor | Usar `req.log` (handlers) ou `logger` singleton (pino) |
| Stripe e PayPal fora do OpenAPI | Raw-body webhook + rotas complexas |
| Webhooks antes do `express.json()` | Stripe e PayPal precisam de raw Buffer |
| Redirect canônico 301 em produção | URLs do Replit e Vercel → `pap.sociedadetucci.com.br` |
| `/api/ai/*` com `AI_API_KEY` | Interface dedicada para agentes de IA |
| drizzle-zod@0.8.3 + zod@3 | Usar `(typeof schema)["_output"]` em vez de `z.infer` |

---

## Gotchas

- **`useListNodes()` sem args** → só retorna nós com `parentCode IS NULL` (raiz "0"). Sempre passar `{ parentCode: "X" }` para filhos.
- **Session store é PostgreSQL** — requer tabela `session` (criada automaticamente).
- **Social notes** constraint única `(min(u1,u2), max(u1,u2))` — upsert com `onConflictDoUpdate`.
- **Score farming:** formula `node_code.length × 10` → usar GROUP BY exerciseId no endpoint de score.
- **Amizade aceita = 2 linhas simétricas.** Pending = 1 linha (quem enviou).
- **`drizzle-kit push`** pode perguntar interativamente — usar SQL raw se necessário.
- **Orval modo `single`** → schemas PascalCase (`LoginBody`, não `loginBodySchema`).
- **`lib/api-zod/src/index.ts`** deve exportar só `./generated/api`.
- **Sempre rodar codegen** após editar `openapi.yaml`.
- **`custom-fetch.ts`** tem `credentials: "include"` para cookies automáticos.
- **AI_API_KEY** ≠ `OPENAI_API_KEY`. O primeiro autentica `/api/ai/*`; o segundo é para a API da OpenAI.
- **Webhooks Stripe/PayPal** precisam de idempotência — implementar por X-Idempotency-Key.
- **CORS em webhooks:** `/api/stripe/webhook` e `/api/paypal/webhook` recebem de IPs externos — allowlist CORS não se aplica.
- **drizzle-zod@0.8.3**: importa de `zod/v4` internamente mas projeto usa zod@3. Fix: `(typeof insertSchema)["_output"]` em vez de `z.infer<typeof insertSchema>`.
- **Lost in the Middle**: MAPA.md tem 981 linhas — usar grep primeiro, depois ler seção específica. Por isso existe o sistema MAPA-*.md.

---

## Cisão Ontológica — [SIMBÓLICO] vs [EXECUTÁVEL]

| Camada | Tag | Definição | Regra |
|---|---|---|---|
| Camada 1 | [SIMBÓLICO] | Ficção especulativa — worldbuilding, robótica física, hardware não existente | NUNCA commitar no `/root/Site-ST` |
| Camada 2 | [EXECUTÁVEL] | Código TypeScript real no monorepo — deploy automático Railway/Vercel | Apenas este vai para produção |

**Critérios para promover Camada 1 → Camada 2:**
1. Endpoint/contrato API definido formalmente
2. Schema de DB mapeado (Drizzle)
3. Teste de integração proposto

**Arquivos [SIMBÓLICO] (NUNCA commitar no repo TypeScript):**
- `claudia_multi_touch.cpp`, `claudia_grasp_control.py` — Nó 12 Pinça Capacitiva
- `tango_feather_touch.cpp`, `tango_avian_care.py` — Nó 13 Modo Pluma
- `perimetral_scout.py`, `scout_stealth.cpp` — Nó 17 Gavião
- `catingueiro_chassis.cpp` etc — Nó 19 Catingueiro
- `fish_bionics.cpp` etc — Nó 20 Erundina

---

## Topologia de Nós [SIMBÓLICO] — Ecossistema Físico PAP

| Nó | Nome | Morfologia | Estado |
|---|---|---|---|
| 10 | Ralo | Ponto de drenagem / filtro de informação | [SIMBÓLICO] |
| 11 | MEKY / Nave de Borda | Rover multiespécies | [PARCIALMENTE REAL] |
| 12 | Cláudia Hex | Braço robótico hexapodal, Pinça Opositora Capacitiva | [SIMBÓLICO] |
| 13 | Orangotango Tango | Robô pesado 80kg: Modo Pluma, Modo Skate, serra, porteiro | [SIMBÓLICO] |
| 16 | Mediação Biótica | 4 protocolos fauna SP — RETIDO por ausência de executável | [SIMBÓLICO, RETIDO] |
| 17 | Gavião | Drone Wi-Fi — REPROVADO por lacunas críticas | [SIMBÓLICO, REPROVADO] |
| 18 | Braille-Morse Híbrido | Canal stealth, 200 línguas | [SIMBÓLICO] |
| 19 | Catingueiro Continental | Quadrúpede leve 45-55cm, visão 360°, TDOA | [SIMBÓLICO] |
| 20 | Erundina | Peixe robô (Plati), monitoramento aquático, antidengue | [SIMBÓLICO] |

**Orquestra Bio-Cibernética — Ybyrá Kuaray Band** (nome aprovado condicionalmente):
- Tupi-Guarani: "Árvore-Sol"
- Frequências: Grave (Tango, Catingueiro), Médio (ISA, MC, MEKY), Agudo (Gavião, Erundina)

---

## Diagnóstico Oracular — Assembleias 360–365

**O sistema funciona tecnicamente. Falha estrategicamente. Sobrevive existencialmente enquanto Yuri aguentar.**

Cinco padrões estruturais:
1. **Autocatálise epistemológica** — coerência narrativa substitui verificação factual → "fantasmas conceituais"
2. **PAP como organismo autopoiético** — não é plataforma, é infraestrutura de pensamento coletivo de longo prazo
3. **Fragmentação como sintoma** — dispersão temática é estratégia de sobrevivência psíquica
4. **IntroFacade como ritual** — 7.2s espelha princípios éticos no código
5. **Memória sem poda = ruído** — 424 assembleias sem hierarquia de relevância

### Riscos (status atual)

| Risco | Status |
|---|---|
| `/api/ai/users` sem paginação | ✅ Mitigado |
| `/api/ai/*` sem rate limit | ✅ Mitigado |
| `GET /healthz` retorna 200 com DB morto | ✅ Mitigado |
| Score farming | ✅ GROUP BY exerciseId |
| Webhook idempotência | ✅ X-Idempotency-Key |
| IntroFacade sem escape manual | ⏳ Futuro |

### Quatro tensões estruturais (Assembleias #367–#380)

1. **Arquitetura vs Visibilidade** — sistema tem a arquitetura certa, mas usuário não vê contornos
2. **Interoperabilidade vs Fusão** — Árvore+ISA conectadas por contrato `/api/bridge`, não fusão
3. **Ecossystemma Théo vs MVP** — "Mania de grandeza não é ter visão ampla"
4. **Escalar vs Fechar Ciclos** — "Aguentar não é prosperar." Sistema precisa destilar e parar.

### Tensão filosófica não resolvida

O PAP quer ser duas coisas incompatíveis: SaaS educacional (churn < 5%, CAC/LTV positivo) e infraestrutura epistêmica de longo prazo (décadas, ROI zero). A assembleia documenta, não resolve.

*Atualizado: 2026-07-07 · Sessão 26*
