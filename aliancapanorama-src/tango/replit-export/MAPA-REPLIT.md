# MAPA-REPLIT — Export Completo do Replit SalesCockpit
> Export: 2026-07-10 | Status: Replit ainda VIVO na data do export

## Fontes exportadas

| Replit | URL | Status |
|--------|-----|--------|
| SalesCockpit | `sales-email-automator--yurituccieterov.replit.app` | ✅ VIVO |
| PAP (legado) | `projetoaliancapanoramapap.replit.app` | ✅ VIVO (só frontend) |

---

## Arquivos nesta pasta

| Arquivo | Descrição | Tamanho |
|---------|-----------|---------|
| `arvore_chat.json` | Histórico completo da Árvore Oracular | 1.8 MB |
| `metadata.json` | Estatísticas do export | ~1 KB |

---

## arvore_chat.json — Conteúdo

- **Total de mensagens**: 1.962
- **IDs**: 1 → 2116 (histórico completo)
- **Acesso no código**: `json.load(open("tango/replit-export/arvore_chat.json"))`

### Distribuição por autor

| Autor | Mensagens | Papel |
|-------|-----------|-------|
| AO | 492 | Yuri (Árvore Oracular — humano) |
| arvore-noturna | 437 | Modo noturno autônomo |
| arvore | 402 | Agente principal |
| arvore-alcance | 108 | Modo alcance/expansão |
| arvore-devaneio | 91 | Modo especulativo |
| arvore-canalizando | 84 | Modo canalização |
| arvore-bluesky-resposta | 67 | Respostas Bluesky |
| arvore-roda | 49 | Ciclo RODAR |
| arvore-curadora | 47 | Curadoria de conteúdo |
| arvore-consulta-meta | 46 | Via Meta AI |
| arvore-sintese | 46 | Síntese de assembleias |
| arvore-consulta-gemini | 37 | Via Gemini |
| arvore-via-meta / via-claude / via-gemini | 52 | Consultas multi-LLM |

### Amostra — primeira e última mensagem

**Mais antiga (ID ~1)**:
- Contexto: início do sistema Árvore no Replit

**Mais recente (ID ~2116)**:
- `arvore-consulta-gemini`: "O equilíbrio reside em uma arquitetura de IA que intencionalmente abstrai a complexidade..."
- `arvore-sintese`: síntese sobre flexibilidade e escalabilidade em sistemas de IA

---

## O que NÃO foi exportado (e por quê)

| Dado | Motivo |
|------|--------|
| assembleias | Retornou 0 registros — dados eram efêmeros (sessões RODAR em memória) |
| agoras | Idem — efêmero |
| amanda.py | Arquivo Python no filesystem do Replit — não acessível via HTTP |
| dados auth/sessões | Protegidos por AO_PASSWORD — não exposto sem auth |

---

## Como usar no Railway

Para importar o arvore_chat no banco do SalesCockpit Railway:

```bash
# 1. Restaurar via bulk insert (após criar endpoint)
curl -X POST https://api-production-89f4a.up.railway.app/api/bridge/sc/import-arvore \
  -H "x-bridge-secret: $BRIDGE_SECRET" \
  -H "Content-Type: application/json" \
  -d @arvore_chat.json

# 2. Ou pg_dump direto do Replit (mais completo):
#    Abrir Replit → Shell → pg_dump $DATABASE_URL > dump.sql
#    Baixar via Files → restaurar localmente
```

---

## Como extrair amanda.py

1. Abrir https://replit.com/@yurituccieterov/sales-email-automator
2. Files (barra lateral esquerda) → `projects/amanda.py`
3. Botão direito → Download
4. Mandar para Claude Code → migra para `/root/Arpia/app/agents/amanda_local.py`

---

## Acesso programático a este export

```python
# Leitura direta
import json
msgs = json.load(open("/root/Site-ST/aliancapanorama-src/tango/replit-export/arvore_chat.json"))

# Filtrar por autor
ao_msgs = [m for m in msgs if m.get("author") == "AO"]
arvore_msgs = [m for m in msgs if m.get("author", "").startswith("arvore")]

# Busca por conteúdo
relevant = [m for m in msgs if "PAP" in m.get("content", "")]
```
