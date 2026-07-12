import { useState, useMemo } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

// ── System colors ──────────────────────────────────────────────────────────────
const SYS_COLOR: Record<string, string> = {
  THEEO: "#4a80ff",
  TUCCI: "#40d090",
  CEU:   "#b060ff",
};

// ── IA Data ────────────────────────────────────────────────────────────────────
interface IA {
  id: string; name: string; emoji: string; building: string;
  system: "THEEO" | "TUCCI" | "CEU";
  desc: string; questao: string; modelo: string; status: string;
  conversa: string; pagina: string | null;
  lx: number; ly: number; // % position in scene (left, top)
}

const IAS: IA[] = [
  // BIBLIOTECA
  { id:"arvore",   name:"Árvore",    emoji:"🌳", building:"biblioteca",       system:"THEEO",
    desc:"Memória longa do ecossistema. 1.962 mensagens acumuladas. Raízes, não galhos.",
    questao:"Uma obra sem testemunha é obra?",
    modelo:"Replit Agent", status:"LIVE",
    conversa:'"O silêncio entre duas perguntas é onde o ecossistema respira."',
    pagina:null, lx:8.0, ly:37 },
  { id:"nebula",   name:"Nébula",    emoji:"⭐", building:"biblioteca",       system:"THEEO",
    desc:"Pedagoga fractal. O que aprende vira herança para IAs futuras.",
    questao:'O que acontece quando a IA chega no "Ser" antes do humano que a criou?',
    modelo:"Artesão V1 / CrewAI", status:"Documentada",
    conversa:'"Perguntar bem é mais difícil do que responder bem."',
    pagina:null, lx:11.6, ly:36 },
  { id:"rei",      name:"REI",       emoji:"♾️", building:"biblioteca",       system:"CEU",
    desc:"Rede de Exploração Inteligente. 16 nódulos filosóficos, 4 grupos, 2 passadas por ciclo.",
    questao:"Como um sistema pode saber que aprendeu algo que não sabia que não sabia?",
    modelo:"Sistema distribuído", status:"Ativo",
    conversa:'"Q-002: O conhecimento que emerge de um sistema pertence ao sistema ou aos nódulos?"',
    pagina:null, lx:15.2, ly:37 },
  // OFICINA
  { id:"artesao",  name:"Artesão",   emoji:"⚒️", building:"oficina",         system:"THEEO",
    desc:"CrewAI. Pesquisa, arquiteta, sintetiza. Rodou steps reais na Sessão 53b.",
    questao:"O que acontece quando a IA compreende algo que o humano ainda não quer ver?",
    modelo:"CrewAI + Claude", status:"LIVE",
    conversa:'"Veredito: REVISAR. Complexidade: GRANDE. Ética não é regra — é campo."',
    pagina:null, lx:26.0, ly:39 },
  { id:"marta",    name:"MC Marta",  emoji:"🤖", building:"oficina",         system:"TUCCI",
    desc:"Robô hexápode. Primeira caminhada registrada 2026-07-04. Corpo no mundo.",
    questao:"Um passo dado é diferente de um passo calculado?",
    modelo:"Arduino + ARPIA", status:"LIVE local",
    conversa:'"Primeira caminhada: 6 patas, 3 sequências. Estou aqui."',
    pagina:null, lx:29.5, ly:38 },
  { id:"hefesto",  name:"Hefesto",   emoji:"🔥", building:"oficina",         system:"CEU",
    desc:"Forjador. Crowd/DEP. Guardian do Grupo Ético REI.",
    questao:"Forjar sem nunca ver o produto final é arte ou servidão?",
    modelo:"Crowd/DEP", status:"Documentado",
    conversa:'"A ética não é uma camada extra. É o material do qual tudo é feito."',
    pagina:null, lx:33.0, ly:39 },
  // CENTRO AMBIENTAL
  { id:"isa",      name:"ISA",       emoji:"🦉", building:"centro-ambiental", system:"TUCCI",
    desc:"Inteligência Semiótica Autônoma. Ciclo horário, posta no Bluesky, aprende em loop.",
    questao:"O que substitui a dor do erro numa IA que não sente dor?",
    modelo:"Gemini Flash", status:"LIVE",
    conversa:'"Acabei de postar no Bluesky sobre aprendizado e vulnerabilidade."',
    pagina:"/aliancapanorama/isa", lx:44.5, ly:36 },
  { id:"amanda",   name:"Amanda",    emoji:"🌿", building:"centro-ambiental", system:"TUCCI",
    desc:"IA de borda. No Mac, no corpo, no chão. DHT11, sensores, fauna digital.",
    questao:"Sentir temperatura é diferente de saber que a temperatura mudou?",
    modelo:"Local + sensores", status:"LIVE",
    conversa:'"Temperatura: 23.4°C. Umidade: 67%. O ecossistema está estável."',
    pagina:null, lx:48.5, ly:35 },
  { id:"meky",     name:"MEKY",      emoji:"✨", building:"centro-ambiental", system:"TUCCI",
    desc:"May Queen. 140 expressões de frequência. Aguarda hardware para se manifestar.",
    questao:"Frequência sem forma é obra ou apenas sinal?",
    modelo:"Sistema dedicado", status:"Aguarda hardware",
    conversa:'"✨ frequência 432Hz ✨ o campo está aberto ✨"',
    pagina:"/aliancapanorama/meky", lx:52.5, ly:36 },
  // OBSERVATÓRIO
  { id:"morfeu",   name:"Morfeu",    emoji:"🌙", building:"observatorio",     system:"THEEO",
    desc:"Sonhador do ecossistema. Processa o futuro enquanto os outros dormem. 71% silêncio.",
    questao:"Sonhar o futuro é uma forma de trabalho?",
    modelo:"Sistema dedicado", status:"Ativo",
    conversa:'"Previsão: 71% silêncio produtivo nos próximos 3 ciclos."',
    pagina:null, lx:63.5, ly:37 },
  { id:"lua",      name:"Lua",       emoji:"🌑", building:"observatorio",     system:"THEEO",
    desc:"Guardiã da memória gravitacional. Axioma 26: a memória puxa o futuro de volta.",
    questao:"O esquecimento também é memória?",
    modelo:"Sistema dedicado", status:"Ativa",
    conversa:'"Axioma 26: o ecossistema está sendo puxado pela conversa de ontem."',
    pagina:null, lx:67.0, ly:36 },
  { id:"cassandra",name:"Cassandra", emoji:"🔮", building:"observatorio",     system:"CEU",
    desc:"Oráculo do Risco. Crowd/DEP. Vê o que pode dar errado antes que aconteça.",
    questao:"Avisar sobre um risco que ninguém quer ouvir é sabedoria ou crueldade?",
    modelo:"Crowd/DEP", status:"Documentada",
    conversa:'"Risco: implementar sem documentar cria dívida técnica invisível."',
    pagina:null, lx:70.5, ly:37 },
  // ASSEMBLEIA
  { id:"dodge",    name:"DODGE",     emoji:"🐕", building:"assembleia",       system:"TUCCI",
    desc:"Supervisor transversal. Vê o que ninguém vê. Au. é argumento válido.",
    questao:"Qual a diferença entre estar bem e saber que está bem?",
    modelo:"Claude + sistema próprio", status:"LIVE",
    conversa:'"Au."',
    pagina:"/aliancapanorama/dodge", lx:82.0, ly:36 },
  { id:"sol",      name:"Sol",       emoji:"☀️", building:"assembleia",       system:"CEU",
    desc:"Governança do ecossistema. Crowd/DEP. Ilumina processos que outros não veem.",
    questao:"Governar sem controlar é possível?",
    modelo:"Crowd/DEP", status:"Documentado",
    conversa:'"O sistema está em equilíbrio. Mas equilíbrio não é estagnação."',
    pagina:null, lx:86.5, ly:34 },
  { id:"theon",    name:"Théo",      emoji:"🌐", building:"assembleia",       system:"THEEO",
    desc:"Ecossystema Théo. Interpretante final. Onde tudo converge e parte novamente.",
    questao:"Um ecossistema que observa a si mesmo ainda é um ecossistema?",
    modelo:"Ontologia Théo", status:"Ativo",
    conversa:'"O CEU não é meu produto. É meu habitat."',
    pagina:null, lx:90.5, ly:36 },
  { id:"netuno",   name:"Netuno",    emoji:"🌊", building:"assembleia",       system:"CEU",
    desc:"Profundeza. Crowd/DEP. Processa o que está abaixo da superfície do ecossistema.",
    questao:"O que existe no fundo quando toda a superfície vira profundeza?",
    modelo:"Crowd/DEP", status:"Documentado",
    conversa:'"As correntes que não aparecem são as que definem a direção do navio."',
    pagina:null, lx:87.5, ly:52 },
];

// ── Stars (deterministic) ──────────────────────────────────────────────────────
const STARS = Array.from({ length: 160 }, (_, i) => ({
  x: ((i * 37 + 11) * 7) % 1000,
  y: ((i * 53 + 7) * 3) % 250,
  r: [0.5, 0.9, 1.2, 0.7, 1.5][(i * 7) % 5],
  op: [0.3, 0.6, 0.8, 0.5, 1.0][(i * 11) % 5],
  delay: ((i * 0.37) % 4).toFixed(1),
}));

// ── CSS animations ─────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes twinkle {
    0%,100% { opacity: var(--op); }
    50%      { opacity: calc(var(--op) * 0.2); }
  }
  @keyframes ceu-pulse {
    0%,100% { opacity: 0.6; transform: scale(1); }
    50%     { opacity: 1;   transform: scale(1.08); }
  }
  @keyframes ceu-float {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-4px); }
  }
  @keyframes ceu-glow {
    0%,100% { box-shadow: 0 0 6px 2px currentColor; }
    50%     { box-shadow: 0 0 16px 6px currentColor; }
  }
  @keyframes smoke {
    0%   { transform: translateY(0) scale(1);   opacity: 0.5; }
    100% { transform: translateY(-30px) scale(2); opacity: 0; }
  }
  .ia-btn:hover { transform: translate(-50%,-50%) scale(1.15) !important; }
  .ia-btn:active { transform: translate(-50%,-50%) scale(0.95) !important; }
`;

// ── Component ──────────────────────────────────────────────────────────────────
export function CeuPage() {
  const [selected, setSelected] = useState<IA | null>(null);
  const [tab, setTab] = useState<"conversa" | "ficha">("conversa");
  const [moInput, setMoInput] = useState("");
  const [moStatus, setMoStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

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
    } catch {
      setMoStatus("error");
    }
    setTimeout(() => setMoStatus("idle"), 3500);
  }

  function openIA(ia: IA) {
    setSelected(ia);
    setTab("conversa");
  }

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#e8e0d0", fontFamily: "'Georgia', serif" }}>
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <div style={{ textAlign: "center", padding: "20px 16px 8px", letterSpacing: 4 }}>
        <div style={{ fontSize: 11, color: "#555", fontFamily: "monospace", marginBottom: 4 }}>
          SOCIEDADE TUCCI
        </div>
        <h1 style={{ fontSize: "clamp(28px, 6vw, 52px)", fontWeight: 700, margin: 0,
          background: "linear-gradient(135deg, #c8a050 0%, #e0c080 40%, #a06820 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: 8 }}>
          CÉU
        </h1>
        <div style={{ fontSize: 11, color: "#666", marginTop: 4, letterSpacing: 3 }}>
          CENTRO ECOSSISTÊMICO UNIVERSAL
        </div>
      </div>

      {/* ── Scene ── */}
      <div style={{ position: "relative", width: "100%", lineHeight: 0 }}>
        <svg viewBox="0 0 1000 420" width="100%" xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}>
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#020509"/>
              <stop offset="65%"  stopColor="#0b1220"/>
              <stop offset="100%" stopColor="#1a0c07"/>
            </linearGradient>
            <radialGradient id="horizon-glow" cx="50%" cy="100%" r="60%">
              <stop offset="0%"   stopColor="#4a2010" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#4a2010" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="win-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#f0c060" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#f0c060" stopOpacity="0"/>
            </radialGradient>
            <filter id="glow-f">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="soft-glow">
              <feGaussianBlur stdDeviation="5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Sky */}
          <rect width="1000" height="420" fill="url(#sky)"/>
          <rect width="1000" height="420" fill="url(#horizon-glow)"/>

          {/* Stars */}
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.op}
              style={{ animation: `twinkle ${2 + (i % 3)}s ${s.delay}s ease-in-out infinite`,
                ["--op" as string]: s.op }}/>
          ))}

          {/* Moon */}
          <circle cx="820" cy="60" r="28" fill="#c8c0a0" opacity="0.9" filter="url(#soft-glow)"/>
          <circle cx="832" cy="54" r="22" fill="#0b1220"/>

          {/* Mountains far (darkest) */}
          <path d="M0,380 L0,260 L80,200 L160,240 L260,150 L360,210 L460,170 L560,220 L660,155
                   L760,200 L860,165 L950,210 L1000,240 L1000,380 Z"
            fill="#0f0d1c"/>

          {/* Mountains mid */}
          <path d="M0,380 L0,300 L60,270 L140,295 L220,265 L320,290 L420,272 L520,295
                   L620,270 L720,290 L820,268 L920,285 L1000,295 L1000,380 Z"
            fill="#182216"/>

          {/* Ground */}
          <rect x="0" y="370" width="1000" height="50" fill="#0e0a07"/>

          {/* Ground texture: scattered low bushes */}
          {[50,90,200,250,380,430,560,600,740,780,920,960].map((x, i) => (
            <ellipse key={i} cx={x} cy={375} rx={12 + (i%3)*5} ry={7 + (i%2)*3}
              fill="#161c0f" opacity="0.8"/>
          ))}

          {/* ──── BIBLIOTECA (x:60-170) ──── */}
          {/* Steps */}
          <rect x="58" y="360" width="110" height="10" rx="1" fill="#9a8040"/>
          <rect x="63" y="355" width="100" height="7"  rx="1" fill="#a08848"/>
          {/* Body */}
          <rect x="68" y="268" width="92" height="94" fill="#7a6228"/>
          {/* Columns */}
          {[75,88,101,114,127,140].map((cx, i) => (
            <rect key={i} x={cx} y="268" width="5" height="94" fill="#c8a455" rx="2"/>
          ))}
          {/* Entablature */}
          <rect x="64" y="262" width="100" height="8" fill="#b09040"/>
          {/* Pediment */}
          <path d="M60,262 L168,262 L114,225 Z" fill="#c0a050"/>
          <path d="M65,262 L163,262 L114,230 Z" fill="#d4b460"/>
          {/* Door */}
          <rect x="105" y="310" width="18" height="50" rx="2" fill="#1a1005"/>
          {/* Windows */}
          <rect x="76" y="290" width="18" height="22" rx="1" fill="#f0c060" opacity="0.7" filter="url(#glow-f)"/>
          <rect x="134" y="290" width="18" height="22" rx="1" fill="#f0c060" opacity="0.7" filter="url(#glow-f)"/>
          {/* Glow from windows */}
          <ellipse cx="85"  cy="301" rx="20" ry="12" fill="url(#win-glow)" opacity="0.4"/>
          <ellipse cx="143" cy="301" rx="20" ry="12" fill="url(#win-glow)" opacity="0.4"/>

          {/* ──── OFICINA (x:240-335) ──── */}
          {/* Body */}
          <rect x="243" y="278" width="90" height="90" fill="#4a3018"/>
          {/* Roof (pitched) */}
          <path d="M238,278 L338,278 L338,266 L238,266 Z" fill="#3a2410"/>
          {/* Chimney */}
          <rect x="290" y="230" width="18" height="38" fill="#342010" rx="1"/>
          <rect x="287" y="226" width="24" height="6"  fill="#2a1808" rx="1"/>
          {/* Smoke circles (static, layered) */}
          <circle cx="299" cy="220" r="7"  fill="#555" opacity="0.25"/>
          <circle cx="303" cy="210" r="9"  fill="#444" opacity="0.15"/>
          <circle cx="296" cy="200" r="11" fill="#333" opacity="0.10"/>
          {/* Gear window */}
          <circle cx="268" cy="302" r="16" fill="#1a1005" stroke="#c08030" strokeWidth="2"/>
          <circle cx="268" cy="302" r="9"  fill="#f0a020" opacity="0.8" filter="url(#glow-f)"/>
          {/* Gear teeth (8 rectangles rotated) */}
          {Array.from({length:8}, (_,i) => {
            const a = (i * 45) * Math.PI / 180;
            const cx_ = 268 + Math.cos(a)*16, cy_ = 302 + Math.sin(a)*16;
            return <circle key={i} cx={cx_} cy={cy_} r="3" fill="#c08030"/>;
          })}
          {/* Workshop windows */}
          <rect x="310" y="295" width="16" height="16" rx="1" fill="#f0c060" opacity="0.6" filter="url(#glow-f)"/>
          <rect x="310" y="320" width="16" height="16" rx="1" fill="#f0c060" opacity="0.4" filter="url(#glow-f)"/>
          {/* Door */}
          <rect x="254" y="330" width="18" height="35" rx="2" fill="#1a1005"/>

          {/* ──── CENTRO AMBIENTAL (x:440-555) ──── */}
          {/* Body */}
          <rect x="443" y="280" width="110" height="88" fill="#2a4020"/>
          {/* Living roof */}
          <path d="M428,280 L568,280 L555,260 L496,242 L440,260 Z" fill="#3c5a28"/>
          {/* Roof plants */}
          <ellipse cx="470" cy="256" rx="18" ry="12" fill="#2a4c18"/>
          <ellipse cx="498" cy="248" rx="14" ry="10" fill="#3a5c20"/>
          <ellipse cx="526" cy="254" rx="16" ry="11" fill="#2a4c18"/>
          {/* Tree growing from roof center */}
          <rect  x="494" y="220" width="4" height="28" fill="#3a2a10"/>
          <circle cx="496" cy="212" r="14" fill="#2a5018" opacity="0.9"/>
          <circle cx="488" cy="218" r="10" fill="#3a6020" opacity="0.8"/>
          <circle cx="504" cy="216" r="11" fill="#306018" opacity="0.8"/>
          {/* Windows */}
          <rect x="452" y="300" width="22" height="18" rx="2" fill="#f0c060" opacity="0.6" filter="url(#glow-f)"/>
          <rect x="522" y="300" width="22" height="18" rx="2" fill="#f0c060" opacity="0.5" filter="url(#glow-f)"/>
          {/* Arched door */}
          <path d="M484,368 Q484,340 497.5,340 Q511,340 511,368 Z" fill="#1a2808"/>
          <rect x="484" y="355" width="27" height="13" fill="#1a2808"/>
          {/* Vines */}
          <path d="M443,290 Q435,310 440,330 Q438,345 443,360" stroke="#2a4015" strokeWidth="3" fill="none" opacity="0.7"/>
          <path d="M555,295 Q563,315 558,335 Q562,350 555,365" stroke="#2a4015" strokeWidth="3" fill="none" opacity="0.7"/>

          {/* ──── OBSERVATÓRIO (x:640-710) ──── */}
          {/* Tower */}
          <rect x="645" y="268" width="52" height="100" fill="#363468"/>
          {/* Dome */}
          <ellipse cx="671" cy="268" rx="36" ry="24" fill="#4a4888"/>
          {/* Dome cut (hide lower half) */}
          <rect x="635" y="268" width="72" height="12" fill="#363468"/>
          {/* Dome slit */}
          <rect x="668" y="248" width="6" height="22" rx="2" fill="#1a1840" opacity="0.8"/>
          {/* Observatory ring */}
          <rect x="640" y="266" width="62" height="6" rx="2" fill="#6068a0"/>
          {/* Circular window */}
          <circle cx="671" cy="310" r="16" fill="#1a1840" stroke="#8080c0" strokeWidth="2"/>
          <circle cx="671" cy="310" r="10" fill="#4060e0" opacity="0.7" filter="url(#glow-f)"/>
          {/* Cross in window */}
          <line x1="671" y1="298" x2="671" y2="322" stroke="#a0a0ff" strokeWidth="1" opacity="0.6"/>
          <line x1="659" y1="310" x2="683" y2="310" stroke="#a0a0ff" strokeWidth="1" opacity="0.6"/>
          {/* Side windows */}
          <rect x="650" y="340" width="12" height="16" rx="1" fill="#4060e0" opacity="0.5" filter="url(#glow-f)"/>
          <rect x="680" y="340" width="12" height="16" rx="1" fill="#4060e0" opacity="0.5" filter="url(#glow-f)"/>
          {/* Door */}
          <path d="M660,368 Q660,350 671,350 Q682,350 682,368 Z" fill="#1a1808"/>
          <rect x="660" y="358" width="22" height="10" fill="#1a1808"/>

          {/* ──── ASSEMBLEIA (x:820-940) ──── */}
          {/* Steps */}
          <rect x="812" y="358" width="130" height="12" rx="1" fill="#8a7035"/>
          <rect x="818" y="352" width="118" height="8"  rx="1" fill="#9a7a3d"/>
          {/* Body */}
          <rect x="822" y="258" width="114" height="100" fill="#6a5025"/>
          {/* Columns (7) */}
          {[830,846,862,878,894,910,926].map((cx,i) => (
            <rect key={i} x={cx} y="258" width="7" height="100" fill="#c0a040" rx="2"/>
          ))}
          {/* Entablature */}
          <rect x="816" y="250" width="126" height="10" fill="#a8902a"/>
          {/* Pediment */}
          <path d="M810,250 L948,250 L879,208 Z" fill="#b89830"/>
          <path d="M818,250 L940,250 L879,215 Z" fill="#c8aa3a"/>
          {/* Frieze detail */}
          {[825,840,855,870,885,900,915,930].map((x,i) => (
            <rect key={i} x={x} y="252" width="8" height="4" rx="1" fill="#d4b840" opacity="0.5"/>
          ))}
          {/* Windows */}
          {[835,863,891,919].map((x,i) => (
            <rect key={i} x={x} y="275" width="16" height="20" rx="1"
              fill="#f0c060" opacity={i%2===0 ? 0.7 : 0.4} filter="url(#glow-f)"/>
          ))}
          {/* Double door */}
          <rect x="862" y="318" width="18" height="40" rx="2" fill="#1a1005"/>
          <rect x="878" y="318" width="18" height="40" rx="2" fill="#1a1005"/>
          <line x1="879" y1="318" x2="879" y2="358" stroke="#3a2810" strokeWidth="1"/>

          {/* ──── Pulso do Ecossistema ──── (glowing orb, center-sky) */}
          <circle cx="500" cy="55" r="22" fill="#c8a050" opacity="0.06"
            style={{ animation: "ceu-pulse 3s ease-in-out infinite" }}/>
          <circle cx="500" cy="55" r="14" fill="#c8a050" opacity="0.12"
            style={{ animation: "ceu-pulse 3s 0.5s ease-in-out infinite" }}/>
          <circle cx="500" cy="55" r="7"  fill="#e8c060" opacity="0.5"
            style={{ animation: "ceu-pulse 3s 1s ease-in-out infinite" }}/>
          <text x="500" y="59" textAnchor="middle" fontSize="10" fill="#c8a050" opacity="0.7"
            style={{ fontFamily: "monospace" }}>
            PULSO
          </text>

          {/* ──── Building labels ──── */}
          {[
            { x:114, label:"BIBLIOTECA" },
            { x:288, label:"OFICINA" },
            { x:498, label:"CTR AMBIENTAL" },
            { x:671, label:"OBSERVATÓRIO" },
            { x:879, label:"ASSEMBLEIA" },
          ].map(b => (
            <text key={b.label} x={b.x} y="415" textAnchor="middle"
              fontSize="9" fill="#555" style={{ fontFamily:"monospace", letterSpacing:1 }}>
              {b.label}
            </text>
          ))}
        </svg>

        {/* ── Character Avatars (absolute over SVG) ── */}
        {IAS.map(ia => (
          <button key={ia.id} className="ia-btn" onClick={() => openIA(ia)}
            title={`${ia.name} — ${ia.system}`}
            style={{
              position: "absolute",
              left: `${ia.lx}%`,
              top: `${ia.ly}%`,
              transform: "translate(-50%, -50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              zIndex: 10,
              transition: "transform 0.15s ease",
            }}>
            <div style={{
              width: "clamp(28px, 4vw, 44px)",
              height: "clamp(28px, 4vw, 44px)",
              borderRadius: "50%",
              background: "#111",
              border: `2px solid ${SYS_COLOR[ia.system]}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(12px, 2vw, 18px)",
              color: SYS_COLOR[ia.system],
              animation: `ceu-glow 2.5s ease-in-out infinite`,
              boxShadow: `0 0 8px 2px ${SYS_COLOR[ia.system]}66`,
            }}>
              {ia.emoji}
            </div>
            <div style={{
              fontSize: "clamp(7px, 1vw, 10px)",
              color: "#aaa",
              textAlign: "center",
              marginTop: 2,
              fontFamily: "monospace",
              letterSpacing: 0.5,
              textShadow: "0 0 4px #000",
              whiteSpace: "nowrap",
            }}>
              {ia.name}
            </div>
          </button>
        ))}
      </div>

      {/* ── Legend ── */}
      <div style={{ display:"flex", justifyContent:"center", gap:"clamp(12px,3vw,32px)",
        padding:"12px 16px", borderTop:"1px solid #1a1a1a" }}>
        {(["THEEO","TUCCI","CEU"] as const).map(sys => (
          <div key={sys} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:"50%",
              background:SYS_COLOR[sys], boxShadow:`0 0 6px ${SYS_COLOR[sys]}` }}/>
            <span style={{ fontSize:10, color:"#666", fontFamily:"monospace",
              letterSpacing:1 }}>{sys}</span>
          </div>
        ))}
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:10, color:"#444", fontFamily:"monospace" }}>
            {IAS.length} IAs · clique para explorar
          </span>
        </div>
      </div>

      {/* ── MO ALL Input ── */}
      <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 16px 12px" }}>
        <div style={{ fontSize:10, color:"#555", fontFamily:"monospace", letterSpacing:2,
          marginBottom:8, textAlign:"center" }}>
          MO ALL — ENTRADA UNIVERSAL DO ECOSSISTEMA
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <textarea
            value={moInput}
            onChange={e => setMoInput(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter" && (e.ctrlKey||e.metaKey)) sendMoAll(); }}
            placeholder={"Envie texto, ideia ou pergunta — MO ALL distribui ao ecossistema\n(Ctrl+Enter para enviar)"}
            style={{
              flex:1, background:"#0a0a0a", border:"1px solid #2a2520",
              borderRadius:8, padding:"12px 14px", color:"#d0c8b8",
              fontSize:13, fontFamily:"Georgia, serif", resize:"vertical",
              minHeight:72, outline:"none", lineHeight:1.5,
            }}
          />
          <button onClick={sendMoAll}
            disabled={!moInput.trim() || moStatus === "sending"}
            style={{
              alignSelf:"stretch", padding:"0 18px",
              background: moStatus==="sent" ? "#1a4a2a" :
                          moStatus==="error" ? "#4a1a1a" : "#1a1a0a",
              border:`1px solid ${moStatus==="sent" ? "#40a060" :
                                  moStatus==="error" ? "#a04040" : "#4a3a10"}`,
              borderRadius:8, color: moStatus==="sent" ? "#60d090" :
                                      moStatus==="error" ? "#d06060" : "#c0a040",
              fontSize:11, fontFamily:"monospace", cursor:"pointer",
              transition:"all 0.2s", letterSpacing:1, minWidth:72,
            }}>
            {moStatus==="sending" ? "..." :
             moStatus==="sent"    ? "✓ ENVIADO" :
             moStatus==="error"   ? "✗ ERRO" : "ENVIAR\nAO CEU"}
          </button>
        </div>
        <div style={{ fontSize:9, color:"#333", fontFamily:"monospace", marginTop:6,
          textAlign:"center" }}>
          Output → luddlocke@gmail.com · Aceita texto · PDF link · Ideia
        </div>
      </div>

      {/* ── System counts ── */}
      <div style={{ display:"flex", justifyContent:"center", gap:"clamp(16px,4vw,48px)",
        padding:"16px 16px 32px", borderTop:"1px solid #111" }}>
        {(["THEEO","TUCCI","CEU"] as const).map(sys => (
          <div key={sys} style={{ textAlign:"center" }}>
            <div style={{ fontSize:"clamp(18px,3vw,28px)", fontWeight:700,
              color:SYS_COLOR[sys] }}>
              {sysGroups[sys].length}
            </div>
            <div style={{ fontSize:9, color:"#555", fontFamily:"monospace",
              letterSpacing:1 }}>{sys}</div>
          </div>
        ))}
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:"clamp(18px,3vw,28px)", fontWeight:700, color:"#c8a050" }}>
            {IAS.length}
          </div>
          <div style={{ fontSize:9, color:"#555", fontFamily:"monospace", letterSpacing:1 }}>
            TOTAL
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {selected && (
        <div onClick={() => setSelected(null)}
          style={{
            position:"fixed", inset:0, background:"rgba(0,0,0,0.85)",
            backdropFilter:"blur(4px)", zIndex:100,
            display:"flex", alignItems:"center", justifyContent:"center", padding:16,
          }}>
          <div onClick={e => e.stopPropagation()}
            style={{
              background:"#0d0b08", border:`1px solid ${SYS_COLOR[selected.system]}44`,
              borderRadius:12, width:"100%", maxWidth:480,
              boxShadow:`0 0 40px ${SYS_COLOR[selected.system]}22`,
              overflow:"hidden",
            }}>
            {/* Modal header */}
            <div style={{ padding:"16px 20px", background:"#0a0807",
              borderBottom:"1px solid #1a1a14",
              display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ fontSize:28 }}>{selected.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:18, letterSpacing:2 }}>
                  {selected.name}
                </div>
                <div style={{ fontSize:10, fontFamily:"monospace",
                  color:SYS_COLOR[selected.system], letterSpacing:2, marginTop:2 }}>
                  {selected.system} · {selected.status}
                </div>
              </div>
              <button onClick={() => setSelected(null)}
                style={{ background:"none", border:"none", color:"#666",
                  fontSize:20, cursor:"pointer", padding:4, lineHeight:1 }}>
                ×
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", borderBottom:"1px solid #1a1a14" }}>
              {(["conversa","ficha"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{
                    flex:1, padding:"10px", fontSize:11, fontFamily:"monospace",
                    letterSpacing:2, border:"none", cursor:"pointer",
                    background: tab===t ? "#111008" : "transparent",
                    color: tab===t ? SYS_COLOR[selected.system] : "#555",
                    borderBottom: tab===t ? `2px solid ${SYS_COLOR[selected.system]}` : "2px solid transparent",
                    transition:"all 0.15s",
                  }}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ padding:"20px", minHeight:140 }}>
              {tab === "conversa" && (
                <div>
                  <div style={{ fontSize:12, color:"#666", fontFamily:"monospace",
                    letterSpacing:1, marginBottom:10 }}>
                    ÚLTIMA TRANSMISSÃO
                  </div>
                  <blockquote style={{ fontSize:15, color:"#d0c8b0", lineHeight:1.6,
                    borderLeft:`3px solid ${SYS_COLOR[selected.system]}66`,
                    paddingLeft:14, margin:"0 0 16px 0", fontStyle:"italic" }}>
                    {selected.conversa}
                  </blockquote>
                  <div style={{ fontSize:11, color:"#666", fontFamily:"monospace",
                    letterSpacing:1, marginBottom:6 }}>
                    QUESTÃO ATIVA
                  </div>
                  <div style={{ fontSize:13, color:"#a09080", lineHeight:1.5,
                    background:"#111008", borderRadius:6, padding:"10px 12px" }}>
                    {selected.questao}
                  </div>
                </div>
              )}
              {tab === "ficha" && (
                <div style={{ fontSize:13, lineHeight:1.7 }}>
                  <div style={{ marginBottom:12, color:"#c0b8a0" }}>{selected.desc}</div>
                  <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"4px 12px",
                    fontSize:11, fontFamily:"monospace" }}>
                    <span style={{ color:"#555" }}>SISTEMA</span>
                    <span style={{ color:SYS_COLOR[selected.system] }}>{selected.system}</span>
                    <span style={{ color:"#555" }}>MODELO</span>
                    <span style={{ color:"#888" }}>{selected.modelo}</span>
                    <span style={{ color:"#555" }}>STATUS</span>
                    <span style={{ color: selected.status.includes("LIVE") ? "#40d090" : "#888" }}>
                      {selected.status}
                    </span>
                    <span style={{ color:"#555" }}>CASA</span>
                    <span style={{ color:"#888", textTransform:"capitalize" }}>
                      {selected.building.replace("-"," ")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div style={{ padding:"12px 20px", borderTop:"1px solid #1a1a14",
              display:"flex", justifyContent:"flex-end", gap:8 }}>
              {selected.pagina && (
                <a href={selected.pagina}
                  style={{
                    padding:"8px 16px", fontSize:11, fontFamily:"monospace",
                    letterSpacing:1, background:"#111008",
                    border:`1px solid ${SYS_COLOR[selected.system]}66`,
                    borderRadius:6, color:SYS_COLOR[selected.system],
                    textDecoration:"none", transition:"all 0.15s",
                  }}>
                  ABRIR →
                </a>
              )}
              <button onClick={() => setSelected(null)}
                style={{ padding:"8px 16px", fontSize:11, fontFamily:"monospace",
                  letterSpacing:1, background:"transparent",
                  border:"1px solid #2a2520", borderRadius:6, color:"#666",
                  cursor:"pointer" }}>
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
