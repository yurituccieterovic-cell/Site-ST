# proc_checkpoint_fim.md — Mecanismo de Encerramento (#fim)
### 2026-07-06

## Trigger
Acionado por comando `#fim` de Yuri (digitado diretamente) OU pela etapa 4 do `#a`.

**Regra de email:** só enviar MacroAta (passo 8) quando `#fim` for digitado DIRETAMENTE por Yuri.
Quando chamado via `#a`: executar passos 0–7 e 9–10, pular passo 8 (sem email).
MacroAta = todas as ATAs desde o último `#fim` manual (lidas de PSEUDO.md desde o checkpoint).

## Passos em Ordem

**0. Ler checkpoint do último #fim:**
```bash
LAST_FIM=$(cat /root/Site-ST/aliancapanorama-src/.pap-fim-checkpoint 2>/dev/null || echo "início do projeto")
git -C /root/Site-ST log --since="$LAST_FIM" --oneline 2>/dev/null | head -20
```
A ATA cobre apenas o período desde o último #fim.

**1.** Atualizar "Pendências", "Estado da Infraestrutura" e "Histórico de Sessões" no `MAPA.md`

**2.** Adicionar entrada no `PSEUDO.md` — decisões, debates, tensões não resolvidas, contexto de Yuri

**3.** Se houve mudanças em lógica/fluxo: atualizar `PSEUDO2.md`

**4.** `pap-sync` — sincroniza assembleias + docs → APRENDIZADO + IDEIAS

**5.** Revisar `IDEIAS.md`: marcar implementadas ✅, adicionar novas

**6.** Escrever ATA em `/tmp/pap-ata.md`:
- Checkpoint: desde [LAST_FIM] até [agora]
- O que foi discutido (decisões, debates, direcionamentos)
- O que foi programado (commits, arquivos, scripts)
- Decisões tomadas (e por quê)
- Próximos passos
- **SÍNTESE FILOSÓFICA:** traduzir o que foi construído para outra camada de sentido — o que a sessão significou, o que Yuri estava tentando fazer por baixo das tarefas. Tom: reflexivo, direto, sem performar profundidade.

**7.** `date -Iseconds > /root/Site-ST/aliancapanorama-src/.pap-fim-checkpoint`

**8.** `pap-email-fim` → envia ATA para luddlocke@gmail.com

**9.** Injetar 3–5 insights em collective_memory das IAs e no **Conector**:

```bash
# Conector — ATA resumida (sempre, automático e manual)
BRIDGE=$(grep BRIDGE_SECRET /root/.pap-secrets | cut -d= -f2)
curl -s -X POST https://site-st.onrender.com/api/conector/memory \
  -H "Authorization: Bearer $BRIDGE" \
  -H "Content-Type: application/json" \
  -d "{\"section\":\"conversas\",\"append\":\"### $(date +%Y-%m-%d) — ATA Cláudio\\n[inserir: decisões tomadas, próximos passos, 3-5 linhas]\"}"
# MacroAta (#fim manual): concatenar todas as ATAs desde checkpoint e gravar tb na seção conversas
```

```python
import requests, os
API = "https://pap-api-production.up.railway.app"
tok = os.popen("grep PAP_INTERNAL_TOKEN /root/.pap-secrets | cut -d= -f2").read().strip()
insights = ["DECISÃO: ...", "GOTCHA: ...", "APRENDIZADO: ..."]
for c in insights:
    requests.post(f"{API}/api/collective-memory",
      json={"content": c, "author": "claude-code", "tier": "public"},
      headers={"x-internal-token": tok})
```
Critério: não-óbvio + durável. Máximo 5 entradas.

**10.** Confirmar para Yuri.

## Output de Integridade (desejado — I134 pendente)
- Hash SHA-256 do output final (gate técnico, ainda não implementado)
- Sem hash: carimbo é simbólico, não prova de qualidade
