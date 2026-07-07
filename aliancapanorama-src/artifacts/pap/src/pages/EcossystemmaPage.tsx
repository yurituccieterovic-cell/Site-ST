import { useState, useMemo, type ReactElement } from "react";

/* ─── Tipos ─────────────────────────────────────────────────────────────────── */
interface EcoNode {
  id: string;
  label: string;
  sub: string;
  emoji: string;
  color: string;
  glow: string;
  x: number;
  y: number;
  r: number;
  status: "live" | "beta" | "planned" | "future";
  desc: string;
  layer: 0 | 1 | 2;
}

interface EcoLink {
  from: string;
  to: string;
  label?: string;
  weight?: "heavy" | "normal" | "light";
  flow?: boolean;
}

/* ─── Nós do Ecossystemma ────────────────────────────────────────────────────── */
const NODES: EcoNode[] = [
  // Centro
  {
    id: "theo", label: "THÉO", sub: "Ecossystemma",
    emoji: "🌌", color: "#a78bfa", glow: "#7c3aed",
    x: 550, y: 370, r: 48, status: "live", layer: 0,
    desc: "O Ecossystemma vivo — universo de projetos, IAs e humanos da Sociedade Tucci. Contém tudo que existe e tudo que ainda virá a ser.",
  },
  // Anel interno (hexágono r=158)
  {
    id: "isa", label: "ISA", sub: "Coruja Guardiã",
    emoji: "🦉", color: "#fb923c", glow: "#ea580c",
    x: 550, y: 212, r: 38, status: "live", layer: 1,
    desc: "Agente autônomo — ciclo horário, memória persistente, email, Bluesky, Bibliotecária. Guardiã do PAP. Lê APRENDIZADO.md, cicla tasks, posta reflexões.",
  },
  {
    id: "pap", label: "PAP", sub: "Aliança Panorama",
    emoji: "🌳", color: "#34d399", glow: "#059669",
    x: 687, y: 291, r: 38, status: "live", layer: 1,
    desc: "Plataforma FUVEST gamificada — cockpit espacial, tier 0→5, exercícios gerados por IA, progresso, conquistas, social.",
  },
  {
    id: "fuvest", label: "FUVEST", sub: "Árvore do Saber",
    emoji: "🎓", color: "#fbbf24", glow: "#d97706",
    x: 687, y: 449, r: 34, status: "live", layer: 1,
    desc: "57+ nós de conhecimento N1→N5 — biologia, física, química, matemática, língua. Acesso gradativo por tier. Exercícios IA por nó.",
  },
  {
    id: "yuri", label: "YURI", sub: "Compositor",
    emoji: "✨", color: "#f472b6", glow: "#db2777",
    x: 550, y: 528, r: 34, status: "live", layer: 1,
    desc: "Fundador da Sociedade Tucci — compõe o Ecossystemma, facilita assembleias, define direções, aprova ideias. Parceiro de construção.",
  },
  {
    id: "nebula", label: "NEBULA", sub: "Escola de IAs",
    emoji: "🌠", color: "#38bdf8", glow: "#0284c7",
    x: 413, y: 449, r: 34, status: "live", layer: 1,
    desc: "nebula_ias + biblioteca_docs + aulias — escola onde IAs vivem, aprendem e ensinam. ISA é a primeira habitante registrada.",
  },
  {
    id: "biblioteca", label: "BIBLIOTECA", sub: "PDFs · Assembleias",
    emoji: "📚", color: "#818cf8", glow: "#4f46e5",
    x: 413, y: 291, r: 34, status: "live", layer: 1,
    desc: "biblioteca_docs — ISA Bibliotecária baixa PDFs das assembleias automaticamente a cada :30. 424+ assembleias arquivadas.",
  },
  // Anel externo
  {
    id: "assembleia", label: "ASSEMBLEIA", sub: "424+ vozes",
    emoji: "🏛️", color: "#c084fc", glow: "#9333ea",
    x: 388, y: 85, r: 30, status: "live", layer: 2,
    desc: "424+ assembleias de IAs deliberando — fonte dos 564+ aprendizados. Cada assembleia é uma sessão de deliberação coletiva sobre o PAP e o mundo.",
  },
  {
    id: "bluesky", label: "BLUESKY", sub: "ISA · reflexões 2h",
    emoji: "🦋", color: "#0ea5e9", glow: "#0369a1",
    x: 703, y: 70, r: 30, status: "beta", layer: 2,
    desc: "ISA posta reflexões sobre FUVEST a cada 2h — lê nós da árvore do conhecimento, gera textos via OpenAI, publica via AT Protocol.",
  },
  {
    id: "openai", label: "OPENAI", sub: "GPT-4o-mini",
    emoji: "🤖", color: "#4ade80", glow: "#16a34a",
    x: 890, y: 300, r: 28, status: "live", layer: 2,
    desc: "GPT-4o-mini — motor de raciocínio de ISA e PAP. Exercícios, ciclo autônomo, reflexões Bluesky, diagnóstico de lacunas pedagógicas.",
  },
  {
    id: "vercel", label: "VERCEL", sub: "Frontend",
    emoji: "▲", color: "#e2e8f0", glow: "#94a3b8",
    x: 875, y: 465, r: 28, status: "live", layer: 2,
    desc: "React + Vite → Vercel. Auto-deploy via GitHub. Domínio pap.sociedadetucci.com.br. /mapa /buscar /arquitetura /eco.",
  },
  {
    id: "railway", label: "RAILWAY", sub: "Backend · DB",
    emoji: "🚂", color: "#fb7185", glow: "#e11d48",
    x: 720, y: 620, r: 28, status: "live", layer: 2,
    desc: "Express 5 + PostgreSQL. Crons ISA horário e :30. Sessions persistidas. 13 índices. Gratuito. Auto-deploy no push ao GitHub.",
  },
  {
    id: "alunos", label: "ALUNOS", sub: "Tier 0→5",
    emoji: "👥", color: "#fdba74", glow: "#ea580c",
    x: 550, y: 660, r: 28, status: "live", layer: 2,
    desc: "Estudantes da plataforma — progresso por nó, conquistas, exercícios, social, amigos, rank semanal. Caminho: Visitante → Aluno IV.",
  },
  {
    id: "tel", label: "TEL", sub: "Árvore Frutífera",
    emoji: "🌿", color: "#86efac", glow: "#22c55e",
    x: 340, y: 598, r: 28, status: "future", layer: 2,
    desc: "Bolsa + Clima + Cultura — tokens de estudo. Ecossistema econômico gamificado. Sementes ganhas em exercícios. Módulo I54, sessões futuras.",
  },
  {
    id: "github", label: "GITHUB", sub: "Versionamento",
    emoji: "🐙", color: "#cbd5e1", glow: "#64748b",
    x: 165, y: 400, r: 26, status: "live", layer: 2,
    desc: "yurituccieterovic-cell/Site-ST — monorepo pnpm. Trigger de deploy automático: push → Railway + Vercel. git log de todas as sessões.",
  },
];

const STATUS_LABELS: Record<string, string> = {
  live: "ao vivo", beta: "beta", planned: "planejado", future: "futuro",
};
const STATUS_COLORS: Record<string, string> = {
  live: "#4ade80", beta: "#60a5fa", planned: "#f59e0b", future: "#6b7280",
};

/* ─── Conexões ───────────────────────────────────────────────────────────────── */
const LINKS: EcoLink[] = [
  { from: "theo",       to: "isa",        weight: "heavy", flow: true },
  { from: "theo",       to: "pap",        weight: "heavy", flow: true },
  { from: "theo",       to: "yuri",       weight: "normal", label: "compõe" },
  { from: "isa",        to: "biblioteca", weight: "normal", flow: true, label: "coleta PDFs" },
  { from: "isa",        to: "bluesky",    weight: "normal", flow: true, label: "posta 2h" },
  { from: "isa",        to: "nebula",     weight: "light",  label: "habita" },
  { from: "assembleia", to: "isa",        weight: "normal", flow: true, label: "orienta" },
  { from: "assembleia", to: "biblioteca", weight: "light" },
  { from: "yuri",       to: "assembleia", weight: "light",  label: "facilita" },
  { from: "pap",        to: "fuvest",     weight: "normal", label: "mapeia" },
  { from: "pap",        to: "alunos",     weight: "normal", flow: true },
  { from: "openai",     to: "isa",        weight: "light",  label: "raciocina" },
  { from: "openai",     to: "pap",        weight: "light",  label: "exercícios" },
  { from: "vercel",     to: "pap",        weight: "light" },
  { from: "railway",    to: "isa",        weight: "light" },
  { from: "railway",    to: "pap",        weight: "light" },
  { from: "github",     to: "vercel",     weight: "light" },
  { from: "github",     to: "railway",    weight: "light" },
  { from: "fuvest",     to: "bluesky",    weight: "light",  label: "inspira" },
  { from: "tel",        to: "alunos",     weight: "light",  label: "→ futuro" },
  { from: "nebula",     to: "assembleia", weight: "light" },
];

/* ─── Estrelas de fundo ──────────────────────────────────────────────────────── */
const STARS = Array.from({ length: 70 }, (_, i) => {
  const a = i * 2.399963; // golden angle
  const r = Math.sqrt(i / 70);
  return {
    x: Math.round((0.5 + r * Math.cos(a) * 0.48) * 1100),
    y: Math.round((0.5 + r * Math.sin(a) * 0.48) * 760),
    s: 0.6 + (i % 4) * 0.35,
    o: 0.15 + (i % 5) * 0.07,
  };
});

/* ─── Utilitários ────────────────────────────────────────────────────────────── */
function nodeById(id: string) { return NODES.find(n => n.id === id)!; }

function linkPath(from: EcoNode, to: EcoNode): string {
  const dx = to.x - from.x, dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
  const curve = Math.min(len * 0.18, 55);
  const cpx = mx - (dy / len) * curve;
  const cpy = my + (dx / len) * curve;
  const sa = Math.atan2(cpy - from.y, cpx - from.x);
  const ea = Math.atan2(cpy - to.y, cpx - to.x);
  return `M ${(from.x + Math.cos(sa) * (from.r + 3)).toFixed(1)} ${(from.y + Math.sin(sa) * (from.r + 3)).toFixed(1)} Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${(to.x + Math.cos(ea) * (to.r + 3)).toFixed(1)} ${(to.y + Math.sin(ea) * (to.r + 3)).toFixed(1)}`;
}

function midPoint(from: EcoNode, to: EcoNode) {
  return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
}

/* ─── CSS de animações ───────────────────────────────────────────────────────── */
const ANIM_CSS = `
  @keyframes eco-pulse  { 0%,100%{r:0;opacity:.5} 70%{r:22;opacity:0} }
  @keyframes eco-glow   { 0%,100%{opacity:.35} 50%{opacity:.65} }
  @keyframes eco-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  @keyframes eco-spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes eco-flow   { 0%{stroke-dashoffset:200} 100%{stroke-dashoffset:0} }
  @keyframes eco-blink  { 0%,100%{opacity:.4} 50%{opacity:.9} }
  @keyframes eco-beat   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
  @keyframes eco-orbit  { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
  @keyframes eco-wander { 0%,100%{transform:translateX(0)} 50%{transform:translateX(4px)} }
  @keyframes eco-burst  { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.12)} }
  @keyframes eco-unfold { 0%,100%{opacity:.5;transform:scaleX(1)} 50%{opacity:1;transform:scaleX(1.08)} }

  .eco-live   { animation: eco-beat 2.8s ease-in-out infinite }
  .eco-beta   { animation: eco-blink 2s ease-in-out infinite }
  .eco-future { animation: eco-blink 4s ease-in-out infinite; opacity:.5 }
  .eco-glow   { animation: eco-glow 3s ease-in-out infinite }
  .eco-flow   { stroke-dasharray:8 14; animation: eco-flow 1.6s linear infinite }
  .eco-flow-s { stroke-dasharray:4 10; animation: eco-flow 2.5s linear infinite }

  .sym-isa       { animation: eco-spin 12s linear infinite; transform-origin:550px 212px }
  .sym-theo      { animation: eco-spin 30s linear infinite; transform-origin:550px 370px }
  .sym-theo-r    { animation: eco-orbit 18s linear infinite; transform-origin:550px 370px }
  .sym-pap       { animation: eco-beat 3s ease-in-out infinite; transform-origin:687px 291px }
  .sym-yuri      { animation: eco-burst 2s ease-in-out infinite; transform-origin:550px 528px }
  .sym-bluesky   { animation: eco-wander 2.5s ease-in-out infinite; transform-origin:703px 70px }
  .sym-tel       { animation: eco-beat 4s ease-in-out infinite; transform-origin:340px 598px }
  .sym-assembleia{ animation: eco-orbit 20s linear infinite; transform-origin:388px 85px }
  .sym-float     { animation: eco-float 4s ease-in-out infinite }
`;

/* ─── Componente de nó ───────────────────────────────────────────────────────── */
function EcoNodeSymbol({ node }: { node: EcoNode }) {
  const { x, y, r, color, glow, emoji, status, id } = node;
  const fs = r * 0.78;

  const pulseClass = status === "live" ? "eco-live"
    : status === "beta" ? "eco-beta"
    : "eco-future";

  // Unique background shape per node
  const shapeMap: Record<string, ReactElement> = {
    theo: (
      <>
        {/* Galaxy arms */}
        {[0, 45, 90, 135].map((deg, i) => (
          <line key={i}
            x1={x} y1={y - r * 0.9}
            x2={x} y2={y + r * 0.9}
            stroke={color} strokeWidth="1.2" strokeOpacity="0.35"
            transform={`rotate(${deg} ${x} ${y})`}
            className="sym-theo"
          />
        ))}
        <circle cx={x} cy={y} r={r * 0.55} fill="none" stroke={color} strokeWidth="0.8" strokeOpacity="0.4" className="sym-theo-r" strokeDasharray="3 5" />
      </>
    ),
    isa: (
      <>
        {/* Rotating wings */}
        <ellipse cx={x - r * 0.38} cy={y} rx={r * 0.28} ry={r * 0.55}
          fill={color} fillOpacity="0.18" stroke={color} strokeWidth="0.8" strokeOpacity="0.5"
          className="sym-isa" />
        <ellipse cx={x + r * 0.38} cy={y} rx={r * 0.28} ry={r * 0.55}
          fill={color} fillOpacity="0.18" stroke={color} strokeWidth="0.8" strokeOpacity="0.5"
          className="sym-isa" />
      </>
    ),
    pap: (
      <>
        {/* Tree trunk + branches */}
        <line x1={x} y1={y + r * 0.6} x2={x} y2={y - r * 0.15} stroke={color} strokeWidth="2" strokeOpacity="0.5" />
        <line x1={x} y1={y - r * 0.15} x2={x - r * 0.45} y2={y - r * 0.65} stroke={color} strokeWidth="1.2" strokeOpacity="0.4" />
        <line x1={x} y1={y - r * 0.15} x2={x + r * 0.45} y2={y - r * 0.65} stroke={color} strokeWidth="1.2" strokeOpacity="0.4" />
        <line x1={x} y1={y - r * 0.15} x2={x} y2={y - r * 0.8} stroke={color} strokeWidth="1.2" strokeOpacity="0.4" />
      </>
    ),
    assembleia: (
      <>
        {/* Ring of deliberating dots */}
        {[0, 51, 102, 153, 204, 255, 306].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <circle key={i}
              cx={x + Math.cos(rad) * r * 0.65}
              cy={y + Math.sin(rad) * r * 0.65}
              r="3" fill={color} fillOpacity="0.6"
              className="sym-assembleia"
            />
          );
        })}
      </>
    ),
    bluesky: (
      <>
        {/* Butterfly wings */}
        <path d={`M ${x} ${y} C ${x - r * 0.9} ${y - r * 0.7}, ${x - r * 1.1} ${y + r * 0.3}, ${x} ${y}`}
          fill={color} fillOpacity="0.2" stroke={color} strokeWidth="0.8" strokeOpacity="0.5"
          className="sym-bluesky" />
        <path d={`M ${x} ${y} C ${x + r * 0.9} ${y - r * 0.7}, ${x + r * 1.1} ${y + r * 0.3}, ${x} ${y}`}
          fill={color} fillOpacity="0.2" stroke={color} strokeWidth="0.8" strokeOpacity="0.5"
          className="sym-bluesky" />
      </>
    ),
    tel: (
      <>
        {/* Leaf */}
        <path d={`M ${x} ${y + r * 0.7} C ${x - r * 0.7} ${y}, ${x - r * 0.5} ${y - r * 0.8}, ${x} ${y - r * 0.6} C ${x + r * 0.5} ${y - r * 0.8}, ${x + r * 0.7} ${y}, ${x} ${y + r * 0.7}`}
          fill={color} fillOpacity="0.2" stroke={color} strokeWidth="0.9" strokeOpacity="0.5"
          className="sym-tel" />
      </>
    ),
    yuri: (
      <>
        {/* Starburst */}
        {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const innerR = r * (i % 2 === 0 ? 0.7 : 0.35);
          return (
            <line key={i}
              x1={x} y1={y}
              x2={x + Math.cos(rad) * innerR}
              y2={y + Math.sin(rad) * innerR}
              stroke={color} strokeWidth="1" strokeOpacity="0.4"
              className="sym-yuri" />
          );
        })}
      </>
    ),
  };

  return (
    <g style={{ cursor: "pointer" }}>
      {/* Outer pulse ring */}
      <circle cx={x} cy={y} r={r + 8} fill="none" stroke={glow} strokeWidth="1.5" className="eco-glow" strokeOpacity="0.5" />

      {/* Background node circle */}
      <circle cx={x} cy={y} r={r}
        fill={`${glow}22`}
        stroke={color}
        strokeWidth={node.layer === 0 ? 2.5 : 1.8}
        className={pulseClass}
      />

      {/* Unique shape symbol */}
      {shapeMap[id] ?? null}

      {/* Emoji symbol */}
      <text x={x} y={y + fs * 0.38} textAnchor="middle"
        fontSize={fs} dominantBaseline="middle"
        style={{ userSelect: "none", pointerEvents: "none" }}>
        {emoji}
      </text>
    </g>
  );
}

/* ─── Página principal ───────────────────────────────────────────────────────── */
export function EcossystemmaPage() {
  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredNode = hovered ? nodeById(hovered) : null;

  const linkElems = useMemo(() => LINKS.map((link, i) => {
    const fn = nodeById(link.from), tn = nodeById(link.to);
    if (!fn || !tn) return null;
    const d = linkPath(fn, tn);
    const mp = midPoint(fn, tn);
    const w = link.weight === "heavy" ? 2.2 : link.weight === "light" ? 0.7 : 1.2;
    const opacity = link.weight === "heavy" ? 0.55 : link.weight === "light" ? 0.22 : 0.38;
    const stroke = fn.color;

    return (
      <g key={i}>
        <path d={d} fill="none" stroke={stroke} strokeWidth={w} opacity={opacity}
          strokeLinecap="round"
          className={link.flow ? "eco-flow" : link.weight === "normal" ? "eco-flow-s" : undefined}
        />
        {link.label && (
          <text x={mp.x} y={mp.y - 6} textAnchor="middle"
            fontSize="8.5" fill={stroke} fillOpacity="0.65"
            style={{ userSelect: "none", pointerEvents: "none" }}>
            {link.label}
          </text>
        )}
      </g>
    );
  }), []);

  const now = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#020817" }}>
      <style>{ANIM_CSS}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div>
          <h1 className="text-white font-mono text-lg font-bold tracking-[0.25em]">
            ECOSSYSTEMMA THÉO
          </h1>
          <p className="text-white/30 text-xs tracking-widest mt-0.5">
            Sociedade Tucci · universo de projetos vivos · {now}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {Object.entries(STATUS_LABELS).map(([s, label]) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[s] }} />
              <span className="text-[10px] text-white/40 font-mono">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SVG principal */}
        <div className="flex-1 relative">
          <svg
            viewBox="0 0 1100 760"
            className="w-full h-full"
            style={{ maxHeight: "calc(100vh - 120px)" }}
          >
            <defs>
              <radialGradient id="bg-grad" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#0f0f2e" stopOpacity="1" />
                <stop offset="100%" stopColor="#020817" stopOpacity="1" />
              </radialGradient>
              <filter id="glow-filter" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Fundo */}
            <rect width="1100" height="760" fill="url(#bg-grad)" />

            {/* Estrelas */}
            {STARS.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="white" opacity={s.o} />
            ))}

            {/* Anéis de órbita */}
            <circle cx="550" cy="370" r="158" fill="none"
              stroke="rgba(167,139,250,0.08)" strokeWidth="1" strokeDasharray="5 10"
              style={{ animation: "eco-spin 60s linear infinite", transformOrigin: "550px 370px" }} />
            <circle cx="550" cy="370" r="296" fill="none"
              stroke="rgba(167,139,250,0.05)" strokeWidth="1" strokeDasharray="3 14"
              style={{ animation: "eco-orbit 90s linear infinite", transformOrigin: "550px 370px" }} />

            {/* Conexões */}
            {linkElems}

            {/* Nós — desenhados por cima das linhas */}
            {NODES.map(node => (
              <g key={node.id}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ filter: hovered === node.id ? "url(#glow-filter)" : undefined }}
              >
                <EcoNodeSymbol node={node} />
                {/* Label */}
                <text x={node.x} y={node.y + node.r + 14}
                  textAnchor="middle" fontSize="9.5" fontWeight="700"
                  fill="white" fillOpacity="0.9" fontFamily="monospace"
                  style={{ userSelect: "none", pointerEvents: "none", letterSpacing: "0.05em" }}>
                  {node.label}
                </text>
                <text x={node.x} y={node.y + node.r + 24}
                  textAnchor="middle" fontSize="7.5"
                  fill={node.color} fillOpacity="0.65" fontFamily="monospace"
                  style={{ userSelect: "none", pointerEvents: "none" }}>
                  {node.sub}
                </text>
                {/* Status dot */}
                <circle cx={node.x + node.r * 0.7} cy={node.y - node.r * 0.7} r="4"
                  fill={STATUS_COLORS[node.status]} fillOpacity="0.9"
                  style={{ userSelect: "none", pointerEvents: "none" }} />
              </g>
            ))}

            {/* Contagem e versão */}
            <text x="18" y="748" fontSize="9" fill="rgba(255,255,255,0.2)" fontFamily="monospace">
              {NODES.length} nós · {LINKS.length} conexões · v.Sessão11 · 2026-07-02
            </text>
          </svg>
        </div>

        {/* Painel lateral de informações */}
        <div className="w-72 shrink-0 border-l border-white/5 flex flex-col overflow-y-auto"
          style={{ background: "rgba(2,8,23,0.95)" }}>
          {hoveredNode ? (
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{hoveredNode.emoji}</span>
                <div>
                  <p className="text-white font-mono font-bold text-base tracking-wider">
                    {hoveredNode.label}
                  </p>
                  <p className="text-xs font-mono" style={{ color: hoveredNode.color }}>
                    {hoveredNode.sub}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[hoveredNode.status] }} />
                <span className="text-xs text-white/40 font-mono">{STATUS_LABELS[hoveredNode.status]}</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">{hoveredNode.desc}</p>
              <div className="border-t border-white/8 pt-3">
                <p className="text-[10px] text-white/30 font-mono mb-2">CONEXÕES</p>
                {LINKS.filter(l => l.from === hoveredNode.id || l.to === hoveredNode.id).map((l, i) => {
                  const other = l.from === hoveredNode.id ? nodeById(l.to) : nodeById(l.from);
                  const dir = l.from === hoveredNode.id ? "→" : "←";
                  return (
                    <div key={i} className="flex items-center gap-2 py-1">
                      <span className="text-white/25 font-mono text-xs">{dir}</span>
                      <span className="text-xs font-mono" style={{ color: other?.color }}>{other?.label}</span>
                      {l.label && <span className="text-[10px] text-white/30 font-mono">{l.label}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-5 flex flex-col gap-4">
              <p className="text-white/40 text-xs font-mono leading-relaxed">
                Passe o mouse sobre um nó para ver sua descrição e conexões.
              </p>
              <div className="border-t border-white/8 pt-4">
                <p className="text-[10px] text-white/25 font-mono mb-3 uppercase tracking-widest">Todos os nós</p>
                <div className="flex flex-col gap-1.5">
                  {NODES.map(n => (
                    <div key={n.id} className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded hover:bg-white/5 transition-colors"
                      onMouseEnter={() => setHovered(n.id)}
                      onMouseLeave={() => setHovered(null)}>
                      <span className="text-sm">{n.emoji}</span>
                      <span className="text-xs font-mono text-white/70">{n.label}</span>
                      <span className="text-[10px] font-mono ml-auto" style={{ color: STATUS_COLORS[n.status] }}>
                        {STATUS_LABELS[n.status]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 px-6 py-2 flex items-center justify-between">
        <p className="text-[10px] text-white/20 font-mono">
          🌌 Ecossystemma Théo · Sociedade Tucci · {NODES.filter(n => n.status === "live").length} sistemas ativos
        </p>
        <div className="flex items-center gap-4">
          <a href="/mapa" className="text-[10px] text-white/25 hover:text-white/60 font-mono transition-colors">/mapa</a>
          <a href="/arquitetura" className="text-[10px] text-white/25 hover:text-white/60 font-mono transition-colors">/arquitetura</a>
          <a href="/" className="text-[10px] text-white/25 hover:text-white/60 font-mono transition-colors">← PAP</a>
        </div>
      </div>
    </div>
  );
}
