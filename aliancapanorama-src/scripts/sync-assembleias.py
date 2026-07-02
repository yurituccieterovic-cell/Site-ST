#!/usr/bin/env python3
"""
sync-assembleias.py — Sincroniza novas assembleias do Gmail → APRENDIZADO.md
Rodar ao #fim. Detecta assembleias novas desde a última sync e adiciona ao APRENDIZADO.md.
"""
import imaplib, email, json, re, os, sys
from email.header import decode_header
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).parent.parent
SECRETS_FILE = Path("/root/.pap-secrets")
APRENDIZADO_FILE = ROOT / "APRENDIZADO.md"
STATE_FILE = ROOT / ".assembleia-sync-state.json"

# ── helpers ──────────────────────────────────────────────────────────────────

def load_secrets():
    s = {}
    with open(SECRETS_FILE) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                s[k.strip()] = v.strip()
    return s

def decode_str(s):
    if s is None: return ""
    parts = decode_header(s)
    result = []
    for part, enc in parts:
        if isinstance(part, bytes):
            result.append(part.decode(enc or "utf-8", errors="replace"))
        else:
            result.append(str(part))
    return " ".join(result)

def get_body(msg):
    if msg.is_multipart():
        for part in msg.walk():
            ct = part.get_content_type()
            cd = str(part.get("Content-Disposition", ""))
            if ct == "text/plain" and "attachment" not in cd:
                payload = part.get_payload(decode=True)
                if payload:
                    return payload.decode(part.get_content_charset() or "utf-8", errors="replace")
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            return payload.decode(msg.get_content_charset() or "utf-8", errors="replace")
    return ""

def load_state():
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            return json.load(f)
    return {"last_uid": 0, "last_sync": "", "total_ingested": 0}

def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

# ── classificadores (espelho de generate-aprendizado.py) ────────────────────

DOMINIOS = {
    'Técnico-PAP': r'Aliança Panorama|SalesCockpit|cockpit|árvore de conhecimento|FUVEST|vestibular|pap-api|fly\.io|neon.*banco|session.*postgre|auth.*express',
    'Metodologia-Aprendizado': r'Zettelkasten|spaced repetition|active recall|Pomodoro|flash.*card|metacogni|memorização|forgetting curve|aprendizagem.*ativa|método.*estudo',
    'Gamificação': r'gamificaç|game design|mecânica.*jogo|reward loop|progression|badge|conquista.*jogo|level up|XP\b|achievement|missão|quest\b',
    'Psicologia-Motivacao': r'motivaç.*intrínsec|autodetermina|flow.*csikszentmihal|estado de fluxo|hábito.*atomic|dopamina|recompensa.*variável|streaks|procrastinaç|ansiedade.*provas',
    'Cognitivo': r'carga cognitiva|cognitive load|chunking|working memory|atenção.*limite|foco.*profundo|deep work|modo difuso',
    'UX-Design': r'experiência.*usuário|UX\b|usabilidade|information architecture|onboarding|first.*run|empty state|affordance|visual hierarchy|feedback.*visual',
    'IA-Educacao': r'IA.*educaç|educaç.*IA|tutor.*IA|AI tutor|personaliz.*aprendiz|adaptive learning|LLM.*ensino',
    'IA-Produto': r'produto.*IA|agente.*automátic|LLM.*API|custo.*openai|API.*openai|RAG\b|embeddings|vector.*search',
    'Produto-SaaS': r'freemium|tier.*acesso|paywall|conversão.*gratuito.*pago|retenção.*usuário|churn|plano.*assinatura|onboarding.*usuário',
    'Conteudo-FUVEST': r'biologia|química.*vestibular|física.*vestibular|matemática.*vest|redação.*vest|ciências.*natureza|ciências.*humanas',
    'Aprendizado-Social': r'aprender.*junto|peer.*learning|aprendizagem.*colaborativa|estudo.*grupo|accountability.*parceiro',
    'Arquitetura-Sistema': r'arquitetura.*nós|estrutura.*hierárquica|grafo.*conhecimento|knowledge graph|pré-requisitos.*conteúdo|árvore.*hierarquia',
    'Meta-Assembleia': r'memória.*IA|memória.*assembleia|contexto.*persistente|ecossistema.*IA|múltiplos.*agentes|banco.*memória',
}

AREA_MAP = {
    'Técnico-PAP': 'Técnico', 'Metodologia-Aprendizado': 'Educação',
    'Gamificação': 'Gamificação', 'Psicologia-Motivacao': 'Psicologia',
    'Cognitivo': 'Psicologia', 'UX-Design': 'UX/UI',
    'IA-Educacao': 'IA', 'IA-Produto': 'IA',
    'Produto-SaaS': 'Negócios', 'Conteudo-FUVEST': 'Conteúdo',
    'Aprendizado-Social': 'Social', 'Arquitetura-Sistema': 'Técnico',
    'Meta-Assembleia': 'IA',
}

ANGULO_MAP = {
    'Técnico-PAP': 'Direto', 'Metodologia-Aprendizado': 'Direto',
    'Gamificação': 'Direto', 'Psicologia-Motivacao': 'Adaptável',
    'Cognitivo': 'Adaptável', 'UX-Design': 'Direto',
    'IA-Educacao': 'Direto', 'IA-Produto': 'Técnico',
    'Produto-SaaS': 'Adaptável', 'Conteudo-FUVEST': 'Direto',
    'Aprendizado-Social': 'Adaptável', 'Arquitetura-Sistema': 'Direto',
    'Meta-Assembleia': 'Técnico',
}

ICONS = {'IA': '🤖', 'Técnico': '⚙️', 'Gamificação': '🎮', 'Educação': '📚',
         'Conteúdo': '📝', 'UX/UI': '🎨', 'Psicologia': '🧠', 'Negócios': '💡', 'Social': '👥'}
TYPE_ICONS = {'Análise': '🔍', 'Proposta': '💡', 'Metodologia': '📋', 'Insight': '✨',
              'Alerta': '⚠️', 'Exemplo': '📌', 'Tendência': '📈', 'Dado/Pesquisa': '📊'}
ANGULO_ICONS = {'Direto': '🎯', 'Adaptável': '↔️', 'Técnico': '🔧'}

def classificar(texto):
    matches = []
    for dominio, pattern in DOMINIOS.items():
        if re.search(pattern, texto, re.IGNORECASE):
            matches.append(dominio)
    return matches[:2]

def extrair_insight(texto, pattern, max_chars=200):
    paragrafos = [p.strip() for p in re.split(r'\n\n+', texto) if len(p.strip()) > 40]
    melhor, melhor_score = "", 0
    for p in paragrafos:
        p_clean = re.sub(r'[#*`_]', '', p).strip()
        sc = len(re.findall(pattern, p_clean, re.IGNORECASE)) + 0.001 * min(len(p_clean), 500)
        if sc > melhor_score:
            melhor_score, melhor = sc, p_clean
    if not melhor and paragrafos:
        melhor = re.sub(r'[#*`_]', '', paragrafos[0]).strip()
    return melhor[:max_chars].rstrip()

def tipo_conteudo(texto):
    checks = [
        (r'\d+%|\d+ usuários|pesquisa|estudo indica|dados mostram', 'Dado/Pesquisa'),
        (r'deve|pode|sugiro|proposta|solução|alternativa|implementar', 'Proposta'),
        (r'passo a passo|método|como fazer|técnica|processo|framework', 'Metodologia'),
        (r'problema|falha|não funciona|desafio|limitação|cuidado', 'Alerta'),
        (r'futuro|tendência|emergente|vai ser|cada vez mais', 'Tendência'),
        (r'por exemplo|como o|caso de|ilustra|demonstra', 'Exemplo'),
        (r'chave é|fundamental|essencial|revela|lição|insight', 'Insight'),
    ]
    for pattern, tipo in checks:
        if re.search(pattern, texto, re.IGNORECASE):
            return tipo
    return 'Análise'

# ── main ─────────────────────────────────────────────────────────────────────

def main():
    state = load_state()
    last_uid = state["last_uid"]

    s = load_secrets()
    if not s.get("GMAIL_ACCOUNT") or not s.get("GMAIL_APP_PASSWORD"):
        print("ERRO: GMAIL_ACCOUNT ou GMAIL_APP_PASSWORD não configurados em .pap-secrets")
        sys.exit(1)

    print(f"Conectando ao Gmail ({s['GMAIL_ACCOUNT']})...")
    mail = imaplib.IMAP4_SSL("imap.gmail.com", 993)
    mail.login(s["GMAIL_ACCOUNT"], s["GMAIL_APP_PASSWORD"].replace(" ", ""))
    mail.select("INBOX", readonly=True)

    _, data = mail.search(None, 'SUBJECT "Assembleia"')
    all_ids = data[0].split()

    # Filtrar apenas UIDs maiores que o último sincronizado
    new_ids = [uid for uid in all_ids if int(uid) > last_uid]
    print(f"Assembleias novas desde última sync: {len(new_ids)} (último UID: {last_uid})")

    if not new_ids:
        print("Nenhuma assembleia nova. APRENDIZADO.md está atualizado.")
        mail.logout()
        return

    novas_entradas = []
    for uid in new_ids:
        _, rawdata = mail.fetch(uid, "(RFC822)")
        msg = email.message_from_bytes(rawdata[0][1])
        subject = decode_str(msg.get("Subject", ""))
        body = get_body(msg)

        if not body or 'nada desta sessão' in body.lower():
            continue

        num = re.search(r'#(\d+)', subject)
        tema_match = re.search(r'Assembleia\s+#?\d*\s*[—-]\s*[""""]?(.{5,80}?)(?:[""""]\s*$|\n)', body)
        tema = tema_match.group(1).strip() if tema_match else subject[:60]

        dominios = classificar(body)
        if not dominios:
            continue

        for dominio in dominios:
            area = AREA_MAP.get(dominio, 'Geral')
            angulo = ANGULO_MAP.get(dominio, 'Adaptável')
            insight = extrair_insight(body, DOMINIOS[dominio])
            if len(insight) < 30:
                continue
            tipo = tipo_conteudo(insight)
            novas_entradas.append({
                'uid': int(uid),
                'assembleia': int(num.group(1)) if num else 0,
                'tema': tema[:80],
                'dominio': dominio,
                'area_pap': area,
                'angulo': angulo,
                'tipo': tipo,
                'insight': insight,
            })

    mail.logout()

    if not novas_entradas:
        print("Assembleias novas encontradas mas nenhuma com conteúdo PAP-relevante.")
        state["last_uid"] = int(new_ids[-1]) if new_ids else last_uid
        state["last_sync"] = datetime.now().isoformat()
        save_state(state)
        return

    # Lê APRENDIZADO.md para saber o último ID
    content = APRENDIZADO_FILE.read_text(encoding="utf-8")
    ids_existentes = re.findall(r'^\| (\d+) \|', content, re.MULTILINE)
    next_id = max((int(x) for x in ids_existentes), default=0) + 1

    # Agrupar por área e adicionar ao final da seção correspondente
    by_area = {}
    for e in novas_entradas:
        by_area.setdefault(e['area_pap'], []).append(e)

    lines_to_add = []
    lines_to_add.append(f"\n\n## Sync {datetime.now().strftime('%Y-%m-%d')} — {len(novas_entradas)} novas entradas\n")
    for area, entries in by_area.items():
        icon = ICONS.get(area, '')
        lines_to_add.append(f"\n### {icon} {area} (novas)\n")
        lines_to_add.append("| # | Asm | Tema | Dom. | Ângulo | Tipo | Insight para o PAP |")
        lines_to_add.append("|---|---|---|---|---|---|---|")
        for e in entries:
            e['id'] = next_id
            next_id += 1
            ai = ANGULO_ICONS.get(e['angulo'], '')
            ti = TYPE_ICONS.get(e['tipo'], '')
            ins = e['insight'][:160].replace('\n', ' ').replace('|', '‖')
            tema = e['tema'][:50].replace('|', '‖')
            lines_to_add.append(f"| {e['id']} | #{e['assembleia']} | {tema} | {e['dominio']} | {ai} {e['angulo']} | {ti} {e['tipo']} | {ins} |")

    with open(APRENDIZADO_FILE, "a", encoding="utf-8") as f:
        f.write('\n'.join(lines_to_add))

    state["last_uid"] = max(int(uid) for uid in new_ids)
    state["last_sync"] = datetime.now().isoformat()
    state["total_ingested"] = state.get("total_ingested", 0) + len(novas_entradas)
    save_state(state)

    print(f"✓ {len(novas_entradas)} novas entradas adicionadas ao APRENDIZADO.md")
    print(f"  Último UID sincronizado: {state['last_uid']}")

if __name__ == "__main__":
    main()
