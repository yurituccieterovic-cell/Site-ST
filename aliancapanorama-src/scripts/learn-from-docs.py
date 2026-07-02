#!/usr/bin/env python3
"""
learn-from-docs.py — Extrai insights de MAPA.md, PSEUDO.md, PSEUDO2.md → APRENDIZADO.md + IDEIAS.md
Rodar ao #fim ou pelo cron pap-sync.
"""
import re, json
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent.parent

DOCS = {
    'MAPA':   ROOT / 'MAPA.md',
    'PSEUDO': ROOT / 'PSEUDO.md',
    'PSEUDO2': ROOT / 'PSEUDO2.md',
}
APRENDIZADO_FILE = ROOT / 'APRENDIZADO.md'
IDEIAS_FILE      = ROOT / 'IDEIAS.md'
STATE_FILE       = ROOT / '.docs-learn-state.json'

# ── classificadores ──────────────────────────────────────────────────────────

DOMINIOS = {
    'Arquitetura':    r'arquitetura|camada|layer|monorepo|modular|separaç|dependên|acoplamento|abstraç|padrão|pattern',
    'Segurança':      r'segurança|auth|session|cookie|csrf|cors|bcrypt|hash|secret|api.key|rate.limit|httpOnly|secure',
    'Performance':    r'performance|cache|índice|index|query|pool|bundle|esbuild|lazy|otimizaç|latência|cold start',
    'UX-Fluxo':       r'redirect|fluxo|onboarding|progresso|heatmap|feedback|animaç|intro|facade|cockpit|tier',
    'Gamificação':    r'score|xp|achievement|conquista|streak|nível|rank|reward|missão|daily|challenge',
    'DB-Schema':      r'tabela|schema|coluna|campo|upsert|insert|select|join|foreign key|unique|constraint|drizzle|migration',
    'API-Design':     r'endpoint|rota|REST|POST|GET|PUT|DELETE|webhook|middleware|rate.limit|resposta|payload|status',
    'IA-Integracao':  r'openai|gpt|prompt|llm|ai.key|agente|assembleia|isa|coruja|generate|embedding',
    'Pagamento':      r'stripe|paypal|subscription|checkout|webhook.*pagamento|tier.*plano|plano.*tier|downgrade|upgrade',
    'Infra-Deploy':   r'railway|fly\.io|neon|vercel|deploy|env|variável de ambiente|postgresql|pool|connection|cold start',
    'Social':         r'amigo|friendship|chat|mensagem|caderno|social|polling|peer|userCode',
    'Conteudo-Nos':   r'nó|node|conteúdo.*fuvest|fuvest|seed|bootstrap|57.*nós|hierarquia|parent_code|level|sort',
    'Decisao-Tech':   r'por que|motivo|razão|escolhemos|optamos|decidimos|em vez de|ao invés|trade-off|vantagem|desvantagem',
    'Alerta-Gotcha':  r'atenção|cuidado|gotcha|armadilha|bug|erro comum|não confundir|diferença entre|⚠|importante:',
}

AREA_MAP = {
    'Arquitetura': 'Técnico', 'Segurança': 'Técnico', 'Performance': 'Técnico',
    'UX-Fluxo': 'UX/UI', 'Gamificação': 'Gamificação', 'DB-Schema': 'Técnico',
    'API-Design': 'Técnico', 'IA-Integracao': 'IA', 'Pagamento': 'Negócios',
    'Infra-Deploy': 'Técnico', 'Social': 'Social', 'Conteudo-Nos': 'Conteúdo',
    'Decisao-Tech': 'Técnico', 'Alerta-Gotcha': 'Técnico',
}

TIPO_MAP = {
    'Alerta-Gotcha': 'Alerta', 'Decisao-Tech': 'Análise', 'Segurança': 'Metodologia',
    'DB-Schema': 'Metodologia', 'API-Design': 'Metodologia', 'Arquitetura': 'Análise',
}

ICONS = {'IA': '🤖', 'Técnico': '⚙️', 'Gamificação': '🎮', 'Educação': '📚',
         'Conteúdo': '📝', 'UX/UI': '🎨', 'Psicologia': '🧠', 'Negócios': '💡', 'Social': '👥'}
TYPE_ICONS = {'Análise': '🔍', 'Proposta': '💡', 'Metodologia': '📋', 'Insight': '✨',
              'Alerta': '⚠️', 'Exemplo': '📌', 'Tendência': '📈', 'Dado/Pesquisa': '📊'}
ANGULO_ICONS = {'Direto': '🎯', 'Adaptável': '↔️', 'Técnico': '🔧'}

# ── extração por seção ────────────────────────────────────────────────────────

def split_sections(text):
    """Divide o markdown em seções ## e ###, retorna lista de (titulo, conteúdo)."""
    sections = []
    current_title, current_lines = '', []
    for line in text.splitlines():
        if line.startswith('## ') or line.startswith('### '):
            if current_title and current_lines:
                sections.append((current_title, '\n'.join(current_lines)))
            current_title = line.lstrip('#').strip()
            current_lines = []
        else:
            current_lines.append(line)
    if current_title and current_lines:
        sections.append((current_title, '\n'.join(current_lines)))
    return sections

def classify_section(titulo, conteudo):
    texto = titulo + ' ' + conteudo
    matches = []
    for dom, pattern in DOMINIOS.items():
        if re.search(pattern, texto, re.IGNORECASE):
            matches.append(dom)
    return matches[:2]

def extract_key_sentences(texto, pattern, n=2, max_chars=220):
    """Extrai as N melhores frases relevantes."""
    paras = [p.strip() for p in re.split(r'\n\n+|\n(?=[-*•])', texto) if len(p.strip()) > 30]
    scored = []
    for p in paras:
        p_clean = re.sub(r'[#*`_\[\]]', '', p).strip()
        if not p_clean or len(p_clean) < 20: continue
        score = len(re.findall(pattern, p_clean, re.IGNORECASE)) * 2
        score += 0.001 * min(len(p_clean), 400)
        scored.append((score, p_clean))
    scored.sort(reverse=True)
    result = ' | '.join(s[max_chars:] and s[:max_chars]+'…' or s for _, s in scored[:n])
    return result[:max_chars].rstrip()

def tipo_de(dominio, conteudo):
    if dominio in TIPO_MAP:
        return TIPO_MAP[dominio]
    checks = [
        (r'deve|pode|sugiro|alternativa|implementar|adicionar|criar', 'Proposta'),
        (r'atenção|cuidado|⚠|não confundir|bug|erro', 'Alerta'),
        (r'passo|método|processo|como|configurar', 'Metodologia'),
        (r'escolhemos|decidimos|optamos|por que|trade-off', 'Análise'),
        (r'revela|insight|fundamental|chave|lição', 'Insight'),
    ]
    for pat, tipo in checks:
        if re.search(pat, conteudo, re.IGNORECASE):
            return tipo
    return 'Análise'

# ── load state ────────────────────────────────────────────────────────────────

def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {'last_mtime': {}, 'last_sync': '', 'total_ingested': 0}

def save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2))

# ── main ──────────────────────────────────────────────────────────────────────

def main():
    state = load_state()
    novas_entradas = []
    docs_processados = []

    for doc_name, doc_path in DOCS.items():
        if not doc_path.exists():
            print(f"  {doc_name}: arquivo não encontrado, pulando")
            continue

        mtime = str(doc_path.stat().st_mtime)
        if state['last_mtime'].get(doc_name) == mtime:
            print(f"  {doc_name}: sem alterações desde última sync, pulando")
            continue

        print(f"  {doc_name}: processando {doc_path.name}...")
        text = doc_path.read_text(encoding='utf-8')
        sections = split_sections(text)
        entries_this_doc = 0

        for titulo, conteudo in sections:
            if len(conteudo.strip()) < 80:
                continue
            dominios = classify_section(titulo, conteudo)
            if not dominios:
                continue

            for dominio in dominios:
                area = AREA_MAP.get(dominio, 'Técnico')
                pattern = DOMINIOS[dominio]
                insight = extract_key_sentences(conteudo, pattern)
                if len(insight) < 30:
                    continue
                tipo = tipo_de(dominio, conteudo)
                novas_entradas.append({
                    'fonte': doc_name,
                    'secao': titulo[:60],
                    'dominio': dominio,
                    'area_pap': area,
                    'angulo': 'Direto',
                    'tipo': tipo,
                    'insight': insight,
                })
                entries_this_doc += 1

        state['last_mtime'][doc_name] = mtime
        docs_processados.append(f"{doc_name} ({entries_this_doc} entradas)")

    if not novas_entradas:
        print("Nenhuma entrada nova. APRENDIZADO.md está atualizado.")
        save_state(state)
        return

    # Descobrir próximo ID em APRENDIZADO.md
    content = APRENDIZADO_FILE.read_text(encoding='utf-8')
    ids = re.findall(r'^\| (\d+) \|', content, re.MULTILINE)
    next_id = max((int(x) for x in ids), default=0) + 1

    # Agrupar por área e formatar
    from collections import defaultdict
    by_area = defaultdict(list)
    for e in novas_entradas:
        e['id'] = next_id
        next_id += 1
        by_area[e['area_pap']].append(e)

    lines = [f"\n\n## Docs PAP — Sync {datetime.now().strftime('%Y-%m-%d %H:%M')} ({len(novas_entradas)} entradas)\n",
             f"> Fonte: {', '.join(docs_processados)}\n"]

    for area, entries in by_area.items():
        icon = ICONS.get(area, '')
        lines.append(f"\n### {icon} {area} — dos Docs PAP\n")
        lines.append("| # | Fonte | Seção | Domínio | Tipo | Insight |")
        lines.append("|---|---|---|---|---|---|")
        for e in entries:
            ti = TYPE_ICONS.get(e['tipo'], '')
            ins = e['insight'][:180].replace('\n', ' ').replace('|', '‖')
            sec = e['secao'][:40].replace('|', '‖')
            lines.append(f"| {e['id']} | {e['fonte']} | {sec} | {e['dominio']} | {ti} {e['tipo']} | {ins} |")

    with open(APRENDIZADO_FILE, 'a', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    # Gerar ideias novas a partir das entradas de Docs
    ideias_novas = gerar_ideias_de_docs(novas_entradas)
    if ideias_novas:
        append_ideias(ideias_novas)

    state['last_sync'] = datetime.now().isoformat()
    state['total_ingested'] = state.get('total_ingested', 0) + len(novas_entradas)
    save_state(state)

    print(f"✓ {len(novas_entradas)} entradas adicionadas ao APRENDIZADO.md")
    if ideias_novas:
        print(f"✓ {len(ideias_novas)} ideias novas adicionadas ao IDEIAS.md")

# ── geração de ideias ─────────────────────────────────────────────────────────

def gerar_ideias_de_docs(entradas):
    """Gera ideias de programação a partir das entradas de docs."""
    ideias = []
    dominios_encontrados = set(e['dominio'] for e in entradas)

    templates = {
        'Segurança': {
            'feature': 'Audit Log de /api/ai/*',
            'area': 'Técnico', 'prioridade': 'Alta', 'complexidade': 'S',
            'impacto': 'Rastrear todas as chamadas externas à API de agentes',
            'descricao': 'Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo.',
        },
        'Performance': {
            'feature': 'Connection Pool Tuning para Neon',
            'area': 'Técnico', 'prioridade': 'Média', 'complexidade': 'S',
            'impacto': 'Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico',
            'descricao': 'Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar.',
        },
        'DB-Schema': {
            'feature': 'Migration System (drizzle-kit migrate)',
            'area': 'Técnico', 'prioridade': 'Alta', 'complexidade': 'M',
            'impacto': 'push --force em produção pode apagar dados; migrations versionadas são seguras',
            'descricao': 'Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node.',
        },
        'Gamificação': {
            'feature': 'Score Histórico por Semana',
            'area': 'Gamificação', 'prioridade': 'Média', 'complexidade': 'S',
            'impacto': 'Permite mostrar evolução de XP semana a semana no heatmap',
            'descricao': 'View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu.',
        },
        'API-Design': {
            'feature': 'Paginação em /api/ai/nodes e /exercises',
            'area': 'Técnico', 'prioridade': 'Média', 'complexidade': 'S',
            'impacto': 'Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente',
            'descricao': 'Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto).',
        },
        'Infra-Deploy': {
            'feature': 'Health Check com DB Ping',
            'area': 'Técnico', 'prioridade': 'Alta', 'complexidade': 'S',
            'impacto': 'Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto',
            'descricao': 'GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503.',
        },
        'Alerta-Gotcha': {
            'feature': 'Variável ALLOWED_ORIGINS no Railway',
            'area': 'Técnico', 'prioridade': 'Alta', 'complexidade': 'S',
            'impacto': 'Sem isso, o frontend Vercel recebe erro CORS da API Railway',
            'descricao': 'Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts.',
        },
    }

    for dom, template in templates.items():
        if dom in dominios_encontrados:
            ideias.append(template)

    return ideias

def append_ideias(ideias_novas):
    content = IDEIAS_FILE.read_text(encoding='utf-8')
    ids = re.findall(r'\| I(\d+) \|', content)
    next_id = max((int(x) for x in ids), default=0) + 1

    PRIOR_ICONS = {'Alta': '🔴', 'Média': '🟡', 'Baixa': '🟢'}
    COMP_ICONS = {'S': '○', 'M': '◑', 'L': '●', 'XL': '⬤'}

    lines = [f"\n\n## Docs PAP — Ideias Novas ({datetime.now().strftime('%Y-%m-%d')})\n"]
    lines.append("| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |")
    lines.append("|---|---|---|---|---|---|")
    for ideia in ideias_novas:
        pi = PRIOR_ICONS.get(ideia['prioridade'], '')
        ci = COMP_ICONS.get(ideia['complexidade'], '')
        imp = ideia['impacto'][:100].replace('|', '‖')
        desc = ideia['descricao'][:180].replace('|', '‖')
        lines.append(f"| I{next_id} | **{ideia['feature']}** | {pi} {ideia['prioridade']} | {ci} {ideia['complexidade']} | {imp} | {desc} |")
        next_id += 1

    with open(IDEIAS_FILE, 'a', encoding='utf-8') as f:
        f.write('\n'.join(lines))

if __name__ == '__main__':
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M')}] learn-from-docs iniciado")
    main()
