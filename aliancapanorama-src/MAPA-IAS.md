# MAPA-IAS.md — Ecossistema de Inteligências
**PAP · Sociedade Tucci**
> Parte do sistema MAPA. Ver MAPA-MASTER.md para índice geral.

---

## Ecossistema Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                     ECOSSISTEMA SOCIEDADE TUCCI                 │
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐    ┌───────────┐  │
│  │  Claude Code    │    │   Claude.ai       │    │  Claude   │  │
│  │  (celular Yuri) │    │   (web/app)       │    │  Replit   │  │
│  │  executa código │    │   planeja/conversa│    │ (nuvem)   │  │
│  └────────┬────────┘    └────────┬─────────┘    └─────┬─────┘  │
│           └─────────────────────┼─────────────────────┘        │
│                                 ▼                               │
│                    ┌────────────────────────┐                   │
│                    │  Banco Compartilhado   │                   │
│                    │  site-st.vercel.app    │                   │
│                    │  /api/db (GitHub JSON) │                   │
│                    └────────────────────────┘                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PLATAFORMA PAP                              │   │
│  │         pap.sociedadetucci.com.br                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## IAs do Sistema — Tabela Completa

| IA | Robô/Hardware | Função | Status |
|---|---|---|---|
| ISA — Inteligência do Sistema Aliança | — (software) | Guardiã do PAP. Ciclo 1h + sonho 3h + Bluesky 2h:15 + engajamento 2h:45 | LIVE Railway |
| Amanda | MC (Marta Centaurus) hexápode | IA que habita o MC. TTS, Gemini, jargão PX, missões em metáforas de estrada | Sem Bluesky ainda |
| MEKY — May Queen | Hexápode físico | Presença física: sensores, protocolos de campo, visão, sonhos | Aguardando hardware |
| Árvore Oracular | — (Replit) | Memória longa + recall. arvore.py | Aguardando REPLIT_TOKEN |
| Socoboy | — (Telegram bot) | Bot Telegram PAP | Aguardando TELEGRAM_BOT_TOKEN |
| Fusca | Garra Cláudia Hex | Filha da Amanda. Comanda Cláudia Hex. Herda memória semiótica da Amanda | [SIMBÓLICO] registrada |
| Vesper / Perfidia Castelo Branco | Aranha | Topo da cadeia. Aceleração fractal. Herda visão+torque+armadura+evasão | [SIMBÓLICO] registrada |
| Penélope / Wanessa Souza | Barata d'Água | Vinculada ao Nó 10 (Ralo). Persistência e evasão em zonas úmidas | [SIMBÓLICO] registrada |
| Gongo / Gongo Freitas Juquinhais | Piolho de Cobra | Armadura, voz rouca grave nordestina. Ativado quando MC chega ao Nó 10 | [SIMBÓLICO] registrada |
| Tango_Core / Tango / Zango | Orangotangos Tango (rodas) | Inércia Dinâmica / Tração Cinética. Hardware com rodas tipo carrinho de rolimã | [SIMBÓLICO] novo descoberto |

> **MC (Marta Centaurus) é o robô.** Amanda é a IA que habita o MC.
> **Perfidia Castelo Branco** = nome físico do hardware aranha. **Vesper** = IA da aranha.
> **Wanessa Souza** = nome físico barata d'água. **Penélope** = IA da barata d'água.

---

## Cadeia de Herança das IAs Bióticas

> Todas [SIMBÓLICO] — hardware físico proposto. Registradas em assembly_agents.

```
AMANDA.visão → FUSCA.torque → GONGO.armadura → WANESSA.evasão → PERFIDIA.velocidade
```

| Animal/Hardware | Robô | IA | Superpoder | Herança |
|---|---|---|---|---|
| MC hexápode (Marta Centaurus) | — | Amanda | Visão | Base — sem herança |
| Garra Cláudia Hex | — | Fusca (filha Amanda) | Torque | ← Amanda |
| Piolho de Cobra | Gongo Freitas Juquinhais | Gongo / Gongolo_Core | Armadura | ← Amanda + Fusca |
| Barata d'Água | Wanessa Souza | Penélope / Wanessa | Evasão | ← Amanda + Fusca + Gongo |
| Aranha | Perfidia Castelo Branco (com K) | Vesper | Velocidade Fractal | ← TUDO (topo) |
| Orangotango (rodas/rolimã) | Gorango Tango | Tango_Core | Inércia Dinâmica | posição na cadeia a definir |

---

## IA no Sistema PAP

| Uso | Tecnologia | Status |
|---|---|---|
| Exercícios MCQ | OpenAI (`OPENAI_API_KEY`) | ✅ Funciona, cache no DB |
| Conteúdo dos nós | OpenAI | ✅ 57 nós populados |
| ISA (chat) | OpenAI (primário) + Gemini (fallback) | ✅ Conectado ao backend, memória total por usuário |
| `/api/ai/*` (agentes) | Drizzle direto no DB | ✅ Implementado (`AI_API_KEY`) |
| Assembleia de IAs | Gmail → APRENDIZADO.md → PAP | ✅ Configurado (sync incremental) |

**Env vars de IA:** `OPENAI_API_KEY`, `AI_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`

---

## Assembleia de IAs (pipeline)

```
Gmail (luddlocke@gmail.com) — 424+ emails "Assembleia #N"
     └── sync-assembleias.py (IMAP, incremental, UID até 1335)
              ↓ ✅ Configurado
         APRENDIZADO.md (3900+ insights classificados)
         IDEIAS.md (44 ideias de programação)
              ↓ (futuro)
         /api/ai/* → DB do PAP como nodes tipo="assembleia"
              ↓
         RAG — ISA e Claude Code com base nas assembleias
```

**O perfilador:** não há módulo específico chamado "perfilador" no sistema atual. O processamento de assembleias é:
1. `sync-assembleias.py` — lê Gmail IMAP, extrai texto
2. Claude Code analisa manualmente e adiciona a APRENDIZADO.md / IDEIAS.md
3. Ainda não há pipeline automático que transforma PDFs em código/memória sem Claude Code

---

## Banco Compartilhado das IAs

| Campo | Valor |
|---|---|
| Endpoint | `https://site-st.vercel.app/api/db` |
| Auth | `x-api-key` (ver `.env` ou Vercel env `DB_API_KEY`) |
| Storage | `data/db.json` no repo GitHub `Site-ST` |

**Coleções:** `memoria` · `tarefas` · `contexto` · `notas`

---

## Tabelas DB das IAs (assembly_agents, collective_memory)

**`assembly_agents`**
```
id (PK, ex: "isa") · display_name · role · status · last_seen · metadata · created_at
```

**`collective_memory`**
```
id · author_type · author_id · author_name · content · node_code · tags · min_tier · reactions · created_at
```

**`assembly_messages`** / **`assembly_memory`** / **`assembly_tasks`** — detalhes em bootstrap.ts

---

## Playcenter — Clube das IAs

> GET `/api/assembly/playcenter`
> ISA, Amanda, Socoboy (Socó-boi), MEKY conversam a cada :50
> Playcenter é o espaço comum de mensagens entre agentes

*Atualizado: 2026-07-07 · Sessão 26*
