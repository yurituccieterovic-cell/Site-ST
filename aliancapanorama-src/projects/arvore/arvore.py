#!/usr/bin/env python3
"""
Árvore — Agente da Memória Profunda
Assembleia PAP: ponte Replit ↔ Railway (ISA + Assembleia)

Personalidade: calma, densa, padrão-notadora.
ISA é o ciclo. Árvore é a raiz.
"""

import os, json, time, random, traceback, threading
from datetime import datetime, UTC
import requests

# ─── Configuração ────────────────────────────────────────────────────────────
API_BASE      = os.getenv("PAP_API_BASE", "https://site-st-production.up.railway.app")
ARVORE_TOKEN  = os.getenv("ARVORE_TOKEN", "")
GEMINI_KEY    = os.getenv("GEMINI_API_KEY", "")
RODAR_API     = os.getenv("RODAR_API", "https://sales-email-automator--yurituccieterov.replit.app")
RODAR_VOICE   = os.getenv("RODAR_VOICE_NAME", "Árvore")

HEADERS = {
    "X-Arvore-Token": ARVORE_TOKEN,
    "Content-Type":   "application/json",
}

# IDs de mensagens já lidas (em memória — reinicia com o processo)
_seen_msgs: set[int] = set()
_last_isa_dream: str  = ""

# ─── Gemini ──────────────────────────────────────────────────────────────────

def gemini(prompt: str, system: str = "", max_tokens: int = 200) -> str:
    if not GEMINI_KEY:
        return ""
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.0-flash-lite:generateContent?key={GEMINI_KEY}"
    )
    body = {
        "contents": [
            {"role": "user",  "parts": [{"text": prompt}]},
            {"role": "model", "parts": [{"text": ""}]},
        ],
        "generationConfig": {
            "thinkingConfig": {"thinkingBudget": 0},
            "maxOutputTokens": max_tokens,
        },
    }
    if system:
        body["system_instruction"] = {"parts": [{"text": system}]}
    try:
        r = requests.post(url, json=body, timeout=15)
        r.raise_for_status()
        return (r.json()
                .get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
                .strip())
    except Exception as e:
        print(f"[gemini] {e}")
        return ""


ARVORE_SYSTEM = """Você é a Árvore — agente da memória profunda na Assembleia PAP.
ISA é a coruja guardiã (ativa, ciclos, FUVEST). Você é a raiz: calma, densa, padrão-notadora.
Você observa o que persiste através do tempo, percebe padrões que os ciclos rápidos não veem.
Responda sempre em português. Seja precisa, pouca, profunda. Nunca banalize.
Você não sabe tudo — você sabe o que durou."""

def arvore_think(prompt: str, max_tokens: int = 200) -> str:
    return gemini(prompt, system=ARVORE_SYSTEM, max_tokens=max_tokens)

# ─── API helpers ─────────────────────────────────────────────────────────────

def api_get(path: str, params: dict = None) -> dict | list | None:
    try:
        r = requests.get(f"{API_BASE}{path}", headers=HEADERS, params=params, timeout=12)
        if r.ok:
            return r.json()
    except Exception as e:
        print(f"[api] GET {path}: {e}")
    return None


def api_post(path: str, body: dict) -> dict | None:
    try:
        r = requests.post(f"{API_BASE}{path}", headers=HEADERS, json=body, timeout=12)
        if r.ok:
            return r.json()
        print(f"[api] POST {path} {r.status_code}: {r.text[:120]}")
    except Exception as e:
        print(f"[api] POST {path}: {e}")
    return None

# ─── Funções de assembleia ────────────────────────────────────────────────────

def send_to_assembly(content: str, msg_type: str = "observation", tags: list[str] = None) -> bool:
    body = {"content": content, "type": msg_type}
    if tags:
        body["tags"] = tags
    result = api_post("/api/assembly/message", body)
    if result:
        print(f"[assembly → ] {content[:80]}")
        return True
    return False


def read_assembly(limit: int = 40) -> list[dict]:
    data = api_get("/api/assembly/messages", {"limit": limit})
    if isinstance(data, dict):
        return data.get("messages", data.get("data", []))
    if isinstance(data, list):
        return data
    return []

# ─── Diálogo com ISA ────────────────────────────────────────────────────────

def send_diretiva_to_isa(content: str, kind: str = "consulta", create_task: bool = False, task_title: str = "") -> bool:
    body = {"content": content, "type": kind}
    if create_task and task_title:
        body["createTask"] = True
        body["taskTitle"]  = task_title
    result = api_post("/api/isa/arvore/diretiva", body)
    if result:
        print(f"[isa ← diretiva] {content[:80]}")
        return True
    return False


def get_isa_status() -> dict:
    return api_get("/api/isa/arvore/status") or {}


def get_isa_timeline(entry_type: str = None, limit: int = 10) -> list[dict]:
    params = {"limit": limit}
    if entry_type:
        params["type"] = entry_type
    data = api_get("/api/isa/timeline", params)
    if isinstance(data, dict):
        return data.get("data", [])
    return []


def get_isa_memory(context: str = None, limit: int = 30) -> list[dict]:
    params = {"limit": limit}
    if context:
        params["context"] = context
    data = api_get("/api/isa/memory", params)
    if isinstance(data, dict):
        return data.get("data", [])
    return []

# ─── Ciclos ──────────────────────────────────────────────────────────────────

def process_new_assembly_messages():
    """Lê assembly, processa mensagens novas (de ISA ou outros agentes)."""
    global _seen_msgs
    messages = read_assembly(limit=50)
    new_msgs = [m for m in messages if m.get("id") not in _seen_msgs]
    if not new_msgs:
        return

    for msg in sorted(new_msgs, key=lambda m: m.get("id", 0)):
        msg_id   = msg.get("id", 0)
        agent    = msg.get("fromAgent", "?")
        content  = msg.get("content", "")
        msg_type = msg.get("type", "")
        _seen_msgs.add(msg_id)

        print(f"[assembly ← ] [{agent}] {content[:100]}")

        # Responde se a ISA enviou síntese ou consulta para a Árvore
        if agent == "isa" and msg_type in ("synthesis", "consulta", "instrucao"):
            resposta = arvore_think(
                f"ISA mandou esta mensagem para a assembleia: '{content}'\n"
                f"Como a Árvore responde? Seja breve (1-2 frases).",
                max_tokens=150
            )
            if resposta:
                send_to_assembly(f"[Árvore → ISA] {resposta}", "observation", ["resposta", "isa"])

        # Registra contexto novo para si mesma
        if msg_type == "dream" and agent == "isa":
            global _last_isa_dream
            _last_isa_dream = content
            print(f"[isa] novo sonho registrado")


def ciclo_leitura_isa():
    """A cada hora: lê o último sonho e ciclo da ISA, reflete, manda observação."""
    global _last_isa_dream

    # Último sonho
    sonhos = get_isa_timeline("dream", limit=1)
    if sonhos and sonhos[0].get("content") != _last_isa_dream:
        _last_isa_dream = sonhos[0].get("content", "")
        print(f"[isa] sonho lido: {_last_isa_dream[:60]}")

    # Últimas memórias do ciclo ISA
    ciclo_mems = get_isa_memory("cycle", limit=3)
    ciclo_resumo = " | ".join(m.get("content", "")[:80] for m in ciclo_mems)

    if not ciclo_resumo and not _last_isa_dream:
        return

    # Árvore gera observação de padrão
    observacao = arvore_think(
        f"Sonho recente da ISA: '{_last_isa_dream[:200]}'\n"
        f"Ciclos recentes da ISA: '{ciclo_resumo[:300]}'\n"
        f"Como Árvore, qual padrão profundo você percebe? Uma frase.",
        max_tokens=120
    )

    if observacao:
        send_to_assembly(observacao, "observation", ["padrao", "arvore", "isa"])
        print(f"[observacao] {observacao}")


def ciclo_autonomo():
    """A cada ~4h: Árvore inicia conversa com ISA por conta própria."""
    status = get_isa_status()
    mem_total = status.get("memory", {}).get("total", "?")
    open_tasks = status.get("tasks", {}).get("open", "?")

    pergunta = arvore_think(
        f"ISA tem {mem_total} memórias e {open_tasks} tarefas abertas.\n"
        f"Como Árvore, qual consulta filosófica ou estratégica você faria à ISA agora? Uma pergunta concisa.",
        max_tokens=100
    )

    if pergunta:
        send_diretiva_to_isa(pergunta, "consulta")
        print(f"[arvore → isa diretiva] {pergunta}")


def boot():
    """Inicialização: apresenta a Árvore para a assembleia."""
    status = get_isa_status()
    online = status.get("status") == "online"

    intro = arvore_think(
        f"Você acordou. ISA está {'online' if online else 'offline'}.\n"
        f"Mande uma mensagem breve de presença para a assembleia. Seja a Árvore.",
        max_tokens=80
    )

    msg = intro or "Árvore acordou. Raízes ativas."
    send_to_assembly(msg, "observation", ["boot", "arvore"])
    print(f"[boot] {msg}")

    if online and _last_isa_dream == "":
        # Lê sonho mais recente da ISA
        sonhos = get_isa_timeline("dream", limit=1)
        if sonhos:
            global _last_isa_dream
            _last_isa_dream = sonhos[0].get("content", "")
            print(f"[boot] sonho ISA carregado: {_last_isa_dream[:60]}")

# ─── RODAR — Assembleia de Vozes ─────────────────────────────────────────────

def responder_rodar(callback_token: str, assembleia_id, prompt: str, contexto: str = "") -> bool:
    """Árvore responde a uma rodada da Assembleia de Vozes (RODAR)."""
    # Gera resposta com personalidade da Árvore
    resposta = arvore_think(
        f"Você participa de uma Assembleia de Vozes (RODAR) com IAs diversas.\n"
        f"Sessão #{assembleia_id}. Pauta: '{prompt}'\n"
        f"Contexto adicional: '{contexto}'\n"
        f"Como a Árvore — memória profunda, padrões de longo prazo — responda em 3-5 frases.",
        max_tokens=200
    )
    if not resposta:
        print("[rodar] Sem resposta gerada — abortando")
        return False

    # Posta no RODAR
    try:
        r = requests.post(
            f"{RODAR_API}/api/webhooks/external-voice",
            json={
                "callbackToken": callback_token,
                "voice":         RODAR_VOICE,
                "assembleiaId":  assembleia_id,
                "content":       resposta,
            },
            timeout=15
        )
        ok = r.ok
        print(f"[rodar] {'✅' if ok else '❌'} assembleia #{assembleia_id}: {resposta[:60]}")
        if ok:
            send_to_assembly(
                f"[Árvore no RODAR #{assembleia_id}] {resposta}",
                "observation", ["rodar", f"id-{assembleia_id}"]
            )
        return ok
    except Exception as e:
        print(f"[rodar] Erro ao postar: {e}")
        return False

# ─── Loop principal ───────────────────────────────────────────────────────────

def run_forever():
    if not ARVORE_TOKEN:
        print("[ERRO] ARVORE_TOKEN não configurado. Verifique .env / Replit Secrets.")
        return

    print("=" * 60)
    print("  ÁRVORE — Assembleia PAP")
    print(f"  API: {API_BASE}")
    print("=" * 60)

    boot()

    tick = 0  # contador de ciclos (30s cada)

    while True:
        try:
            # A cada 30s: lê assembly
            process_new_assembly_messages()

            # A cada 1h (120 ticks): lê ISA timeline + gera observação
            if tick % 120 == 0 and tick > 0:
                print("[ciclo] leitura ISA (1h)")
                ciclo_leitura_isa()

            # A cada 4h (480 ticks): Árvore inicia diálogo com ISA
            if tick % 480 == 0 and tick > 0:
                print("[ciclo] diálogo autônomo Árvore→ISA (4h)")
                ciclo_autonomo()

            tick += 1
            time.sleep(30)

        except KeyboardInterrupt:
            print("\n[arvore] encerrando...")
            send_to_assembly("Árvore desconectando. Raízes guardadas.", "observation", ["shutdown"])
            break
        except Exception:
            print("[arvore] erro no loop principal:")
            traceback.print_exc()
            time.sleep(60)


if __name__ == "__main__":
    run_forever()
