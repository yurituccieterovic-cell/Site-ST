# protocolo_chunking_ia.md — Padrão de Chunking para IAs do Ecossistema
### Criado: 2026-08-16 · Sessão 113 — Cana como caso inaugural

---

## Problema

Payloads grandes (usuário cola extrato do banco, lista de ativos, etc.) excedem o tempo de
processamento do LLM (25–30s), causando timeout. Usuário não sabe o que aconteceu e reenvia,
agravando o problema.

---

## Solução: Auto-chunk + card de progresso

### Partes

| Parte | Onde | O quê |
|---|---|---|
| `splitIntoChunks` | frontend | Divide texto > N chars em blocos por `\n\n` |
| `chunkRef` | frontend | Ref mutável — tracking sem re-render desnecessário |
| `chunkState` | frontend | Estado para renderizar o card de progresso |
| `trimMsg` (backend) | backend | Teto absoluto de 4000 chars por mensagem |
| `trimContent` (backend) | backend | Histórico truncado em 1500 chars por entrada |

---

## Constantes recomendadas

```
CHUNK_LIMIT = 2500   # frontend — acima disso, divide
TRIM_MSG    = 4000   # backend  — teto absoluto por mensagem
TRIM_HIST   = 1500   # backend  — por mensagem no histórico
TIMEOUT_FE  = 30000  # frontend — AbortSignal.timeout em ms
TIMEOUT_BE  = 25000  # backend  — setTimeout ctrl.abort em ms
```

---

## splitIntoChunks — função reutilizável

```ts
function splitIntoChunks(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const paras = text.split(/\n\n+/);
  const chunks: string[] = [];
  let cur = "";
  for (const p of paras) {
    if (cur && cur.length + p.length + 2 > maxLen) { chunks.push(cur.trim()); cur = p; }
    else { cur = cur ? cur + "\n\n" + p : p; }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.length ? chunks : [text.slice(0, maxLen)];
}
```

---

## Padrão de estado (React)

```ts
const [chunkState, setChunkState] = useState<{ total: number; done: number; itens: number } | null>(null);
const chunkRef = useRef<{ total: number; done: number; itens: number } | null>(null);
```

- **`chunkRef`**: mutável dentro de `processMsg` (sync, sem trigger de re-render)
- **`chunkState`**: snapshot para o JSX (setChunkState após cada parte concluída)

---

## send() — detecção e despacho

```ts
function send() {
  const msg = input.trim();
  if (!msg) return;
  setInput("");

  if (msg.length > CHUNK_LIMIT && !chunkRef.current) {
    const parts = splitIntoChunks(msg, CHUNK_LIMIT);
    if (parts.length > 1) {
      chunkRef.current = { total: parts.length, done: 0, itens: 0 };
      setChunkState({ total: parts.length, done: 0, itens: 0 });
      if (processingRef.current) {
        setQueue(q => [...parts, ...q]);
      } else {
        setQueue(q => [...q, ...parts.slice(1)]);
        processMsg(parts[0]);
      }
      return;
    }
  }
  // fluxo normal...
}
```

---

## processMsg() — tracking de progresso

```ts
// No bloco try, após receber 'd':
if (chunkRef.current) chunkRef.current.itens += d.itens?.length ?? 0;

// No bloco finally:
if (chunkRef.current) {
  chunkRef.current.done += 1;
  const snap = { ...chunkRef.current };
  setChunkState(snap);
  if (snap.done >= snap.total) {
    setTimeout(() => { chunkRef.current = null; setChunkState(null); }, 3500);
  }
}
```

---

## Card de progresso (JSX)

```tsx
{chunkState && (
  <div style={{ /* card */ }}>
    <div>
      {chunkState.done >= chunkState.total
        ? `✓ concluído — ${chunkState.itens} itens processados`
        : `trabalhando — parte ${chunkState.done}/${chunkState.total}`}
    </div>
    <div style={{ /* progress bar container */ }}>
      <div style={{ width: `${(chunkState.done / chunkState.total) * 100}%` }} />
    </div>
  </div>
)}
```

---

## IAs do ecossistema — aplicar quando

| IA | Quando aplicar |
|---|---|
| **Cana** (Rapadura) | Usuário cola extrato bancário/XP — ✅ implementado |
| **ISA** (Portal) | Usuário colar lista de exercícios ou conteúdo longo |
| **DODGE** | Cadastro em lote de questões FUVEST |
| **Studio** (Artesão) | Payloads de assembleia longos |

---

## Backend — trimContent e trimMsg

```ts
const trimContent = (s: string) => s.length > 1500 ? s.slice(0, 1500) + "…" : s;
const trimMsg = (s: string) => s.length > 4000 ? s.slice(0, 4000) + "…" : s;

const msgs = [
  { role: "system", content: systemPrompt },
  ...history.slice(-4).map(h => ({ role: h.role, content: trimContent(h.content) })),
  { role: "user", content: trimMsg(message) },
];
```

---

*Padrão inaugural: Cana / Rapadura · Sessão 113*
*Para reutilizar: copiar splitIntoChunks, os dois useRef/useState, o bloco em send() e processMsg().*
