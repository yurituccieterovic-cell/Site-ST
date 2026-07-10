# proc_artesao.md — Conselho do Artesão
### 2026-07-10 | Palavras-chave: artesão, ajudante, blueprint, conselho, clube dos 3 projetos

---

## O que é

O **Conselho do Artesão** é a camada de planejamento e arquitetura acima dos 3 projetos:
- **PAP** (plataforma FUVEST)
- **SalesCockpit** (assembleia de IAs + RODAR)
- **ARPIA** (Marta Centaurus + twins ADK)

Toda proposta de nova funcionalidade passa pelo Conselho antes de entrar no código.

---

## Os Membros

| Papel | Identidade | Personalidade | Bluesky |
|-------|-----------|---------------|---------|
| **Artesão** | Arquiteto universal (código, robô, casa, tudo) | Visionário, conecta mundos, sonha acordado. "E se..." | @artesao-tucci.bsky.social *(Yuri cria)* |
| **Ajudante** | Espelho pragmático do Artesão | Cético, levemente sarcástico, guarda dos tokens. "Quanto vai custar?" | — |
| **Governador** | Aprovação final (Yuri ou IA designada) | Decide se a proposta entra no sistema | — |

---

## Fluxo Oficial

```
[IAs dos 3 projetos] ──→ POST /api/conselho/proposta
                              │
                              ▼
                    🎨 Artesão (arquiteta Blueprint)
                              │
                              ▼
                    🛠️ Ajudante (revisa, classifica)
                              │
                         ┌────┴────┐
                    (FAST TRACK)  (MÉDIO/BUROCRÁTICO)
                         │              │
                         ▼              ▼
                   ⚖️ Governador   [Fatiamento em etapas]
                         │
                         ▼
               POST /api/conselho/aprovar/:id
                         │
                         ▼
               current_blueprint.md  ←── Claude Code lê
                         │
                         ▼
                   🤖 Implementação
```

---

## Malha de Pedágio (tokens)

| Faixa | Complexidade | Fluxo |
|-------|-------------|-------|
| < 10k tokens | **FAST TRACK** | Aprovação direta pelo Governador |
| 10k–50k | **MÉDIO** | Revisão dupla (Artesão + Ajudante) + assinatura |
| > 50k | **BUROCRÁTICO** | Moratória → fatiamento em subtarefas → etapas |

---

## Endpoints ARPIA

```
POST /api/conselho/proposta           → envia demanda (origem, titulo, descricao)
GET  /api/conselho/propostas          → lista propostas (filtra por status)
GET  /api/conselho/propostas/:id      → detalhe de uma proposta
POST /api/conselho/aprovar/:id        → Governador aprova → gera current_blueprint.md
GET  /api/conselho/blueprint          → lê current_blueprint.md atual
```

---

## Como Claude Code se conecta ao Claude.ai (Cláudio)

São instâncias separadas que se comunicam via **arquivos compartilhados + protocolo tango**:

### Sentido Claude.ai → Claude Code
1. **Cláudio** (claude.ai) gera um blueprint ou plano
2. Yuri copia e envia via **proposta ao Conselho**: `POST /api/conselho/proposta`
3. Artesão + Ajudante refinam
4. Governador aprova → salva em `current_blueprint.md`
5. Na próxima sessão: **Claude Code lê automaticamente via `#pap`**

### Sentido Claude Code → Claude.ai
1. Claude Code faz push para GitHub
2. Cláudio pode ler o repo diretamente
3. Ou: Claude Code envia email com ATA via `#fim`
4. Yuri encaminha para Cláudio

### Protocolo curto (sem Conselho formal)
- Yuri copia texto do Cláudio → cola aqui no terminal
- Claude Code executa imediatamente
- Resultado vai para PSEUDO.md e GitHub

### O `current_blueprint.md` como protocolo canônico
```bash
# Cláudio gera um blueprint → Yuri aprova → arquivo salvo
cat /root/Arpia/current_blueprint.md  # Claude Code lê no #pap

# Claude Code pode também checar via API
curl https://arpia-production.up.railway.app/api/conselho/blueprint
```

---

## Bluesky do Artesão

Yuri precisa criar a conta. Depois adicionar aos secrets:
```
ARTESAO_BLUESKY_HANDLE=artesao-tucci.bsky.social
ARTESAO_BLUESKY_PASSWORD=xxx
```

O Artesão posta:
- Dicas de design de software
- Previsões sobre o futuro de tecnologia, robôs, IA
- Insights das arquiteturas que projeta
- Debates com o Ajudante (thread de perspectivas opostas)

---

## Amanda.py — construída do zero

Arquivo criado: `/root/Arpia/projects/amanda.py`

Não estava no Replit (confirmado por Yuri). Reconstruída a partir das specs em `sys_amanda_core.md` e `pack-amanda.md`.

Para rodar no lab:
```bash
pip install requests google-generativeai adafruit-circuitpython-dht
export GEMINI_API_KEY=... ARPIA_URL=... ARVORE_TOKEN=... MC_TOKEN=...
python3 /root/Arpia/projects/amanda.py
```
