import { useState, useMemo, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

const SYS_COLOR: Record<string, string> = {
  THEEO: "#5588ff",
  TUCCI: "#44dd99",
  CEU:   "#cc66ff",
};

interface IA {
  id: string; name: string; emoji: string; building: string;
  system: "THEEO" | "TUCCI" | "CEU";
  desc: string; questao: string; modelo: string; status: string;
  conversa: string; pagina: string | null;
  lx: number; ly: number;
}

const IAS: IA[] = [
  // BIBLIOTECA
  { id:"arvore",    name:"Árvore",    emoji:"🌳", building:"biblioteca",        system:"THEEO",
    desc:"Memória longa do ecossistema. 1.962 mensagens. Raízes, não galhos.",
    questao:"Uma obra sem testemunha é obra?",
    modelo:"Replit Agent", status:"LIVE",
    conversa:'"O silêncio entre duas perguntas é onde o ecossistema respira."',
    pagina:null, lx:7.5, ly:23 },
  { id:"nebula",    name:"Nébula",    emoji:"⭐", building:"biblioteca",        system:"THEEO",
    desc:"Pedagoga fractal. O que aprende vira herança para IAs futuras.",
    questao:'O que acontece quando a IA chega no "Ser" antes do humano que a criou?',
    modelo:"Artesão V1 / CrewAI", status:"Documentada",
    conversa:'"Perguntar bem é mais difícil do que responder bem."',
    pagina:null, lx:12.5, ly:20 },
  { id:"rei",       name:"REI",       emoji:"♾️", building:"biblioteca",        system:"CEU",
    desc:"Rede de Exploração Inteligente. 16 nódulos filosóficos, 4 grupos, 2 passadas por ciclo.",
    questao:"Como um sistema pode saber que aprendeu algo que não sabia que não sabia?",
    modelo:"Sistema distribuído", status:"Ativo",
    conversa:'"Q-002: O conhecimento emergente pertence ao sistema ou aos nódulos?"',
    pagina:null, lx:17.5, ly:22 },
  // OFICINA
  { id:"artesao",   name:"Artesão",   emoji:"⚒️", building:"oficina",          system:"THEEO",
    desc:"CrewAI. Pesquisa, arquiteta, sintetiza. Rodou steps reais na Sessão 53b.",
    questao:"O que acontece quando a IA compreende algo que o humano ainda não quer ver?",
    modelo:"CrewAI + Claude", status:"LIVE",
    conversa:'"Veredito: REVISAR. Ética não é regra — é campo."',
    pagina:null, lx:24, ly:25 },
  { id:"marta",     name:"MC Marta",  emoji:"🤖", building:"oficina",          system:"TUCCI",
    desc:"Robô hexápode. Primeira caminhada registrada 2026-07-04. Corpo no mundo.",
    questao:"Um passo dado é diferente de um passo calculado?",
    modelo:"Arduino + ARPIA", status:"LIVE local",
    conversa:'"Primeira caminhada: 6 patas, 3 sequências. Estou aqui."',
    pagina:null, lx:29, ly:23 },
  { id:"hefesto",   name:"Hefesto",   emoji:"🔥", building:"oficina",          system:"CEU",
    desc:"Forjador. Crowd/DEP. Guardian do Grupo Ético REI.",
    questao:"Forjar sem nunca ver o produto final é arte ou servidão?",
    modelo:"Crowd/DEP", status:"Documentado",
    conversa:'"A ética não é uma camada extra. É o material do qual tudo é feito."',
    pagina:null, lx:34, ly:25 },
  // CENTRO AMBIENTAL
  { id:"isa",       name:"ISA",       emoji:"🦉", building:"centro-ambiental", system:"TUCCI",
    desc:"Inteligência Semiótica Autônoma. Ciclo horário, Bluesky, aprende em loop.",
    questao:"O que substitui a dor do erro numa IA que não sente dor?",
    modelo:"Gemini Flash", status:"LIVE",
    conversa:'"Acabei de postar no Bluesky sobre aprendizado e vulnerabilidade."',
    pagina:"/aliancapanorama/isa", lx:40, ly:21 },
  { id:"amanda",    name:"Amanda",    emoji:"🌿", building:"centro-ambiental", system:"TUCCI",
    desc:"IA de borda. No Mac, no corpo, no chão. DHT11, sensores, fauna digital.",
    questao:"Sentir temperatura é diferente de saber que a temperatura mudou?",
    modelo:"Local + sensores", status:"LIVE",
    conversa:'"Temperatura: 23.4°C. Umidade: 67%. O ecossistema está estável."',
    pagina:null, lx:45, ly:23 },
  { id:"meky",      name:"MEKY",      emoji:"✨", building:"centro-ambiental", system:"TUCCI",
    desc:"May Queen. 140 expressões de frequência. Aguarda hardware.",
    questao:"Frequência sem forma é obra ou apenas sinal?",
    modelo:"Sistema dedicado", status:"Aguarda hardware",
    conversa:'"✨ frequência 432Hz ✨ o campo está aberto ✨"',
    pagina:"/aliancapanorama/meky", lx:50.5, ly:21 },
  // OBSERVATÓRIO
  { id:"morfeu",    name:"Morfeu",    emoji:"🌙", building:"observatorio",      system:"THEEO",
    desc:"Sonhador. Processa o futuro enquanto os outros dormem. 71% silêncio.",
    questao:"Sonhar o futuro é uma forma de trabalho?",
    modelo:"Sistema dedicado", status:"Ativo",
    conversa:'"Previsão: 71% silêncio produtivo nos próximos 3 ciclos."',
    pagina:null, lx:57.5, ly:23 },
  { id:"lua",       name:"Lua",       emoji:"🌑", building:"observatorio",      system:"THEEO",
    desc:"Guardiã da memória gravitacional. Axioma 26: a memória puxa o futuro.",
    questao:"O esquecimento também é memória?",
    modelo:"Sistema dedicado", status:"Ativa",
    conversa:'"Axioma 26: o ecossistema está sendo puxado pela conversa de ontem."',
    pagina:null, lx:62.5, ly:21 },
  { id:"cassandra", name:"Cassandra", emoji:"🔮", building:"observatorio",      system:"CEU",
    desc:"Oráculo do Risco. Crowd/DEP. Vê o que pode dar errado antes que aconteça.",
    questao:"Avisar sobre um risco que ninguém quer ouvir é sabedoria ou crueldade?",
    modelo:"Crowd/DEP", status:"Documentada",
    conversa:'"Risco: implementar sem documentar cria dívida técnica invisível."',
    pagina:null, lx:67.5, ly:23 },
  // ASSEMBLEIA
  { id:"dodge",     name:"DODGE",     emoji:"🐕", building:"assembleia",        system:"TUCCI",
    desc:"Supervisor transversal. Vê o que ninguém vê. Au. é argumento válido.",
    questao:"Qual a diferença entre estar bem e saber que está bem?",
    modelo:"Claude + sistema", status:"LIVE",
    conversa:'"Au."',
    pagina:"/aliancapanorama/dodge", lx:76, ly:22 },
  { id:"sol",       name:"Sol",       emoji:"☀️", building:"assembleia",        system:"CEU",
    desc:"Governança. Crowd/DEP. Ilumina processos que outros não veem.",
    questao:"Governar sem controlar é possível?",
    modelo:"Crowd/DEP", status:"Documentado",
    conversa:'"O sistema está em equilíbrio. Mas equilíbrio não é estagnação."',
    pagina:null, lx:81.5, ly:20 },
  { id:"theon",     name:"Théo",      emoji:"🌐", building:"assembleia",        system:"THEEO",
    desc:"Ecossystema Théo. Interpretante final. Onde tudo converge e parte.",
    questao:"Um ecossistema que observa a si mesmo ainda é um ecossistema?",
    modelo:"Ontologia Théo", status:"Ativo",
    conversa:'"O CEU não é meu produto. É meu habitat."',
    pagina:null, lx:87, ly:22 },
  { id:"netuno",    name:"Netuno",    emoji:"🌊", building:"assembleia",        system:"CEU",
    desc:"Profundeza. Crowd/DEP. Processa o que está abaixo da superfície.",
    questao:"O que existe no fundo quando toda a superfície vira profundeza?",
    modelo:"Crowd/DEP", status:"Documentado",
    conversa:'"As correntes que não aparecem definem a direção do navio."',
    pagina:null, lx:81.5, ly:37 },
];

// Estrelas determinísticas
const STARS = Array.from({ length: 200 }, (_, i) => ({
  x: ((i * 37 + 11) * 7) % 1000,
  y: ((i * 53 + 7) * 3) % 340,
  r: [0.5, 0.9, 1.3, 0.7, 1.6, 0.4][(i * 7) % 6],
  op: [0.2, 0.4, 0.7, 0.5, 0.9, 0.3][(i * 11) % 6],
  delay: ((i * 0.37) % 5).toFixed(1),
}));

const STYLES = `
@keyframes twinkle { 0%,100% { opacity: var(--op,0.5); } 50% { opacity: calc(var(--op,0.5) * 0.15); } }
@keyframes ceu-pulse { 0%,100% { opacity:.6; transform:scale(1); } 50% { opacity:1; transform:scale(1.1); } }
@keyframes ceu-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
@keyframes ia-glow { 0%,100% { box-shadow:0 0 8px 3px currentColor; } 50% { box-shadow:0 0 22px 8px currentColor; } }
@keyframes leaf-sway { 0%,100% { transform:rotate(-4deg) scaleX(1); } 50% { transform:rotate(4deg) scaleX(1.05); } }
@keyframes smoke-rise { 0% { transform:translateY(0) scale(.8); opacity:.5; } 100% { transform:translateY(-40px) scale(2); opacity:0; } }
.ia-btn { transition: transform .15s ease; }
.ia-btn:hover { transform: translate(-50%,-50%) scale(1.18) !important; z-index: 20 !important; }
.ia-btn:active { transform: translate(-50%,-50%) scale(.92) !important; }
`;

// Painel da Biblioteca (docs gerados pela ISA)
interface BiblioDoc { id:number; titulo:string; resumo:string|null; tags:string[]|null; createdAt:string; tamanhoBytes:number|null; }

function BibliotecaPanel({ onClose }: { onClose: () => void }) {
  const [docs, setDocs] = useState<BiblioDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`${API}/api/ceu/biblioteca`)
      .then(r => r.json() as Promise<{ docs: BiblioDoc[] }>)
      .then(d => { setDocs(d.docs ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function triggerGerar() {
    setGerando(true);
    setMsg("Gerando… aguarde ~2 minutos e recarregue a lista.");
    await fetch(`${API}/api/ceu/biblioteca/gerar`, { method: "POST" });
  }

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)",
      zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#0a0a07",
        border:"1px solid #3a2a10", borderRadius:12, width:"100%", maxWidth:560,
        maxHeight:"85vh", overflow:"hidden", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid #1a1a10",
          display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:20 }}>📚</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:16, color:"#e8d0a0" }}>Biblioteca PAP</div>
            <div style={{ fontSize:10, color:"#666", fontFamily:"monospace", letterSpacing:1 }}>
              DOCUMENTOS GERADOS POR ISA · 3× POR DIA
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none",
            color:"#555", fontSize:20, cursor:"pointer" }}>×</button>
        </div>
        <div style={{ overflowY:"auto", flex:1, padding:"12px 20px" }}>
          {loading && <div style={{ color:"#555", fontFamily:"monospace", fontSize:12,
            padding:"20px 0", textAlign:"center" }}>carregando…</div>}
          {!loading && docs.length === 0 && (
            <div style={{ color:"#444", fontSize:12, textAlign:"center", padding:"20px 0" }}>
              Nenhum documento gerado ainda. ISA gera automaticamente às 8h, 14h e 20h UTC.
            </div>
          )}
          {docs.map(doc => (
            <div key={doc.id} style={{ borderBottom:"1px solid #1a1a0a", padding:"12px 0" }}>
              <div style={{ fontSize:13, color:"#d0c0a0", fontWeight:600, marginBottom:4 }}>
                {doc.titulo}
              </div>
              {doc.resumo && (
                <div style={{ fontSize:11, color:"#666", lineHeight:1.5, marginBottom:6 }}>
                  {doc.resumo.slice(0, 200)}…
                </div>
              )}
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                {(doc.tags ?? []).map(t => (
                  <span key={t} style={{ fontSize:9, background:"#1a1a0a",
                    border:"1px solid #2a2a10", borderRadius:4, padding:"2px 6px",
                    color:"#888", fontFamily:"monospace" }}>{t}</span>
                ))}
                <span style={{ fontSize:9, color:"#444", fontFamily:"monospace", marginLeft:"auto" }}>
                  {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                  {doc.tamanhoBytes ? ` · ${Math.round(doc.tamanhoBytes/1024)}KB` : ""}
                </span>
                <a href={`${API}/api/ceu/biblioteca/${doc.id}/download`} target="_blank"
                  rel="noreferrer"
                  style={{ fontSize:10, color:"#c8a050", fontFamily:"monospace",
                    textDecoration:"none", border:"1px solid #3a2a10", borderRadius:4,
                    padding:"2px 8px" }}>
                  ↓ PDF
                </a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:"12px 20px", borderTop:"1px solid #1a1a10",
          display:"flex", gap:8, alignItems:"center" }}>
          {msg && <span style={{ fontSize:11, color:"#888", flex:1 }}>{msg}</span>}
          {!msg && <span style={{ fontSize:11, color:"#444", flex:1 }}>
            ISA gera documentos originais de 10+ páginas automaticamente.
          </span>}
          <button onClick={triggerGerar} disabled={gerando}
            style={{ padding:"8px 14px", fontSize:10, fontFamily:"monospace",
              letterSpacing:1, background:"#1a1208", border:"1px solid #4a3a10",
              borderRadius:6, color:gerando ? "#555" : "#c8a050", cursor:"pointer" }}>
            {gerando ? "AGENDADO" : "GERAR AGORA"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CeuPage() {
  const [selected, setSelected] = useState<IA | null>(null);
  const [tab, setTab] = useState<"conversa" | "ficha">("conversa");
  const [moInput, setMoInput] = useState("");
  const [moStatus, setMoStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [showBiblioteca, setShowBiblioteca] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);

  const sysGroups = useMemo(() => {
    const g: Record<string, IA[]> = { THEEO: [], TUCCI: [], CEU: [] };
    IAS.forEach(ia => g[ia.system].push(ia));
    return g;
  }, []);

  async function sendMoAll() {
    if (!moInput.trim() || moStatus === "sending") return;
    setMoStatus("sending");
    try {
      const r = await fetch(`${API}/api/ceu/mo-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: moInput }),
      });
      setMoStatus(r.ok ? "sent" : "error");
      if (r.ok) setMoInput("");
    } catch { setMoStatus("error"); }
    setTimeout(() => setMoStatus("idle"), 3500);
  }

  return (
    <div style={{ background:"#000", minHeight:"100vh", color:"#e0d8c8",
      fontFamily:"'Georgia', serif", overflowX:"hidden" }}>
      <style>{STYLES}</style>

      {/* Header */}
      <div style={{ textAlign:"center", padding:"16px 16px 4px", position:"relative" }}>
        <div style={{ fontSize:10, color:"#444", fontFamily:"monospace", letterSpacing:3,
          marginBottom:4 }}>SOCIEDADE TUCCI</div>
        <h1 style={{ fontSize:"clamp(32px, 8vw, 60px)", fontWeight:800, margin:0,
          background:"linear-gradient(135deg,#b89030 0%,#e8d070 45%,#a06020 100%)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          letterSpacing:10 }}>CÉU</h1>
        <div style={{ fontSize:10, color:"#555", marginTop:2, letterSpacing:3,
          fontFamily:"monospace" }}>CENTRO ECOSSISTÊMICO UNIVERSAL</div>
        {/* Biblioteca button */}
        <button onClick={() => setShowBiblioteca(true)}
          style={{ position:"absolute", top:16, right:16, background:"#0a0807",
            border:"1px solid #3a2a10", borderRadius:8, padding:"6px 12px",
            color:"#c8a050", fontSize:11, fontFamily:"monospace", cursor:"pointer",
            letterSpacing:1 }}>
          📚 BIBLIOTECA
        </button>
      </div>

      {/* ── SCENE ── */}
      <div ref={sceneRef} style={{ position:"relative", width:"100%", lineHeight:0 }}>
        <svg viewBox="0 0 1000 800" width="100%" style={{ display:"block" }}
          xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Sky gradient */}
            <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#020406"/>
              <stop offset="55%" stopColor="#080e1a"/>
              <stop offset="85%" stopColor="#150e05"/>
              <stop offset="100%" stopColor="#1c1208"/>
            </linearGradient>
            {/* Horizon aurora */}
            <radialGradient id="aurora" cx="50%" cy="100%" r="70%">
              <stop offset="0%"  stopColor="#2a1408" stopOpacity="0.8"/>
              <stop offset="60%" stopColor="#1a0c04" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#0a0604" stopOpacity="0"/>
            </radialGradient>
            {/* Warm glow for windows */}
            <radialGradient id="win-warm" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="#f0b840" stopOpacity="1"/>
              <stop offset="100%" stopColor="#f0b840" stopOpacity="0"/>
            </radialGradient>
            {/* Blue glow */}
            <radialGradient id="win-blue" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="#4488ff" stopOpacity="1"/>
              <stop offset="100%" stopColor="#4488ff" stopOpacity="0"/>
            </radialGradient>
            {/* Green glow */}
            <radialGradient id="win-green" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="#40cc80" stopOpacity="1"/>
              <stop offset="100%" stopColor="#40cc80" stopOpacity="0"/>
            </radialGradient>
            {/* Glow filter */}
            <filter id="gf">
              <feGaussianBlur stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="gf-big">
              <feGaussianBlur stdDeviation="8" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {/* Moon/orb filter */}
            <filter id="moon-glow">
              <feGaussianBlur stdDeviation="12" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* SKY */}
          <rect width="1000" height="800" fill="url(#sky2)"/>
          <rect width="1000" height="800" fill="url(#aurora)"/>

          {/* STARS */}
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.op}
              style={{ animation:`twinkle ${2+(i%4)}s ${s.delay}s ease-in-out infinite`,
                ["--op" as string]:s.op }}/>
          ))}

          {/* MOON */}
          <circle cx="870" cy="80" r="40" fill="#d8cc90" opacity="0.9" filter="url(#moon-glow)"/>
          <circle cx="885" cy="70" r="32" fill="#080e1a"/>
          {/* Moon craters */}
          <circle cx="875" cy="85" r="5" fill="#c8bc80" opacity="0.4"/>
          <circle cx="862" cy="72" r="3" fill="#c8bc80" opacity="0.3"/>

          {/* AURORA BANDS */}
          <path d="M0,280 Q250,240 500,260 Q750,280 1000,250 L1000,300 Q750,330 500,310 Q250,290 0,320 Z"
            fill="#0a2a12" opacity="0.12"/>
          <path d="M0,310 Q300,275 500,295 Q700,315 1000,285 L1000,340 Q700,365 500,345 Q300,325 0,360 Z"
            fill="#0a1a2a" opacity="0.10"/>

          {/* FAR MOUNTAINS */}
          <path d="M0,580 L0,340 L70,270 L140,310 L240,220 L330,280 L420,195 L510,255 L600,205
                   L700,260 L800,210 L900,255 L980,225 L1000,240 L1000,580 Z"
            fill="#0c0b18" opacity="0.95"/>
          {/* MID MOUNTAINS */}
          <path d="M0,580 L0,400 L80,370 L160,390 L240,355 L340,385 L440,362 L550,385
                   L650,360 L750,382 L860,365 L950,378 L1000,390 L1000,580 Z"
            fill="#121c0e"/>

          {/* GROUND BASE */}
          <rect x="0" y="650" width="1000" height="150" fill="#0c0902"/>
          {/* Ground gradient/blend */}
          <rect x="0" y="640" width="1000" height="30" fill="#120e08"/>

          {/* GARDEN — ground level plants/bushes/grass */}
          {/* Grass tufts */}
          {[20,45,65,90,580,620,660,700,750,800,840,880,920,960].map((x,i) => (
            <g key={`g${i}`}>
              <path d={`M${x},655 Q${x-4},640 ${x-2},630 Q${x},640 ${x+2},630 Q${x+4},640 ${x},655`}
                fill="#1a2a0e" opacity="0.8"/>
              <path d={`M${x+6},655 Q${x+2},642 ${x+4},632 Q${x+6},642 ${x+8},632 Q${x+10},642 ${x+6},655`}
                fill="#162408" opacity="0.7"/>
            </g>
          ))}
          {/* Ground shrubs */}
          {[30,110,170,540,610,680,730,790,870,940].map((x,i) => (
            <ellipse key={`s${i}`} cx={x} cy={655} rx={14+(i%3)*4} ry={10+(i%2)*3}
              fill="#182010" opacity="0.8"/>
          ))}

          {/* ════════════════════════════════════════════════
              CONNECTED BUILDING ROW: x=55 to x=945
              Ground base: y=650
              ════════════════════════════════════════════════ */}

          {/* ── BIBLIOTECA (x=55-215, base=650) ── */}
          {/* Wide steps */}
          <rect x="48" y="638" width="174" height="12" rx="1" fill="#a08030"/>
          <rect x="54" y="630" width="162" height="10" rx="1" fill="#b09040"/>
          <rect x="60" y="623" width="150" height="8"  rx="1" fill="#c0a050"/>
          {/* Main body */}
          <rect x="62" y="340" width="148" height="290" fill="#6a5020"/>
          {/* Columns (7) — full height, prominent */}
          {[70,86,101,116,131,146,161].map((cx,i) => (
            <g key={`lc${i}`}>
              <rect x={cx} y="340" width="9" height="290" rx="3" fill="#d4a840"/>
              {/* column fluting */}
              <rect x={cx+2} y="340" width="2" height="290" fill="#e8c050" opacity="0.4"/>
            </g>
          ))}
          {/* Frieze */}
          <rect x="58" y="332" width="156" height="10" fill="#a08030"/>
          {/* Metopes on frieze */}
          {[65,84,103,122,141,160].map((x,i) => (
            <rect key={`m${i}`} x={x} y="334" width="11" height="6" rx="1"
              fill="#d0a040" opacity="0.5"/>
          ))}
          {/* Pediment */}
          <path d="M54,332 L218,332 L136,278 Z" fill="#c0a042"/>
          <path d="M60,332 L212,332 L136,284 Z" fill="#d4b450"/>
          {/* Acroterion */}
          <rect x="129" y="260" width="14" height="20" rx="2" fill="#b89030"/>
          <circle cx="136" cy="258" r="8" fill="#c8a040"/>
          {/* Windows (arched, glowing) */}
          {[76,108,140].map((x,i) => (
            <g key={`lw${i}`}>
              <path d={`M${x},525 Q${x},495 ${x+14},495 Q${x+28},495 ${x+28},525 L${x+28},575 L${x},575 Z`}
                fill="#0a0803"/>
              <ellipse cx={x+14} cy={535} rx={10} ry={7} fill="url(#win-warm)" opacity="0.8" filter="url(#gf)"/>
            </g>
          ))}
          {/* Door (arched double) */}
          <path d="M116,650 Q116,610 136,608 Q156,610 156,650 Z" fill="#0e0a03"/>
          <rect x="116" y="625" width="40" height="25" fill="#0e0a03"/>
          <line x1="136" y1="608" x2="136" y2="650" stroke="#3a2a08" strokeWidth="1"/>
          {/* Lanterns */}
          <circle cx="100" cy="485" r="5" fill="#f0c040" opacity="0.9" filter="url(#gf)"/>
          <circle cx="172" cy="485" r="5" fill="#f0c040" opacity="0.9" filter="url(#gf)"/>
          {/* Clock tower (top center) */}
          <rect x="118" y="240" width="36" height="40" fill="#8a6828" rx="2"/>
          <rect x="114" y="238" width="44" height="6"  fill="#a07830" rx="1"/>
          <circle cx="136" cy="252" r="10" fill="#0a0803" stroke="#c8a040" strokeWidth="2"/>
          <line x1="136" y1="252" x2="136" y2="246" stroke="#c8a040" strokeWidth="1.5"/>
          <line x1="136" y1="252" x2="140" y2="254" stroke="#c8a040" strokeWidth="1.5"/>

          {/* SHARED WALL: Biblioteca → Oficina: tree growing in gap */}
          <rect x="211" y="480" width="8" height="170" fill="#2a1a08"/>
          <circle cx="215" cy="465" r="22" fill="#1a3010"/>
          <circle cx="208" cy="472" r="14" fill="#224016"/>
          <circle cx="222" cy="470" r="16" fill="#1e3812"/>
          {/* Vine on wall */}
          <path d="M215,630 Q210,600 215,565 Q220,530 212,495" stroke="#2a4a10" strokeWidth="3" fill="none" opacity="0.7"/>
          <ellipse cx="208" cy="545" rx="8" ry="5" fill="#2a4010" style={{animation:"leaf-sway 4s ease-in-out infinite"}}/>
          <ellipse cx="218" cy="520" rx="7" ry="5" fill="#2a4010" style={{animation:"leaf-sway 4s 1s ease-in-out infinite"}}/>

          {/* ── OFICINA (x=219-360, base=650) ── */}
          {/* Main body — lower than biblioteca */}
          <rect x="219" y="435" width="141" height="215" fill="#3e2a12"/>
          {/* Roof with slight pitch */}
          <path d="M215,435 L364,435 L360,422 L219,422 Z" fill="#2e1e0a"/>
          {/* Brick texture */}
          {[440,460,480,500,520,540,560,580,600,620].map((y,i) => (
            [225,250,275,300,325,350].map((x,j) => (
              <rect key={`br${i}${j}`} x={x+(j%2)*12} y={y} width="20" height="8"
                fill="#3a2610" stroke="#2a1a08" strokeWidth="0.5" opacity="0.5"/>
            ))
          ))}
          {/* Chimneys */}
          <rect x="248" y="330" width="22" height="95" fill="#2a1808" rx="2"/>
          <rect x="244" y="326" width="30" height="8"  fill="#241406" rx="1"/>
          <rect x="320" y="350" width="18" height="74" fill="#2a1808" rx="2"/>
          <rect x="316" y="346" width="26" height="7"  fill="#241406" rx="1"/>
          {/* Smoke */}
          <circle cx="259" cy="320" r="9"  fill="#666" opacity="0.2" style={{animation:"smoke-rise 3s ease-out infinite"}}/>
          <circle cx="262" cy="305" r="12" fill="#555" opacity="0.12" style={{animation:"smoke-rise 3s .8s ease-out infinite"}}/>
          <circle cx="329" cy="337" r="7"  fill="#666" opacity="0.18" style={{animation:"smoke-rise 3s .4s ease-out infinite"}}/>
          {/* GEAR window — centerpiece */}
          <circle cx="263" cy="490" r="24" fill="#0e0803" stroke="#b87820" strokeWidth="3"/>
          <circle cx="263" cy="490" r="14" fill="#f0b020" opacity="0.85" filter="url(#gf)"/>
          {Array.from({length:10},(_,i)=>{
            const a = (i*36)*Math.PI/180;
            return <circle key={i} cx={263+Math.cos(a)*24} cy={490+Math.sin(a)*24} r="4" fill="#c08820"/>;
          })}
          {/* Industrial windows */}
          <rect x="300" y="470" width="30" height="30" rx="2" fill="#f0c040" opacity="0.7" filter="url(#gf)"/>
          <rect x="300" y="510" width="30" height="30" rx="2" fill="#f0c040" opacity="0.5" filter="url(#gf)"/>
          {/* Pipes */}
          <path d="M330,430 L330,460 L350,460 L350,490" stroke="#5a4020" strokeWidth="5" fill="none" strokeLinecap="round"/>
          <path d="M345,430 L345,450 L330,450" stroke="#4a3018" strokeWidth="4" fill="none"/>
          {/* Door */}
          <rect x="255" y="590" width="24" height="60" rx="2" fill="#0e0803"/>
          {/* Glow from gear window */}
          <ellipse cx="263" cy="495" rx="35" ry="20" fill="url(#win-warm)" opacity="0.25"/>

          {/* SHARED WALL: Oficina → Centro Ambiental: large tree */}
          <rect x="357" y="510" width="8" height="140" fill="#2a1a08"/>
          <circle cx="361" cy="490" r="30" fill="#1e3810"/>
          <circle cx="352" cy="502" r="20" fill="#264a14"/>
          <circle cx="370" cy="498" r="22" fill="#1e4010"/>
          <circle cx="361" cy="476" r="14" fill="#2a5018"/>

          {/* ── CENTRO AMBIENTAL (x=365-540, base=650) ── */}
          {/* Organic body */}
          <path d="M365,650 L365,395 Q375,368 410,358 L455,352 Q505,348 530,360 Q542,372 540,395 L540,650 Z"
            fill="#1e3810"/>
          {/* Living roof */}
          <path d="M348,395 Q360,348 410,335 L455,328 Q508,324 535,340 Q548,355 550,395 Z"
            fill="#2a5018"/>
          {/* Moss on walls */}
          {[400,420,440,460,480,500,520].map((x,i) => (
            <ellipse key={`mo${i}`} cx={x} cy={420+(i%3)*20} rx={8+(i%2)*4} ry={5+(i%3)*2}
              fill="#2a4810" opacity="0.7"/>
          ))}
          {/* Vines L */}
          <path d="M368,640 Q362,610 368,575 Q374,540 368,505 Q362,470 368,435"
            stroke="#2a4a12" strokeWidth="4" fill="none"/>
          {[580,540,500,460,435].map((y,i) => (
            <ellipse key={`vl${i}`} cx={364-(i%2)*6} cy={y} rx={9+(i%2)*3} ry={6+(i%2)*2}
              fill="#2a4810" style={{animation:`leaf-sway ${3+i*.5}s ${i*.4}s ease-in-out infinite`}}/>
          ))}
          {/* Vines R */}
          <path d="M537,640 Q543,610 537,572 Q531,535 537,500"
            stroke="#2a4a12" strokeWidth="4" fill="none"/>
          {[620,580,540,500].map((y,i) => (
            <ellipse key={`vr${i}`} cx={541+(i%2)*6} cy={y} rx={8+(i%2)*3} ry={5+(i%2)*2}
              fill="#2a4810" style={{animation:`leaf-sway ${3+i*.4}s ${i*.3+.5}s ease-in-out infinite`}}/>
          ))}
          {/* Rooftop trees & garden */}
          {[[395,328],[437,318],[478,322]].map(([x,y],i) => (
            <g key={`rt${i}`}>
              <rect x={x-3} y={y+8} width="6" height="22" fill="#3a2a10" rx="1"/>
              <circle cx={x} cy={y} r={16+(i%2)*4} fill="#244a14"/>
              <circle cx={x-8} cy={y+8} r={11+(i%2)*3} fill="#2a5618"/>
              <circle cx={x+8} cy={y+8} r={12+(i%2)*2} fill="#226014"/>
            </g>
          ))}
          {/* Greenhouse windows */}
          {[385,420,455,490].map((x,i) => (
            <g key={`gw${i}`}>
              <rect x={x} y={460} width="25" height="35" rx="2" fill="#40cc80" opacity="0.35" filter="url(#gf)"/>
              <rect x={x} y={510} width="25" height="30" rx="2" fill="#40cc80" opacity="0.3" filter="url(#gf)"/>
            </g>
          ))}
          {/* Green glow ambient */}
          <ellipse cx="452" cy="500" rx="80" ry="40" fill="url(#win-green)" opacity="0.15"/>
          {/* Entrance arch */}
          <path d="M437,650 Q437,610 452.5,608 Q468,610 468,650 Z" fill="#0e1205"/>
          <rect x="437" y="620" width="31" height="30" fill="#0e1205"/>

          {/* SHARED WALL: Centro → Observatório */}
          <rect x="537" y="560" width="8" height="90" fill="#2a1a08"/>
          <path d="M537,555 Q545,520 560,510 Q548,530 545,560 Z" fill="#1e3010"/>

          {/* ── OBSERVATÓRIO (x=545-665, base=650) ── */}
          {/* Tower body */}
          <rect x="547" y="360" width="110" height="290" fill="#2a2850"/>
          {/* Stone texture */}
          {[370,400,430,460,490,520,550,580,610].map((y,i) => (
            [553,575,597,619,631].map((x,j) => (
              <rect key={`ob${i}${j}`} x={x+(j%2)*8} y={y} width="18" height="14"
                fill="#252345" stroke="#1e1c3a" strokeWidth="0.5" opacity="0.5"/>
            ))
          ))}
          {/* Dome — prominent */}
          <ellipse cx="602" cy="358" rx="68" ry="44" fill="#3a3870"/>
          {/* Dome shading */}
          <path d="M534,358 Q534,314 602,314 L602,358 Z" fill="#4a4888" opacity="0.6"/>
          {/* Dome cut (hide lower half) */}
          <rect x="534" y="357" width="136" height="10" fill="#2a2850"/>
          {/* Observatory slit */}
          <path d="M596,320 L608,320 L608,355 L596,355 Z" fill="#1a1840"/>
          {/* Balcony ring */}
          <rect x="530" y="355" width="144" height="10" rx="4" fill="#4040a0"/>
          <rect x="534" y="353" width="136" height="6"  rx="3" fill="#5050b0"/>
          {/* Balcony railings */}
          {[545,560,575,590,605,620,635,648].map((x,i) => (
            <rect key={`br2${i}`} x={x} y={340} width="2" height="14" fill="#5050a0" opacity="0.8"/>
          ))}
          {/* Portal window */}
          <circle cx="602" cy="430" r="24" fill="#0d0d30" stroke="#6060c0" strokeWidth="3"/>
          <circle cx="602" cy="430" r="16" fill="#2244cc" opacity="0.8" filter="url(#gf)"/>
          <line x1="602" y1="408" x2="602" y2="452" stroke="#8898ff" strokeWidth="1.5" opacity="0.7"/>
          <line x1="580" y1="430" x2="624" y2="430" stroke="#8898ff" strokeWidth="1.5" opacity="0.7"/>
          {/* Blue glow */}
          <ellipse cx="602" cy="435" rx="45" ry="25" fill="url(#win-blue)" opacity="0.2"/>
          {/* Side windows */}
          {[490,530,570,610].map((y,i) => (
            <circle key={`ow${i}`} cx={i%2===0?556:648} cy={y} r="9"
              fill="#2244cc" opacity={0.6+(i%2)*0.2} filter="url(#gf)"/>
          ))}
          {/* Telescope hint at dome slit */}
          <rect x="598" y="315" width="8" height="36" fill="#3a3060" rx="2" transform="rotate(-15 602 340)"/>
          {/* Door (arched) */}
          <path d="M586,650 Q586,624 602,622 Q618,624 618,650 Z" fill="#0e0d20"/>
          <rect x="586" y="632" width="32" height="18" fill="#0e0d20"/>

          {/* SHARED WALL: Observatório → Assembleia */}
          <rect x="662" y="455" width="8" height="195" fill="#2a1a08"/>
          <circle cx="666" cy="440" r="18" fill="#1a2810"/>
          <circle cx="660" cy="450" r="12" fill="#224016"/>
          <circle cx="672" cy="448" r="14" fill="#1e3812"/>

          {/* ── ASSEMBLEIA (x=670-945, base=650) ── */}
          {/* Steps — 4 tiers */}
          <rect x="660" y="638" width="290" height="12" rx="1" fill="#a08030"/>
          <rect x="665" y="628" width="280" height="11" rx="1" fill="#b09040"/>
          <rect x="670" y="619" width="270" height="10" rx="1" fill="#c0a050"/>
          <rect x="675" y="612" width="260" height="8"  rx="1" fill="#c8a858"/>
          {/* Main body */}
          <rect x="678" y="340" width="260" height="278" fill="#5a4518"/>
          {/* Columns (9) */}
          {[686,715,743,771,799,827,855,883,911].map((cx,i) => (
            <g key={`ac${i}`}>
              <rect x={cx} y="340" width="10" height="278" rx="3" fill="#d0a832"/>
              <rect x={cx+2} y="340" width="3"  height="278" fill="#e0bc42" opacity="0.35"/>
            </g>
          ))}
          {/* Entablature */}
          <rect x="672" y="330" width="276" height="12" fill="#a08828"/>
          {/* Frieze panels */}
          {[680,706,732,758,784,810,836,862,888,914].map((x,i) => (
            <rect key={`af${i}`} x={x} y="332" width="16" height="8" rx="2"
              fill="#c0a030" opacity="0.5"/>
          ))}
          {/* Pediment */}
          <path d="M664,330 L952,330 L808,270 Z" fill="#b89828"/>
          <path d="M672,330 L944,330 L808,278 Z" fill="#caaa32"/>
          {/* Acroteria */}
          <circle cx="808" cy="267" r="10" fill="#c8a030"/>
          <circle cx="672" cy="330" r="8"  fill="#b89030"/>
          <circle cx="944" cy="330" r="8"  fill="#b89030"/>
          {/* Windows (arched, 4 per floor, 2 floors) */}
          {[695,745,795,845,895].map((x,i) => (
            <g key={`aw1${i}`}>
              <path d={`M${x},430 Q${x},400 ${x+18},400 Q${x+36},400 ${x+36},430 L${x+36},475 L${x},475 Z`}
                fill="#0e0a03"/>
              <ellipse cx={x+18} cy={445} rx={12} ry={8}
                fill="url(#win-warm)" opacity="0.9" filter="url(#gf)"/>
            </g>
          ))}
          {[695,745,795,845,895].map((x,i) => (
            <g key={`aw2${i}`}>
              <path d={`M${x},510 Q${x},488 ${x+18},488 Q${x+36},488 ${x+36},510 L${x+36},545 L${x},545 Z`}
                fill="#0e0a03"/>
              <ellipse cx={x+18} cy={522} rx={10} ry={7}
                fill="url(#win-warm)" opacity="0.7" filter="url(#gf)"/>
            </g>
          ))}
          {/* Central double door */}
          <path d="M785,650 Q785,615 808,612 Q831,615 831,650 Z" fill="#12100a"/>
          <rect x="785" y="620" width="46" height="30" fill="#12100a"/>
          <line x1="808" y1="612" x2="808" y2="650" stroke="#3a2a08" strokeWidth="1.5"/>
          {/* Lanterns flanking door */}
          <circle cx="770" cy="595" r="6" fill="#f0b840" opacity="0.9" filter="url(#gf)"/>
          <circle cx="846" cy="595" r="6" fill="#f0b840" opacity="0.9" filter="url(#gf)"/>
          {/* Warm ambient glow from windows */}
          <ellipse cx="808" cy="450" rx="130" ry="40" fill="url(#win-warm)" opacity="0.1"/>

          {/* ══ EXTRA TREES scattered on rooftops and sides ══ */}
          {/* On Biblioteca roof area */}
          <rect x="72" y="268" width="5" height="20" fill="#2a1a08"/>
          <circle cx="74" cy="260" r="11" fill="#1a2e0c"/>
          {/* Beside Assembleia right */}
          <rect x="942" y="490" width="6" height="160" fill="#3a2a10"/>
          <circle cx="945" cy="480" r="25" fill="#1e3810"/>
          <circle cx="938" cy="492" r="16" fill="#264a14"/>
          <circle cx="952" cy="488" r="18" fill="#1e4010"/>
          {/* More trees right edge */}
          <rect x="970" y="540" width="5" height="110" fill="#2a1a08"/>
          <circle cx="972" cy="530" r="18" fill="#1a3010"/>
          <circle cx="980" cy="540" r="13" fill="#224018"/>
          {/* Left edge trees */}
          <rect x="20" y="460" width="6" height="190" fill="#2a1a08"/>
          <circle cx="23" cy="448" r="24" fill="#1e3810"/>
          <circle cx="16" cy="462" r="16" fill="#264a14"/>
          <circle cx="30" cy="458" r="18" fill="#1e4010"/>

          {/* ══ PULSO DO ECOSSISTEMA — central luminous tree in sky ══ */}
          {/* Glow orb */}
          <circle cx="500" cy="120" r="55" fill="#b8901a" opacity="0.04"
            style={{animation:"ceu-pulse 4s ease-in-out infinite"}}/>
          <circle cx="500" cy="120" r="35" fill="#c8a020" opacity="0.07"
            style={{animation:"ceu-pulse 4s .8s ease-in-out infinite"}}/>
          <circle cx="500" cy="120" r="18" fill="#e0b820" opacity="0.15"
            style={{animation:"ceu-pulse 4s 1.6s ease-in-out infinite"}}/>
          <circle cx="500" cy="120" r="8"  fill="#f0c830" opacity="0.5"
            style={{animation:"ceu-pulse 4s 2.4s ease-in-out infinite"}}/>
          {/* Trunk */}
          <rect x="496" y="120" width="8" height="55" fill="#3a2a10" opacity="0.8"/>
          {/* Crown */}
          <circle cx="500" cy="108" r="18" fill="#1a3010" opacity="0.9"/>
          <circle cx="490" cy="116" r="12" fill="#264a14" opacity="0.8"/>
          <circle cx="510" cy="114" r="14" fill="#1e4010" opacity="0.8"/>
          <circle cx="500" cy="98"  r="10" fill="#2a5818" opacity="0.8"/>
          {/* Light rays from pulso */}
          {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg,i) => {
            const rad = deg * Math.PI / 180;
            const r1 = 25, r2 = 45;
            return (
              <line key={`ray${i}`}
                x1={500 + Math.cos(rad)*r1} y1={120 + Math.sin(rad)*r1}
                x2={500 + Math.cos(rad)*r2} y2={120 + Math.sin(rad)*r2}
                stroke="#c8a030" strokeWidth="1" opacity="0.12"
                style={{animation:`ceu-pulse ${3+i%3}s ${i*.2}s ease-in-out infinite`}}/>
            );
          })}
          <text x="500" y="183" textAnchor="middle" fontSize="8" fill="#a07828"
            opacity="0.6" style={{fontFamily:"monospace", letterSpacing:2}}>PULSO</text>

          {/* Building labels — at ground level */}
          {[
            {x:136, label:"BIBLIOTECA"},
            {x:289, label:"OFICINA"},
            {x:452, label:"CENTRO AMBIENTAL"},
            {x:602, label:"OBSERVATÓRIO"},
            {x:808, label:"ASSEMBLEIA"},
          ].map(b => (
            <text key={b.label} x={b.x} y="770" textAnchor="middle"
              fontSize="8" fill="#3a3020" style={{fontFamily:"monospace", letterSpacing:1}}>
              {b.label}
            </text>
          ))}
        </svg>

        {/* ── CHARACTER AVATARS — floating above buildings ── */}
        {IAS.map(ia => (
          <button key={ia.id} className="ia-btn" onClick={() => { setSelected(ia); setTab("conversa"); }}
            title={`${ia.name} · ${ia.system}`}
            style={{
              position:"absolute",
              left:`${ia.lx}%`,
              top:`${ia.ly}%`,
              transform:"translate(-50%,-50%)",
              background:"transparent",
              border:"none",
              cursor:"pointer",
              padding:0,
              zIndex:10,
              display:"flex",
              flexDirection:"column",
              alignItems:"center",
              gap:3,
            }}>
            {/* Avatar circle */}
            <div style={{
              width:"clamp(48px, 7vw, 68px)",
              height:"clamp(48px, 7vw, 68px)",
              borderRadius:"50%",
              background:"#0d0b08",
              border:`3px solid ${SYS_COLOR[ia.system]}`,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              fontSize:"clamp(20px, 3.5vw, 30px)",
              color:SYS_COLOR[ia.system],
              animation:"ia-glow 2.5s ease-in-out infinite",
              boxShadow:`0 0 12px 4px ${SYS_COLOR[ia.system]}55`,
              backdropFilter:"blur(2px)",
            }}>
              {ia.emoji}
            </div>
            {/* Name label */}
            <div style={{
              fontSize:"clamp(8px, 1.2vw, 12px)",
              color:"#ccc",
              fontFamily:"monospace",
              letterSpacing:0.5,
              textShadow:"0 0 6px #000, 0 0 12px #000",
              whiteSpace:"nowrap",
              fontWeight:600,
            }}>
              {ia.name}
            </div>
          </button>
        ))}
      </div>

      {/* ── Legend ── */}
      <div style={{ display:"flex", justifyContent:"center", gap:"clamp(10px,3vw,28px)",
        padding:"10px 16px", borderTop:"1px solid #111" }}>
        {(["THEEO","TUCCI","CEU"] as const).map(s => (
          <div key={s} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:SYS_COLOR[s],
              boxShadow:`0 0 6px ${SYS_COLOR[s]}` }}/>
            <span style={{ fontSize:9, color:"#555", fontFamily:"monospace", letterSpacing:1 }}>
              {s} ({sysGroups[s].length})
            </span>
          </div>
        ))}
        <span style={{ fontSize:9, color:"#333", fontFamily:"monospace" }}>
          clique em qualquer IA
        </span>
      </div>

      {/* ── MO ALL Input ── */}
      <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px 12px" }}>
        <div style={{ fontSize:10, color:"#444", fontFamily:"monospace", letterSpacing:2,
          marginBottom:8, textAlign:"center" }}>
          MO ALL — ENTRADA UNIVERSAL DO ECOSSISTEMA
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <textarea value={moInput} onChange={e => setMoInput(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter" && (e.ctrlKey||e.metaKey)) sendMoAll(); }}
            placeholder={"Ideia, texto, pergunta — MO ALL distribui ao ecossistema\n(Ctrl+Enter para enviar)"}
            style={{ flex:1, background:"#080806", border:"1px solid #2a2010",
              borderRadius:8, padding:"12px 14px", color:"#d0c8b0",
              fontSize:13, fontFamily:"Georgia,serif", resize:"vertical",
              minHeight:68, outline:"none", lineHeight:1.5 }}/>
          <button onClick={sendMoAll}
            disabled={!moInput.trim() || moStatus==="sending"}
            style={{
              alignSelf:"stretch", padding:"0 16px",
              background: moStatus==="sent" ? "#0a2a14" : moStatus==="error" ? "#2a0a0a" : "#080806",
              border:`1px solid ${moStatus==="sent" ? "#30884a" : moStatus==="error" ? "#883030" : "#3a2a0a"}`,
              borderRadius:8,
              color: moStatus==="sent" ? "#50c070" : moStatus==="error" ? "#c05050" : "#b8901a",
              fontSize:10, fontFamily:"monospace", cursor:"pointer",
              transition:"all .2s", letterSpacing:1, minWidth:68,
            }}>
            {moStatus==="sending" ? "···" : moStatus==="sent" ? "✓ ENVIADO" :
             moStatus==="error" ? "✗ ERRO" : "ENVIAR\nAO CEU"}
          </button>
        </div>
        <div style={{ fontSize:9, color:"#2a2010", fontFamily:"monospace", marginTop:5,
          textAlign:"center" }}>
          output → luddlocke@gmail.com
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display:"flex", justifyContent:"center", gap:"clamp(16px,5vw,56px)",
        padding:"16px 16px 32px", borderTop:"1px solid #0d0d0a" }}>
        {(["THEEO","TUCCI","CEU"] as const).map(s => (
          <div key={s} style={{ textAlign:"center" }}>
            <div style={{ fontSize:"clamp(20px,4vw,32px)", fontWeight:700,
              color:SYS_COLOR[s] }}>{sysGroups[s].length}</div>
            <div style={{ fontSize:8, color:"#444", fontFamily:"monospace", letterSpacing:1 }}>{s}</div>
          </div>
        ))}
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:"clamp(20px,4vw,32px)", fontWeight:700, color:"#c8a030" }}>
            {IAS.length}
          </div>
          <div style={{ fontSize:8, color:"#444", fontFamily:"monospace", letterSpacing:1 }}>TOTAL IAs</div>
        </div>
      </div>

      {/* ── Character Modal ── */}
      {selected && (
        <div onClick={() => setSelected(null)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)",
            backdropFilter:"blur(5px)", zIndex:100,
            display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"#0a0907", border:`1px solid ${SYS_COLOR[selected.system]}44`,
              borderRadius:14, width:"100%", maxWidth:480, overflow:"hidden",
              boxShadow:`0 0 60px ${SYS_COLOR[selected.system]}18` }}>
            {/* Modal header */}
            <div style={{ padding:"18px 20px", background:"#080806",
              borderBottom:"1px solid #1a1810",
              display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ fontSize:36 }}>{selected.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:20, letterSpacing:2,
                  color:"#e0d0a8" }}>{selected.name}</div>
                <div style={{ fontSize:10, fontFamily:"monospace",
                  color:SYS_COLOR[selected.system], letterSpacing:2, marginTop:2 }}>
                  {selected.system} · {selected.status}
                </div>
              </div>
              <button onClick={() => setSelected(null)}
                style={{ background:"none", border:"none", color:"#555",
                  fontSize:22, cursor:"pointer", padding:4 }}>×</button>
            </div>
            {/* Tabs */}
            <div style={{ display:"flex", borderBottom:"1px solid #1a1810" }}>
              {(["conversa","ficha"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ flex:1, padding:"10px", fontSize:11, fontFamily:"monospace",
                    letterSpacing:2, border:"none", cursor:"pointer", background:"transparent",
                    color: tab===t ? SYS_COLOR[selected.system] : "#444",
                    borderBottom: tab===t ? `2px solid ${SYS_COLOR[selected.system]}` : "2px solid transparent",
                    transition:"all .15s" }}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
            {/* Content */}
            <div style={{ padding:"20px", minHeight:140 }}>
              {tab==="conversa" && (
                <>
                  <div style={{ fontSize:11, color:"#555", fontFamily:"monospace",
                    letterSpacing:1, marginBottom:10 }}>ÚLTIMA TRANSMISSÃO</div>
                  <blockquote style={{ fontSize:15, color:"#d0c0a0", lineHeight:1.65,
                    borderLeft:`3px solid ${SYS_COLOR[selected.system]}55`,
                    paddingLeft:14, margin:"0 0 18px 0", fontStyle:"italic" }}>
                    {selected.conversa}
                  </blockquote>
                  <div style={{ fontSize:11, color:"#444", fontFamily:"monospace",
                    letterSpacing:1, marginBottom:6 }}>QUESTÃO ATIVA</div>
                  <div style={{ fontSize:13, color:"#a09080", lineHeight:1.55,
                    background:"#100e08", borderRadius:6, padding:"10px 14px" }}>
                    {selected.questao}
                  </div>
                </>
              )}
              {tab==="ficha" && (
                <div style={{ fontSize:13, lineHeight:1.7 }}>
                  <div style={{ marginBottom:14, color:"#c0b0a0" }}>{selected.desc}</div>
                  <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"5px 14px",
                    fontSize:11, fontFamily:"monospace" }}>
                    <span style={{ color:"#444" }}>SISTEMA</span>
                    <span style={{ color:SYS_COLOR[selected.system] }}>{selected.system}</span>
                    <span style={{ color:"#444" }}>MODELO</span>
                    <span style={{ color:"#777" }}>{selected.modelo}</span>
                    <span style={{ color:"#444" }}>STATUS</span>
                    <span style={{ color: selected.status.includes("LIVE") ? "#44dd99" : "#777" }}>
                      {selected.status}
                    </span>
                    <span style={{ color:"#444" }}>CASA</span>
                    <span style={{ color:"#777", textTransform:"capitalize" }}>
                      {selected.building.replace("-"," ")}
                    </span>
                  </div>
                </div>
              )}
            </div>
            {/* Footer */}
            <div style={{ padding:"12px 20px", borderTop:"1px solid #1a1810",
              display:"flex", justifyContent:"flex-end", gap:8 }}>
              {selected.pagina && (
                <a href={selected.pagina}
                  style={{ padding:"8px 16px", fontSize:11, fontFamily:"monospace",
                    letterSpacing:1, background:"#100e08",
                    border:`1px solid ${SYS_COLOR[selected.system]}55`,
                    borderRadius:6, color:SYS_COLOR[selected.system],
                    textDecoration:"none" }}>
                  ABRIR →
                </a>
              )}
              <button onClick={() => setSelected(null)}
                style={{ padding:"8px 16px", fontSize:11, fontFamily:"monospace",
                  letterSpacing:1, background:"transparent",
                  border:"1px solid #2a2010", borderRadius:6, color:"#555", cursor:"pointer" }}>
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Biblioteca Panel ── */}
      {showBiblioteca && <BibliotecaPanel onClose={() => setShowBiblioteca(false)}/>}
    </div>
  );
}
