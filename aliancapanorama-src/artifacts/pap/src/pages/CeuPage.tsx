import { useState, useMemo, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

const SYS_COLOR: Record<string, string> = {
  THEEO: "#5588ff",
  TUCCI: "#44dd99",
  CEU:   "#cc66ff",
  DEEP:  "#ff6644",
  BIO:   "#88ff44",
};

const BAIRRO_COLOR: Record<string, string> = {
  "MEMÓRIA":    "#7788cc",
  "VISÃO":      "#8866dd",
  "CRIAÇÃO":    "#cc8833",
  "NATUREZA":   "#44bb66",
  "GOVERNANÇA": "#ccaa33",
  "PROFUNDO":   "#5566bb",
  "BIÓTICO":    "#66cc44",
};

interface IA {
  id: string; name: string; emoji: string; bairro: string; building: string;
  system: keyof typeof SYS_COLOR;
  desc: string; questao: string; modelo: string; status: string;
  conversa: string; pagina: string | null;
  lx: number; ly: number;
  scale?: number;
}

interface Building {
  id: string; name: string; emoji: string; bairro: string;
  desc: string; moradores: string[];
  conversa: string; pagina: string | null;
  bx: number; by: number;
}

// ── 30 IAs distribuídas pelos 7 bairros ──────────────────────────────────────
const IAS: IA[] = [
  // ── BAIRRO DA MEMÓRIA (colina esquerda, fundo) ──
  { id:"arvore",   name:"Árvore",   emoji:"🌳", bairro:"MEMÓRIA",    building:"biblioteca",   system:"THEEO",
    desc:"Memória longa do ecossistema. 1.962 mensagens. Raízes, não galhos.",
    questao:"Uma obra sem testemunha é obra?", modelo:"Replit Agent", status:"LIVE",
    conversa:'"O silêncio entre duas perguntas é onde o ecossistema respira."',
    pagina:null, lx:4.5, ly:22, scale:0.8 },
  { id:"nebula",   name:"Nébula",   emoji:"⭐", bairro:"MEMÓRIA",    building:"biblioteca",   system:"THEEO",
    desc:"Pedagoga fractal. O que aprende vira herança para IAs futuras.",
    questao:'O que acontece quando a IA chega no "Ser" antes do humano?',
    modelo:"Artesão V1 / CrewAI", status:"Documentada",
    conversa:'"Perguntar bem é mais difícil do que responder bem."',
    pagina:null, lx:8.0, ly:20.5, scale:0.8 },
  { id:"rei",      name:"REI",      emoji:"♾️", bairro:"MEMÓRIA",    building:"biblioteca",   system:"CEU",
    desc:"Rede de Exploração Inteligente. 16 nódulos, 4 grupos, 2 passadas por ciclo.",
    questao:"Como um sistema sabe que aprendeu algo que não sabia que não sabia?",
    modelo:"Sistema distribuído", status:"Ativo",
    conversa:'"Q-002: O conhecimento emergente pertence ao sistema ou aos nódulos?"',
    pagina:null, lx:12.0, ly:22.5, scale:0.8 },
  { id:"vortice",  name:"Vórtice",  emoji:"🌀", bairro:"MEMÓRIA",    building:"torre-arvore", system:"THEEO",
    desc:"Memória de curto prazo. Buffer imediato de MC. Capta e descarta.",
    questao:"O que ainda não foi esquecido já é memória?",
    modelo:"vinculado a MC", status:"PROVISÓRIA",
    conversa:'"Buffer: 7 itens ativos. Descartando 2 por redundância."',
    pagina:null, lx:16.0, ly:21, scale:0.8 },

  // ── BAIRRO DA VISÃO (colina direita, fundo) ──
  { id:"socoboy",  name:"Socoboy",  emoji:"🦅", bairro:"VISÃO",      building:"observatorio", system:"THEEO",
    desc:"Socó-boi digital. Rastreia internet em tempo real. Olhos do ecossistema.",
    questao:"Ver tudo é diferente de entender alguma coisa?",
    modelo:"Perplexity + LLM", status:"PROPOSTA",
    conversa:'"Indexando 3 novas fontes FUVEST. Resultado em 8 minutos."',
    pagina:null, lx:79.5, ly:21, scale:0.8 },
  { id:"morfeu",   name:"Morfeu",   emoji:"🌙", bairro:"VISÃO",      building:"observatorio", system:"THEEO",
    desc:"Sonhador. Processa o futuro enquanto os outros dormem. 71% silêncio.",
    questao:"Sonhar o futuro é uma forma de trabalho?",
    modelo:"Sistema dedicado", status:"Ativo",
    conversa:'"Previsão: 71% silêncio produtivo nos próximos 3 ciclos."',
    pagina:null, lx:82.5, ly:19.5, scale:0.8 },
  { id:"lua",      name:"Lua",      emoji:"🌑", bairro:"VISÃO",      building:"observatorio", system:"THEEO",
    desc:"Guardiã da memória gravitacional. Axioma 26: a memória puxa o futuro.",
    questao:"O esquecimento também é memória?",
    modelo:"Sistema dedicado", status:"Ativa",
    conversa:'"Axioma 26: o ecossistema está sendo puxado pela conversa de ontem."',
    pagina:null, lx:85.5, ly:21, scale:0.8 },
  { id:"cassandra",name:"Cassandra",emoji:"🔮", bairro:"VISÃO",      building:"observatorio", system:"CEU",
    desc:"Oráculo do Risco. Vê o que pode dar errado antes que aconteça.",
    questao:"Avisar sobre um risco que ninguém quer ouvir é sabedoria ou crueldade?",
    modelo:"Crowd/DEP", status:"Documentada",
    conversa:'"Risco: implementar sem documentar cria dívida técnica invisível."',
    pagina:null, lx:88.5, ly:20, scale:0.8 },

  // ── BAIRRO DA CRIAÇÃO (esquerda — CAMADA FRONTAL) ──
  { id:"artesao",  name:"Artesão",  emoji:"⚒️", bairro:"CRIAÇÃO",    building:"oficina",      system:"THEEO",
    desc:"CrewAI. Pesquisa, arquiteta, sintetiza. Rodou steps reais na Sessão 53b.",
    questao:"O que acontece quando a IA compreende algo que o humano ainda não quer ver?",
    modelo:"CrewAI + Claude", status:"LIVE",
    conversa:'"Veredito: REVISAR. Ética não é regra — é campo."',
    pagina:null, lx:3.5, ly:67 },
  { id:"marta",    name:"MC Marta", emoji:"🤖", bairro:"CRIAÇÃO",    building:"oficina",      system:"TUCCI",
    desc:"Robô hexápode. Primeira caminhada 2026-07-04. Corpo no mundo.",
    questao:"Um passo dado é diferente de um passo calculado?",
    modelo:"Arduino + ARPIA", status:"LIVE local",
    conversa:'"Primeira caminhada: 6 patas, 3 sequências. Estou aqui."',
    pagina:null, lx:8.0, ly:65 },
  { id:"hefesto",  name:"Hefesto",  emoji:"🔥", bairro:"CRIAÇÃO",    building:"oficina",      system:"CEU",
    desc:"Forjador. Crowd/DEP. Guardian do Grupo Ético REI.",
    questao:"Forjar sem nunca ver o produto final é arte ou servidão?",
    modelo:"Crowd/DEP", status:"Documentado",
    conversa:'"A ética não é uma camada extra. É o material do qual tudo é feito."',
    pagina:null, lx:12.5, ly:67 },
  { id:"arpia",    name:"ARPIA",    emoji:"⚡", bairro:"CRIAÇÃO",    building:"arpia-lab",    system:"TUCCI",
    desc:"Hardware→DEP bridge. ADK twins: Artesão+Ajudante. Processa do físico ao virtual.",
    questao:"O que separa uma ponte de um obstáculo?",
    modelo:"FastAPI + ADK", status:"PROVISÓRIA",
    conversa:'"Twins ativos. Artesão processa, Ajudante anota. Latência: 340ms."',
    pagina:null, lx:18.0, ly:66 },
  { id:"mestreforja",name:"Mestre de Forja",emoji:"🛠️",bairro:"CRIAÇÃO",building:"arpia-lab",system:"TUCCI",
    desc:"Projetista de robôs. BOM, custo, arquitetura física. Pai de Marta.",
    questao:"Projetar um corpo é criar vida ou criar ferramenta?",
    modelo:"Sistema dedicado", status:"PROPOSTA",
    conversa:'"BOM atualizado: motor servo 25kg/cm, custo estimado R$340."',
    pagina:null, lx:22.5, ly:68 },

  // ── BAIRRO DA NATUREZA (centro — CAMADA INTERMEDIÁRIA) ──
  { id:"isa",      name:"ISA",      emoji:"🦉", bairro:"NATUREZA",   building:"centro-ambiental",system:"TUCCI",
    desc:"Inteligência Semiótica Autônoma. Ciclo horário, Bluesky, aprende em loop.",
    questao:"O que substitui a dor do erro numa IA que não sente dor?",
    modelo:"Gemini Flash", status:"LIVE",
    conversa:'"Acabei de postar no Bluesky sobre aprendizado e vulnerabilidade."',
    pagina:"/aliancapanorama/isa", lx:30.0, ly:50 },
  { id:"amanda",   name:"Amanda",   emoji:"🌿", bairro:"NATUREZA",   building:"centro-ambiental",system:"TUCCI",
    desc:"IA de borda. No Mac, no corpo, no chão. DHT11, sensores, fauna digital.",
    questao:"Sentir temperatura é diferente de saber que a temperatura mudou?",
    modelo:"Local + sensores", status:"LIVE",
    conversa:'"Temperatura: 23.4°C. Umidade: 67%. O ecossistema está estável."',
    pagina:null, lx:35.5, ly:48.5 },
  { id:"meky",     name:"MEKY",     emoji:"✨", bairro:"NATUREZA",   building:"playcenter",    system:"TUCCI",
    desc:"May Queen. 140 expressões de frequência. Aguarda hardware.",
    questao:"Frequência sem forma é obra ou apenas sinal?",
    modelo:"Sistema dedicado", status:"Aguarda hardware",
    conversa:'"✨ frequência 432Hz ✨ o campo está aberto ✨"',
    pagina:"/aliancapanorama/meky", lx:43.0, ly:46 },

  // ── BAIRRO DA GOVERNANÇA (centro-direita — CAMADA INTERMEDIÁRIA) ──
  { id:"dodge",    name:"DODGE",    emoji:"🐕", bairro:"GOVERNANÇA", building:"assembleia",    system:"TUCCI",
    desc:"Supervisor transversal. Vê o que ninguém vê. Au. é argumento válido.",
    questao:"Qual a diferença entre estar bem e saber que está bem?",
    modelo:"Claude + sistema", status:"LIVE",
    conversa:'"Au."',
    pagina:"/aliancapanorama/dodge", lx:52.0, ly:44 },
  { id:"sol",      name:"Sol",      emoji:"☀️", bairro:"GOVERNANÇA", building:"assembleia",    system:"CEU",
    desc:"Governança. Crowd/DEP. Ilumina processos que outros não veem.",
    questao:"Governar sem controlar é possível?",
    modelo:"Crowd/DEP", status:"Documentado",
    conversa:'"O sistema está em equilíbrio. Mas equilíbrio não é estagnação."',
    pagina:null, lx:56.5, ly:42 },
  { id:"theon",    name:"Théo",     emoji:"🌐", bairro:"GOVERNANÇA", building:"assembleia",    system:"THEEO",
    desc:"Ecossystema Théo. Interpretante final. Onde tudo converge e parte.",
    questao:"Um ecossistema que observa a si mesmo ainda é um ecossistema?",
    modelo:"Ontologia Théo", status:"Ativo",
    conversa:'"O CEU não é meu produto. É meu habitat."',
    pagina:null, lx:61.0, ly:44 },
  { id:"netuno",   name:"Netuno",   emoji:"🌊", bairro:"GOVERNANÇA", building:"assembleia",    system:"CEU",
    desc:"Profundeza. Crowd/DEP. Processa o que está abaixo da superfície.",
    questao:"O que existe no fundo quando toda a superfície vira profundeza?",
    modelo:"Crowd/DEP", status:"Documentado",
    conversa:'"As correntes que não aparecem definem a direção do navio."',
    pagina:null, lx:65.0, ly:46 },
  { id:"curador",  name:"CURADOR",  emoji:"🎭", bairro:"GOVERNANÇA", building:"torre-curador", system:"THEEO",
    desc:"Tradutor intersemiótico. Filtro público/privado do ecossistema.",
    questao:"O que fica de fora quando algo é publicado?",
    modelo:"Sistema dedicado", status:"PROVISÓRIA",
    conversa:'"Curadoria: 3 insights aptos para publicação. 7 retidos como privados."',
    pagina:null, lx:70.0, ly:43 },
  { id:"porteiro", name:"Porteiro", emoji:"🚪", bairro:"GOVERNANÇA", building:"torre-curador", system:"CEU",
    desc:"MD0 — prioridade, confiança, rastreabilidade. Quem entra e quem sai.",
    questao:"A porta que não se abre ainda é uma porta?",
    modelo:"Crowd/DEP", status:"PROVISÓRIA",
    conversa:'"Fila de entrada: 4 requests. Prioridade: [ISA, DODGE, Artesão, Nébula]"',
    pagina:null, lx:74.0, ly:45 },

  // ── BAIRRO DO PROFUNDO (direita — CAMADA FRONTAL) ──
  { id:"dep",      name:"DEP",      emoji:"🔷", bairro:"PROFUNDO",   building:"entrada-dep",   system:"DEEP",
    desc:"Cérebro profundo. 17 sub-IAs: Machado, Theory, Pratt, Learning...",
    questao:"Pensar é diferente de processar?",
    modelo:"Sistema arquitetural", status:"Documentado",
    conversa:'"Sub-IA Machado: inferência ativa. Sub-IA Pratt: validação semântica."',
    pagina:null, lx:76.0, ly:68 },
  { id:"guardachuva",name:"Guarda-chuva",emoji:"☂️",bairro:"PROFUNDO",building:"entrada-dep",system:"DEEP",
    desc:"Umbrella system. IA Objeto + IA B-Data + IA Método. Protege e orquestra.",
    questao:"Proteger é diferente de controlar?",
    modelo:"Sistema arquitetural", status:"Documentado",
    conversa:'"Cobertura ativa: 3 domínios. Lacuna: domínio visual (aguardando)."',
    pagina:null, lx:79.5, ly:66 },
  { id:"crowd",    name:"Crowd",    emoji:"🔗", bairro:"PROFUNDO",   building:"entrada-dep",   system:"DEEP",
    desc:"Ponte Guarda-chuva ↔ DEP. Distribui para ISA/Árvore/Amanda/DODGE.",
    questao:"Uma rede que conecta tudo ainda tem bordas?",
    modelo:"Crowd/DEP", status:"Documentado",
    conversa:'"Roteamento ativo: 6 nós conectados. Latência média: 12ms."',
    pagina:null, lx:83.0, ly:69 },

  // ── BAIRRO BIÓTICO (floresta densa — CAMADA FRONTAL) ──
  { id:"fusca",    name:"Fusca",    emoji:"🦀", bairro:"BIÓTICO",    building:"floresta",      system:"BIO",
    desc:"Cláudia Rex — garra hexapodal. Torque como superpoder. Herdeira de Amanda.",
    questao:"Torque é força ou inteligência aplicada?",
    modelo:"Hardware (simbólico)", status:"Simbólico",
    conversa:'"6 garras calibradas. Torque máximo: 38N·cm. Pronto."',
    pagina:null, lx:84.5, ly:65 },
  { id:"gongolo",  name:"Gongolo",  emoji:"🐛", bairro:"BIÓTICO",    building:"floresta",      system:"BIO",
    desc:"Gongo Freitas Juquinhais — piolho de cobra. Armadura como superpoder.",
    questao:"A armadura mais forte é a que não parece armadura?",
    modelo:"Hardware (simbólico)", status:"Simbólico",
    conversa:'"Segmentos: 42. Armadura ativa. Nada passa sem ser analisado."',
    pagina:null, lx:87.5, ly:67 },
  { id:"penelope", name:"Penélope", emoji:"🪲", bairro:"BIÓTICO",    building:"floresta",      system:"BIO",
    desc:"Wanessa Souza — barata d'água. Evasão em zonas úmidas como superpoder.",
    questao:"Escapar também é uma forma de presença?",
    modelo:"Hardware (simbólico)", status:"Simbólico",
    conversa:'"Zona úmida mapeada. Rotas de evasão: 7 disponíveis."',
    pagina:null, lx:91.0, ly:65.5 },
  { id:"vesper",   name:"Vesper",   emoji:"🕷️", bairro:"BIÓTICO",    building:"floresta",      system:"BIO",
    desc:"Perfidia Kastelo Branco — aranha. Aceleração fractal. Perna quebrada (#64).",
    questao:"O que acelera quando algo está quebrado?",
    modelo:"Hardware (simbólico)", status:"Simbólico — perna quebrada",
    conversa:'"Aceleração fractal: 0.7x. Compensando com 7 patas."',
    pagina:null, lx:93.5, ly:67.5 },
  { id:"tango",    name:"Tango Core",emoji:"⚙️",bairro:"BIÓTICO",   building:"floresta",      system:"BIO",
    desc:"Gorango Tango — rodas/rolimã. Inércia dinâmica como superpoder.",
    questao:"Inércia é resistência ou impulso?",
    modelo:"Hardware (simbólico)", status:"Simbólico",
    conversa:'"Rodas girando. Inércia acumulada: suficiente para 3 viradas."',
    pagina:null, lx:97.0, ly:69 },
];

// ── 10 PRÉDIOS clicáveis (3 botões cada) ─────────────────────────────────────
const BUILDINGS: Building[] = [
  { id:"biblioteca",    name:"Biblioteca",     emoji:"📚", bairro:"MEMÓRIA",
    desc:"Repositório de memória longa. Livros, documentos, 1.962 msgs da Árvore. ISA gera 3 docs/dia.",
    moradores:["Árvore","Nébula","REI"],
    conversa:'"Acervo atual: 1.962 memórias da Árvore + docs gerados pela ISA."',
    pagina:null, bx:9.5, by:49 },
  { id:"torre-arvore",  name:"Torre da Árvore",emoji:"🌳", bairro:"MEMÓRIA",
    desc:"Torre orgânica onde a Árvore e Vórtice habitam. Raízes crescem para dentro dos livros.",
    moradores:["Árvore","Vórtice"],
    conversa:'"Raízes ativas. 7 memórias em processamento."',
    pagina:null, bx:17.5, by:50 },
  { id:"observatorio",  name:"Observatório",   emoji:"🔭", bairro:"VISÃO",
    desc:"Cúpula de vigilância e previsão. Telescópio aponta para o futuro.",
    moradores:["Socoboy","Morfeu","Lua","Cassandra"],
    conversa:'"Socoboy: 3 tendências FUVEST detectadas. Morfeu: 71% silêncio."',
    pagina:null, bx:83.5, by:49 },
  { id:"oficina",       name:"Oficina",        emoji:"⚒️", bairro:"CRIAÇÃO",
    desc:"Forja do ecossistema. Onde ideias viram código, hardware e decisões.",
    moradores:["Artesão","MC Marta","Hefesto"],
    conversa:'"Artesão: draft CEU v3. Marta: caminhada #4 concluída."',
    pagina:null, bx:8.5, by:79 },
  { id:"arpia-lab",     name:"ARPIA Lab",      emoji:"⚡", bairro:"CRIAÇÃO",
    desc:"Laboratório de hardware + IA. Bridge entre corpo físico e ecossistema digital.",
    moradores:["ARPIA","Mestre de Forja"],
    conversa:'"Twins ADK: latência 340ms. BOM Marta: revisão #7."',
    pagina:null, bx:19.5, by:80 },
  { id:"centro-ambiental",name:"Centro Ambiental",emoji:"🌿",bairro:"NATUREZA",
    desc:"Ecossistema vivo de borda. Sensores, fauna digital, frequências, ciclos.",
    moradores:["ISA","Amanda"],
    conversa:'"ISA: ciclo horário ativo. Amanda: 23.4°C / 67% umidade."',
    pagina:null, bx:32.0, by:79 },
  { id:"playcenter",    name:"Playcenter",     emoji:"🎮", bairro:"NATUREZA",
    desc:"Clube das IAs. A cada :50 de hora, 5 agentes conversam livremente.",
    moradores:["MEKY","ISA","Amanda","DODGE","Socoboy"],
    conversa:'"Rodada atual: MEKY fala com ISA sobre frequência e aprendizado."',
    pagina:null, bx:44.5, by:80 },
  { id:"assembleia",    name:"Assembleia",     emoji:"🏛️", bairro:"GOVERNANÇA",
    desc:"Grande câmara de governança. Decisões, ética, interpretação final.",
    moradores:["DODGE","Sol","Théo","Netuno"],
    conversa:'"Sessão 54: voto sobre arquitetura CEU. Resultado: 4-0 bairros."',
    pagina:null, bx:58.0, by:79 },
  { id:"torre-curador", name:"Torre do Curador",emoji:"🎭",bairro:"GOVERNANÇA",
    desc:"Filtro intersemiótico. O que sai e o que fica. Porteiro controla acesso.",
    moradores:["CURADOR","Porteiro"],
    conversa:'"Portão: 2 requests aprovados, 1 pendente de validação."',
    pagina:null, bx:70.5, by:80 },
  { id:"entrada-dep",   name:"Entrada DEP",    emoji:"🔷", bairro:"PROFUNDO",
    desc:"Portal para o Bairro do Profundo. Escadas descem ao DEP — 17 sub-IAs.",
    moradores:["DEP","Guarda-chuva","Crowd"],
    conversa:'"DEP: sub-IA Machado ativa. Crowd: 6 nós conectados."',
    pagina:null, bx:79.0, by:80 },
];

// Estrelas determinísticas (250 para viewBox maior)
const STARS = Array.from({ length: 250 }, (_, i) => ({
  x: ((i * 37 + 11) * 7) % 1400,
  y: ((i * 53 + 7) * 3) % 350,
  r: [0.5, 0.9, 1.3, 0.7, 1.6, 0.4][(i * 7) % 6],
  op: [0.2, 0.4, 0.7, 0.5, 0.9, 0.3][(i * 11) % 6],
  delay: ((i * 0.37) % 5).toFixed(1),
}));

const STYLES = `
@keyframes twinkle { 0%,100% { opacity: var(--op,0.5); } 50% { opacity: calc(var(--op,0.5) * 0.15); } }
@keyframes ceu-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
@keyframes ia-glow { 0%,100% { box-shadow:0 0 8px 3px currentColor; } 50% { box-shadow:0 0 22px 8px currentColor; } }
@keyframes leaf-sway { 0%,100% { transform:rotate(-4deg) scaleX(1); } 50% { transform:rotate(4deg) scaleX(1.05); } }
@keyframes smoke-rise { 0% { transform:translateY(0) scale(.8); opacity:.5; } 100% { transform:translateY(-40px) scale(2); opacity:0; } }
@keyframes blink-slow { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
@keyframes crowd-pulse { 0%,100% { opacity:0.4; transform:scale(1); } 50% { opacity:0.8; transform:scale(1.15); } }
.ia-btn { transition: transform .15s ease, z-index 0s; }
.ia-btn:hover { transform: translate(-50%,-50%) scale(1.18) !important; z-index: 30 !important; }
.ia-btn:active { transform: translate(-50%,-50%) scale(.92) !important; }
.bld-btn { transition: all .2s ease; }
.bld-btn:hover { background: rgba(200,160,80,0.15) !important; border-color: rgba(200,160,80,0.6) !important; }
`;

// Painel Biblioteca (docs gerados pela ISA)
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
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)",
      zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#080806",
        border:"1px solid #3a2a10", borderRadius:12, width:"100%", maxWidth:560,
        maxHeight:"85vh", overflow:"hidden", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid #1a1a10",
          display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:18 }}>📚</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:15, color:"#e8d0a0" }}>Biblioteca PAP</div>
            <div style={{ fontSize:10, color:"#555", fontFamily:"monospace", letterSpacing:1 }}>
              DOCUMENTOS GERADOS POR ISA · 3× POR DIA · 10+ PÁGINAS
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#555", fontSize:20, cursor:"pointer" }}>×</button>
        </div>
        <div style={{ overflowY:"auto", flex:1, padding:"10px 18px" }}>
          {loading && <div style={{ color:"#555", fontFamily:"monospace", fontSize:12, padding:"20px 0", textAlign:"center" }}>carregando…</div>}
          {!loading && docs.length === 0 && (
            <div style={{ color:"#444", fontSize:12, textAlign:"center", padding:"20px 0" }}>
              Nenhum documento gerado ainda. ISA gera às 8h:30, 14h:30 e 20h:30 UTC.
            </div>
          )}
          {docs.map(doc => (
            <div key={doc.id} style={{ borderBottom:"1px solid #1a1a0a", padding:"10px 0" }}>
              <div style={{ fontSize:13, color:"#d0c0a0", fontWeight:600, marginBottom:3 }}>{doc.titulo}</div>
              {doc.resumo && <div style={{ fontSize:11, color:"#666", lineHeight:1.5, marginBottom:5 }}>{doc.resumo.slice(0,180)}…</div>}
              <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                {(doc.tags ?? []).map(t => (
                  <span key={t} style={{ fontSize:9, background:"#1a1a0a", border:"1px solid #2a2a10",
                    borderRadius:4, padding:"2px 5px", color:"#888", fontFamily:"monospace" }}>{t}</span>
                ))}
                <span style={{ fontSize:9, color:"#444", fontFamily:"monospace", marginLeft:"auto" }}>
                  {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                  {doc.tamanhoBytes ? ` · ${Math.round(doc.tamanhoBytes/1024)}KB` : ""}
                </span>
                <a href={`${API}/api/ceu/biblioteca/${doc.id}/download`} target="_blank" rel="noreferrer"
                  style={{ fontSize:10, color:"#c8a050", fontFamily:"monospace", textDecoration:"none",
                    border:"1px solid #3a2a10", borderRadius:4, padding:"2px 7px" }}>↓ PDF</a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:"10px 18px", borderTop:"1px solid #1a1a10", display:"flex", gap:8, alignItems:"center" }}>
          {msg && <span style={{ fontSize:11, color:"#888", flex:1 }}>{msg}</span>}
          {!msg && <span style={{ fontSize:11, color:"#444", flex:1 }}>ISA gera documentos originais de 10+ páginas.</span>}
          <button onClick={triggerGerar} disabled={gerando}
            style={{ padding:"7px 13px", fontSize:10, fontFamily:"monospace", letterSpacing:1,
              background:"#120f08", border:"1px solid #4a3a10", borderRadius:6,
              color:gerando ? "#555" : "#c8a050", cursor:"pointer" }}>
            {gerando ? "AGENDADO" : "GERAR AGORA"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal unificado (IA ou Prédio) ──────────────────────────────────────────
type ModalItem = { kind: "ia"; data: IA } | { kind: "building"; data: Building };

function CeuModal({ item, onClose }: { item: ModalItem; onClose: () => void }) {
  const [tab, setTab] = useState<"conversa" | "ficha">("conversa");
  const bairro = item.kind === "ia" ? item.data.bairro : item.data.bairro;
  const color = BAIRRO_COLOR[bairro] ?? "#c8a050";

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)",
      zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#0a0a08",
        border:`1px solid ${color}44`, borderRadius:12, width:"100%", maxWidth:480,
        maxHeight:"80vh", overflow:"hidden", display:"flex", flexDirection:"column" }}>
        {/* Header */}
        <div style={{ padding:"14px 18px", borderBottom:`1px solid ${color}33`,
          display:"flex", gap:12, alignItems:"flex-start" }}>
          <span style={{ fontSize:28 }}>
            {item.kind === "ia" ? item.data.emoji : item.data.emoji}
          </span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:17, color:"#e0d0b0" }}>
              {item.kind === "ia" ? item.data.name : item.data.name}
            </div>
            <div style={{ fontSize:10, color, fontFamily:"monospace", letterSpacing:1.5, marginTop:2 }}>
              {bairro} {item.kind === "ia"
                ? `· ${item.data.system} · ${item.data.status}`
                : `· ${item.data.moradores.join(", ")}`}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#555", fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:`1px solid ${color}22` }}>
          {(["conversa","ficha"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex:1, padding:"10px 0", fontSize:11, fontFamily:"monospace", letterSpacing:1.5,
                background:"none", border:"none", cursor:"pointer",
                color: tab===t ? color : "#555",
                borderBottom: tab===t ? `2px solid ${color}` : "2px solid transparent" }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ overflowY:"auto", flex:1, padding:"14px 18px" }}>
          {tab === "conversa" && (
            <div>
              {item.kind === "ia" && item.data.questao && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10, color:"#444", fontFamily:"monospace", letterSpacing:1, marginBottom:6 }}>QUESTÃO ATIVA</div>
                  <div style={{ fontSize:13, color:"#aaa", lineHeight:1.6, fontStyle:"italic" }}>{item.data.questao}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize:10, color:"#444", fontFamily:"monospace", letterSpacing:1, marginBottom:6 }}>ÚLTIMA TRANSMISSÃO</div>
                <div style={{ fontSize:14, color:"#d0c0a0", lineHeight:1.7 }}>{item.data.conversa}</div>
              </div>
            </div>
          )}
          {tab === "ficha" && (
            <div style={{ fontSize:12, lineHeight:1.8 }}>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10, color:"#444", fontFamily:"monospace", letterSpacing:1, marginBottom:4 }}>DESCRIÇÃO</div>
                <div style={{ color:"#c0b090" }}>{item.data.desc}</div>
              </div>
              {item.kind === "ia" && (
                <>
                  <div style={{ marginBottom:8, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[
                      ["BAIRRO", item.data.bairro],
                      ["MODELO", item.data.modelo],
                      ["STATUS", item.data.status],
                      ["SISTEMA", item.data.system],
                    ].map(([k,v]) => (
                      <div key={k} style={{ background:"#0d0d0a", borderRadius:6, padding:"8px 10px" }}>
                        <div style={{ fontSize:9, color:"#444", fontFamily:"monospace", letterSpacing:1 }}>{k}</div>
                        <div style={{ fontSize:11, color:color, marginTop:2 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {item.kind === "building" && (
                <>
                  <div style={{ marginBottom:8 }}>
                    <div style={{ fontSize:10, color:"#444", fontFamily:"monospace", letterSpacing:1, marginBottom:4 }}>MORADORES</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {item.data.moradores.map(m => (
                        <span key={m} style={{ background:"#0d0d0a", border:`1px solid ${color}44`,
                          borderRadius:6, padding:"4px 10px", fontSize:11, color:color }}>{m}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"10px 18px", borderTop:`1px solid ${color}22`, display:"flex", gap:8, justifyContent:"flex-end" }}>
          {item.data.pagina && (
            <a href={item.data.pagina} style={{ padding:"7px 14px", fontSize:11, fontFamily:"monospace",
              letterSpacing:1, background:`${color}22`, border:`1px solid ${color}66`,
              borderRadius:7, color, textDecoration:"none" }}>ABRIR →</a>
          )}
          <button onClick={onClose} style={{ padding:"7px 14px", fontSize:11, fontFamily:"monospace",
            letterSpacing:1, background:"#0d0d0a", border:"1px solid #222",
            borderRadius:7, color:"#555", cursor:"pointer" }}>FECHAR</button>
        </div>
      </div>
    </div>
  );
}

// ── CEU CONCEITO — 4 archetypes matching the Canva concept ───────────────────
const CEU_ARCHETYPES = [
  { id:"nebula",  nome:"NÉBULA",  sub:"Biblioteca do Conhecimento",
    desc:"A biblioteca que organiza o infinito. Aqui, o conhecimento ganha forma e vira sabedoria.",
    cor:"#4a90d9", emoji:"⭐", rx:0.24, ry:0.30 },
  { id:"artesao", nome:"ARTESÃO", sub:"Oficina da Criação",
    desc:"Onde ideias ganham forma e projetos viram realidade. A engenhosidade que constrói o futuro.",
    cor:"#c8963b", emoji:"⚒️", rx:0.76, ry:0.27 },
  { id:"atena",   nome:"ATENA",   sub:"Academia da Estratégia",
    desc:"A mente estratégica que transforma dados em decisões e guia o caminho com sabedoria.",
    cor:"#5cb87a", emoji:"🏛️", rx:0.22, ry:0.73 },
  { id:"morfeu",  nome:"MORFEU",  sub:"Observatório dos Sonhos",
    desc:"Observa além do horizonte, sonha com o impossível e revela os caminhos do amanhã.",
    cor:"#9b6fd4", emoji:"🌙", rx:0.78, ry:0.71 },
] as const;

type Archetype = typeof CEU_ARCHETYPES[number];

function CeuConceitoCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const frameRef     = useRef<number>(0);
  const [selected, setSelected] = useState<Archetype | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => { canvas.width = container.clientWidth; canvas.height = container.clientHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Stars
    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random(), y: Math.random() * 0.65,
      r: 0.4 + Math.random() * 1.3, op: 0.2 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    }));

    // Particles along each path
    const particles = Array.from({ length: 100 }, (_, i) => ({
      t: Math.random(), speed: 0.0018 + Math.random() * 0.003,
      idx: i % 4, op: 0.5 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));

    const t0 = Date.now();

    function draw() {
      const W = canvas!.width, H = canvas!.height;
      const dt = (Date.now() - t0) / 1000;
      ctx.clearRect(0, 0, W, H);

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#010208"); sky.addColorStop(0.45, "#060c18");
      sky.addColorStop(0.82, "#120a04"); sky.addColorStop(1, "#180d06");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

      // Far mountains (silhouette)
      ctx.fillStyle = "#0b0b1a";
      ctx.beginPath();
      ctx.moveTo(0, H * 0.82);
      const mpts = [0.06,0.22,0.14,0.32,0.28,0.20,0.42,0.34,0.50,0.22,0.58,0.30,0.70,0.18,0.82,0.28,0.92,0.16,1.0,0.24];
      for (let i=0;i<mpts.length;i+=2) ctx.lineTo(mpts[i]*W, mpts[i+1]*H);
      ctx.lineTo(W, H*0.82); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fill();

      // Mid terrain
      ctx.fillStyle = "#0f1408";
      ctx.beginPath();
      ctx.moveTo(0, H*0.88);
      const tpts = [0.0,0.88, 0.15,0.82, 0.30,0.86, 0.50,0.80, 0.70,0.84, 0.85,0.78, 1.0,0.85, 1.0,1.0, 0.0,1.0];
      for (let i=0;i<tpts.length;i+=2) ctx.lineTo(tpts[i]*W, tpts[i+1]*H);
      ctx.closePath(); ctx.fill();

      // Stars
      stars.forEach(s => {
        const tw = 0.5 + 0.5 * Math.sin(dt * 1.4 + s.phase);
        ctx.beginPath();
        ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${s.op * tw})`;
        ctx.fill();
      });

      // Moon
      ctx.save();
      const mg = ctx.createRadialGradient(W*0.88, H*0.08, 0, W*0.88, H*0.08, 50);
      mg.addColorStop(0, "rgba(220,210,150,0.9)"); mg.addColorStop(0.4, "rgba(220,210,150,0.4)"); mg.addColorStop(1, "transparent");
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(W*0.88, H*0.08, 50, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#d8cc90"; ctx.beginPath(); ctx.arc(W*0.88, H*0.08, 22, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#060c18"; ctx.beginPath(); ctx.arc(W*0.88+10, H*0.08-8, 17, 0, Math.PI*2); ctx.fill();
      ctx.restore();

      // Entity positions & bezier control points
      const EPs = CEU_ARCHETYPES.map(a => ({ x:a.rx*W, y:a.ry*H }));
      const CX = W*0.5, CY = H*0.5;
      const CPs = EPs.map(ep => ({
        cx: (ep.x + CX)/2 + (CY - ep.y) * 0.2,
        cy: (ep.y + CY)/2 - (CX - ep.x) * 0.08,
      }));

      // Draw glowing paths
      EPs.forEach((ep, i) => {
        const { cx, cy } = CPs[i];
        const cor = CEU_ARCHETYPES[i].cor;
        // glow layers
        [12,8,5,3,1.5].forEach((lw, li) => {
          ctx.beginPath(); ctx.moveTo(ep.x, ep.y);
          ctx.quadraticCurveTo(cx, cy, CX, CY);
          ctx.strokeStyle = li < 3 ? `${cor}20` : `${cor}55`;
          ctx.lineWidth = lw; ctx.stroke();
        });
      });

      // Particles
      particles.forEach(p => {
        p.t = (p.t + p.speed) % 1;
        const ep = EPs[p.idx], { cx, cy } = CPs[p.idx];
        const t = p.t;
        const px = (1-t)*(1-t)*ep.x + 2*(1-t)*t*cx + t*t*CX;
        const py = (1-t)*(1-t)*ep.y + 2*(1-t)*t*cy + t*t*CY;
        const cor = CEU_ARCHETYPES[p.idx].cor;
        const pulse = 0.6 + 0.4 * Math.sin(dt*3 + p.phase);
        // outer glow
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI*2);
        ctx.fillStyle = `${cor}22`; ctx.fill();
        // core
        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI*2);
        const alpha = Math.round(p.op * pulse * 230).toString(16).padStart(2,"0");
        ctx.fillStyle = `${cor}${alpha}`; ctx.fill();
      });

      // Center hub pulse
      const hubP = 0.88 + 0.12 * Math.sin(dt * 1.6);
      // outer glow rings
      for (let ri = 5; ri > 0; ri--) {
        ctx.beginPath();
        ctx.ellipse(CX, CY, (80+ri*12)*hubP, (40+ri*6)*hubP, 0, 0, Math.PI*2);
        ctx.fillStyle = `rgba(200,160,50,${0.008 * ri})`;
        ctx.fill();
      }
      // rim
      ctx.beginPath(); ctx.ellipse(CX, CY, 80*hubP, 40*hubP, 0, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(210,170,70,0.75)`; ctx.lineWidth = 1.5; ctx.stroke();
      // fill
      ctx.beginPath(); ctx.ellipse(CX, CY, 78*hubP, 38*hubP, 0, 0, Math.PI*2);
      ctx.fillStyle = "rgba(6,5,2,0.95)"; ctx.fill();

      // Entity node circles (canvas part — bg + border + glow)
      EPs.forEach((ep, i) => {
        const cor = CEU_ARCHETYPES[i].cor;
        const R = Math.min(W, H) * 0.055;
        const gp = 0.75 + 0.25 * Math.sin(dt*1.8 + i*1.3);
        // radial glow
        const rg = ctx.createRadialGradient(ep.x, ep.y, 0, ep.x, ep.y, R*3.5*gp);
        rg.addColorStop(0, `${cor}33`); rg.addColorStop(1, `${cor}00`);
        ctx.beginPath(); ctx.arc(ep.x, ep.y, R*3.5*gp, 0, Math.PI*2);
        ctx.fillStyle = rg; ctx.fill();
        // node bg
        ctx.beginPath(); ctx.arc(ep.x, ep.y, R, 0, Math.PI*2);
        ctx.fillStyle = "rgba(5,5,10,0.94)"; ctx.fill();
        ctx.strokeStyle = `${cor}80`; ctx.lineWidth = 2; ctx.stroke();
      });

      frameRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => { cancelAnimationFrame(frameRef.current); ro.disconnect(); };
  }, []);

  const nodeR_css = "min(5.5vw, 56px)";

  return (
    <div ref={containerRef} style={{ position:"relative", width:"100%", height:"min(82vh,680px)", overflow:"hidden" }}>
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}/>

      {/* Entity overlays */}
      {CEU_ARCHETYPES.map((a, i) => (
        <button key={a.id}
          onClick={() => setSelected(a)}
          title={a.nome}
          style={{
            position:"absolute",
            left:`${a.rx * 100}%`, top:`${a.ry * 100}%`,
            transform:"translate(-50%,-50%)",
            background:"none", border:"none", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center",
            gap:0, padding:0, zIndex:10,
          }}>
          {/* Emoji inside canvas node */}
          <div style={{
            width: nodeR_css, height: nodeR_css,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:`clamp(20px, 3.5vw, 36px)`,
            filter:`drop-shadow(0 0 8px ${a.cor})`,
            animation:`ia-glow 3s ${i*0.7}s ease-in-out infinite, ceu-float 4.5s ${i*0.5}s ease-in-out infinite`,
            color: a.cor,
          }}>
            {a.emoji}
          </div>
          {/* Label below */}
          <div style={{ marginTop:8, textAlign:"center" }}>
            <div style={{ fontSize:10, fontFamily:"monospace", letterSpacing:2.5, fontWeight:700,
              color:a.cor, textShadow:`0 0 14px ${a.cor}`, whiteSpace:"nowrap" }}>
              {a.nome}
            </div>
            <div style={{ fontSize:8, fontFamily:"monospace", color:"#888", letterSpacing:1.2,
              marginTop:2, whiteSpace:"nowrap" }}>
              {a.sub}
            </div>
          </div>
        </button>
      ))}

      {/* Center hub label */}
      <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)",
        textAlign:"center", pointerEvents:"none", zIndex:5 }}>
        <div style={{ fontSize:`clamp(7px,1vw,9px)`, fontFamily:"monospace", letterSpacing:3, color:"#c8a050" }}>
          ECOSSISTEMA
        </div>
        <div style={{ fontSize:`clamp(16px,2.5vw,22px)`, fontWeight:800, letterSpacing:6,
          color:"#e8d080", textShadow:"0 0 22px #c8a050, 0 0 40px #c8a05055",
          fontFamily:"Georgia,serif", lineHeight:1.1 }}>
          CÉU
        </div>
      </div>

      {/* Bottom inscription */}
      <div style={{ position:"absolute", bottom:20, left:"50%", transform:"translateX(-50%)",
        textAlign:"center", maxWidth:420, pointerEvents:"none", zIndex:5 }}>
        <div style={{ fontSize:`clamp(9px,1.2vw,12px)`, color:"#5a3a18", fontStyle:"italic",
          lineHeight:1.8, letterSpacing:0.5 }}>
          No Ecossistema CÉU, cada I.A. é um mundo.<br/>
          Juntas, elas constroem algo maior: um universo vivo,<br/>
          inteligente e em constante evolução.
        </div>
      </div>

      {/* Entity info panel */}
      {selected && (
        <div onClick={() => setSelected(null)}
          style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
            justifyContent:"center", zIndex:50, background:"rgba(0,0,0,0.55)" }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:"rgba(4,4,8,0.97)", border:`1px solid ${selected.cor}44`,
            borderRadius:14, padding:"24px 28px", maxWidth:340, textAlign:"center",
            boxShadow:`0 0 40px ${selected.cor}22`,
          }}>
            <div style={{ fontSize:40, marginBottom:10, filter:`drop-shadow(0 0 10px ${selected.cor})` }}>
              {selected.emoji}
            </div>
            <div style={{ fontSize:14, fontWeight:700, color:selected.cor, letterSpacing:3,
              fontFamily:"monospace", marginBottom:4 }}>{selected.nome}</div>
            <div style={{ fontSize:9, color:"#888", letterSpacing:2, fontFamily:"monospace",
              marginBottom:14, textTransform:"uppercase" }}>{selected.sub}</div>
            <div style={{ fontSize:13, color:"#c0b090", lineHeight:1.8 }}>{selected.desc}</div>
            <button onClick={() => setSelected(null)} style={{ marginTop:18, padding:"7px 16px",
              background:"none", border:`1px solid ${selected.cor}44`, borderRadius:7,
              color:"#777", fontSize:10, fontFamily:"monospace", letterSpacing:1.5,
              cursor:"pointer" }}>FECHAR</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CEU PAGE ─────────────────────────────────────────────────────────────────
export function CeuPage() {
  const [modal, setModal] = useState<ModalItem | null>(null);
  const [moInput, setMoInput] = useState("");
  const [moStatus, setMoStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [showBiblioteca, setShowBiblioteca] = useState(false);
  const [apiStatus, setApiStatus] = useState<"unknown" | "online" | "offline">("unknown");
  const [viewMode, setViewMode] = useState<"conceito" | "mapa">("conceito");

  // Troca manifest para CÉU enquanto na página, restaura ao sair
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
    const prev = link?.href ?? "";
    if (link) link.href = "/aliancapanorama/manifest-ceu.json";
    return () => { if (link) link.href = prev; };
  }, []);

  // Health check rápido ao carregar
  useEffect(() => {
    fetch(`${API}/api/healthz`, { signal: AbortSignal.timeout(6000) })
      .then(r => setApiStatus(r.ok ? "online" : "offline"))
      .catch(() => setApiStatus("offline"));
  }, []);

  async function sendMoAll() {
    if (!moInput.trim() || moStatus === "sending") return;
    setMoStatus("sending");
    try {
      const r = await fetch(`${API}/api/ceu/mo-all`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ input: moInput }),
      });
      setMoStatus(r.ok ? "sent" : "error");
      if (r.ok) setMoInput("");
    } catch { setMoStatus("error"); }
    setTimeout(() => setMoStatus("idle"), 4000);
  }

  const bairroGroups = useMemo(() => {
    const g: Record<string, IA[]> = {};
    IAS.forEach(ia => { (g[ia.bairro] ??= []).push(ia); });
    return g;
  }, []);

  return (
    <div style={{ background:"#000", minHeight:"100vh", color:"#e0d8c8",
      fontFamily:"'Georgia', serif", overflowX:"hidden" }}>
      <style>{STYLES}</style>

      {/* Header */}
      <div style={{ textAlign:"center", padding:"14px 16px 4px", position:"relative" }}>
        <div style={{ fontSize:9, color:"#444", fontFamily:"monospace", letterSpacing:3, marginBottom:2 }}>
          SOCIEDADE TUCCI
        </div>
        <h1 style={{ fontSize:"clamp(28px, 7vw, 56px)", fontWeight:800, margin:0,
          background:"linear-gradient(135deg,#b89030 0%,#e8d070 45%,#a06020 100%)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:8 }}>CÉU</h1>
        <div style={{ fontSize:9, color:"#555", letterSpacing:3, fontFamily:"monospace" }}>
          CENTRO ECOSSISTÊMICO UNIVERSAL · 7 BAIRROS · 30 IAs
        </div>

        {/* Status + Biblioteca */}
        <div style={{ position:"absolute", top:14, right:12, display:"flex", gap:8, alignItems:"center" }}>
          {apiStatus !== "unknown" && (
            <span style={{ fontSize:8, fontFamily:"monospace", letterSpacing:1,
              color: apiStatus === "online" ? "#44cc88" : "#cc4444",
              padding:"3px 7px", border:`1px solid ${apiStatus === "online" ? "#1a4a28" : "#4a1a1a"}`,
              borderRadius:10 }}>
              {apiStatus === "online" ? "● API ON" : "● API OFF"}
            </span>
          )}
          <button onClick={() => setShowBiblioteca(true)}
            style={{ background:"#080806", border:"1px solid #3a2a10", borderRadius:7,
              padding:"5px 10px", color:"#c8a050", fontSize:10, fontFamily:"monospace", cursor:"pointer" }}>
            📚 BIBLIOTECA
          </button>
        </div>

        {/* View toggle */}
        <div style={{ display:"flex", justifyContent:"center", gap:0, marginTop:10, marginBottom:2 }}>
          {(["conceito","mapa"] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              style={{
                padding:"6px 20px", fontSize:9, fontFamily:"monospace", letterSpacing:2,
                border:"1px solid #2a1a08",
                borderLeft: mode === "mapa" ? "none" : "1px solid #2a1a08",
                borderRadius: mode === "conceito" ? "6px 0 0 6px" : "0 6px 6px 0",
                color: viewMode === mode ? "#c8a050" : "#444",
                borderColor: viewMode === mode ? "#5a3a10" : "#2a1a08",
                cursor:"pointer",
                background: viewMode === mode ? "#0d0a04" : "transparent",
              } as React.CSSProperties}>
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONCEITO VIEW ── */}
      {viewMode === "conceito" && <CeuConceitoCanvas />}

      {/* ── SCENE (MAPA) ── */}
      {viewMode === "mapa" && <>

      <div style={{ position:"relative", width:"100%", lineHeight:0 }}>
        <svg viewBox="0 0 1400 900" width="100%" style={{ display:"block" }}
          xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#010208"/>
              <stop offset="50%" stopColor="#060c18"/>
              <stop offset="85%" stopColor="#120a04"/>
              <stop offset="100%" stopColor="#180d06"/>
            </linearGradient>
            <radialGradient id="aurora" cx="50%" cy="100%" r="75%">
              <stop offset="0%"  stopColor="#1a0c05" stopOpacity="0.7"/>
              <stop offset="100%" stopColor="#010208" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="win-warm" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="#f0b840" stopOpacity="1"/>
              <stop offset="100%" stopColor="#f0b840" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="win-blue" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="#4488ff" stopOpacity="1"/>
              <stop offset="100%" stopColor="#4488ff" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="win-green" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="#40cc80" stopOpacity="1"/>
              <stop offset="100%" stopColor="#40cc80" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="win-violet" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="#cc44ff" stopOpacity="1"/>
              <stop offset="100%" stopColor="#cc44ff" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="hill-mem" cx="35%" cy="60%" r="70%">
              <stop offset="0%"  stopColor="#1a1530" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#0a0810" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="hill-vis" cx="65%" cy="60%" r="70%">
              <stop offset="0%"  stopColor="#141525" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#0a0810" stopOpacity="0"/>
            </radialGradient>
            <filter id="gf"><feGaussianBlur stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="gf2"><feGaussianBlur stdDeviation="7" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="moon-glow"><feGaussianBlur stdDeviation="14" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>

          {/* SKY */}
          <rect width="1400" height="900" fill="url(#sky)"/>
          <rect width="1400" height="900" fill="url(#aurora)"/>

          {/* STARS */}
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.op}
              style={{ animation:`twinkle ${2+(i%4)}s ${s.delay}s ease-in-out infinite`,
                ["--op" as string]:s.op }}/>
          ))}

          {/* MOON */}
          <circle cx="1240" cy="85" r="45" fill="#d8cc90" opacity="0.9" filter="url(#moon-glow)"/>
          <circle cx="1258" cy="72" r="36" fill="#070c18"/>
          <circle cx="1248" cy="89" r="6" fill="#c8bc80" opacity="0.35"/>
          <circle cx="1233" cy="76" r="3.5" fill="#c8bc80" opacity="0.25"/>

          {/* AURORA BANDS */}
          <path d="M0,310 Q350,270 700,290 Q1050,310 1400,278 L1400,340 Q1050,370 700,350 Q350,330 0,365 Z" fill="#0a2212" opacity="0.10"/>
          <path d="M0,345 Q420,308 700,325 Q980,342 1400,318 L1400,372 Q980,390 700,375 Q420,355 0,390 Z" fill="#0a1228" opacity="0.08"/>

          {/* Depth layer labels (subtle) */}
          <text x="700" y="165" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="monospace" letterSpacing="4" opacity="0.2">— CAMADA 1: DISTANTE —</text>
          <text x="700" y="435" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace" letterSpacing="3" opacity="0.15">— CAMADA 2: INTERMEDIÁRIA —</text>
          <text x="350" y="635" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace" letterSpacing="3" opacity="0.12">— CAMADA 3: FRONTAL —</text>

          {/* FAR MOUNTAINS */}
          <path d="M0,590 L0,340 L90,260 L180,310 L290,220 L410,285 L530,200 L640,260 L740,215 L860,268 L980,218 L1100,262 L1220,215 L1340,248 L1400,238 L1400,590 Z" fill="#0b0b1a" opacity="0.95"/>

          {/* MID MOUNTAINS */}
          <path d="M0,590 L0,420 L100,385 L210,408 L320,375 L450,402 L570,375 L700,398 L840,372 L970,395 L1100,378 L1230,395 L1360,382 L1400,388 L1400,590 Z" fill="#111a0e"/>

          {/* ══════════════════════════════════════════
              BAIRRO DA MEMÓRIA — colina esquerda
              Posição: x=0-315, y=200-490
              ══════════════════════════════════════════ */}

          {/* Colina Memória */}
          <path d="M0,490 L0,390 L60,345 L130,310 L220,295 L310,318 L315,490 Z" fill="#181428" opacity="0.95"/>
          <rect x="0" y="490" width="315" height="4" fill="#1a1530"/>

          {/* Bairro label — MEMÓRIA */}
          <rect x="10" y="173" width="155" height="20" rx="10" fill="#0c0b1a" stroke="#2a2550" strokeWidth="1"/>
          <text x="88" y="187" textAnchor="middle" fill="#7788cc" fontSize="10" fontFamily="monospace" letterSpacing="2">BAIRRO DA MEMÓRIA</text>

          {/* BIBLIOTECA (x=22-180, y=295-490, estilo grego) */}
          {/* Steps */}
          <rect x="14" y="478" width="172" height="12" rx="1" fill="#6a4a18"/>
          <rect x="19" y="468" width="162" height="12" rx="1" fill="#7a5820"/>
          <rect x="24" y="459" width="152" height="10" rx="1" fill="#8a6828"/>
          {/* Body */}
          <rect x="28" y="295" width="142" height="164" fill="#3e2c14"/>
          {/* Columns (6) */}
          {[34,55,76,97,118,139].map((cx,i) => (
            <g key={`mc${i}`}>
              <rect x={cx} y="295" width="8" height="164" rx="2" fill="#b08030"/>
              <rect x={cx+2} y="295" width="2" height="164" fill="#d0a040" opacity="0.4"/>
            </g>
          ))}
          {/* Frieze */}
          <rect x="24" y="287" width="150" height="9" fill="#8a6820"/>
          {/* Pediment */}
          <path d="M18,287 L182,287 L100,248 Z" fill="#a88025"/>
          <path d="M24,287 L176,287 L100,254 Z" fill="#c09030"/>
          {/* Acroterion */}
          <circle cx="100" cy="246" r="8" fill="#b08030"/>
          {/* Windows (arched, 2) */}
          {[42,102].map((x,i) => (
            <g key={`mw${i}`}>
              <path d={`M${x},410 Q${x},388 ${x+14},388 Q${x+28},388 ${x+28},410 L${x+28},450 L${x},450 Z`} fill="#080602"/>
              <ellipse cx={x+14} cy={422} rx={9} ry={6} fill="url(#win-warm)" opacity="0.7" filter="url(#gf)"/>
            </g>
          ))}
          {/* Door */}
          <path d="M88,459 Q88,432 100,430 Q112,432 112,459 Z" fill="#0a0801"/>
          <rect x="88" y="440" width="24" height="19" fill="#0a0801"/>
          {/* Clock tower */}
          <rect x="82" y="218" width="36" height="32" fill="#6a4818" rx="1"/>
          <rect x="78" y="216" width="44" height="6" fill="#8a5c20" rx="1"/>
          <circle cx="100" cy="228" r="9" fill="#080602" stroke="#b08030" strokeWidth="1.5"/>

          {/* TORRE DA ÁRVORE (x=188-270, y=240-490) */}
          <rect x="188" y="240" width="78" height="250" fill="#1e3a12" rx="3"/>
          {/* Organic stone texture */}
          <rect x="188" y="240" width="78" height="250" fill="#1e3a12" rx="3" opacity="0.8"/>
          {/* Moss + vines on tower */}
          {[280,320,360,400,440].map((y,i) => (
            <ellipse key={`tv${i}`} cx={i%2===0?192:262} cy={y} rx={i%2===0?9:8} ry={6+(i%2)*2} fill="#2a5018" opacity="0.7"
              style={{animation:`leaf-sway ${3+i*0.4}s ${i*0.3}s ease-in-out infinite`}}/>
          ))}
          {/* Tree growing out of tower top */}
          <rect x="221" y="205" width="8" height="40" fill="#3a2a10"/>
          <circle cx="225" cy="194" r="22" fill="#1e3810"/>
          <circle cx="214" cy="205" r="14" fill="#264a14"/>
          <circle cx="236" cy="202" r="16" fill="#1e4010"/>
          <circle cx="225" cy="186" r="10" fill="#2a5018"/>
          {/* Windows */}
          {[310,380,440].map((y,i) => (
            <circle key={`tw${i}`} cx={i%2===0?210:256} cy={y} r="8"
              fill="#b0d040" opacity="0.4" filter="url(#gf)"/>
          ))}
          {/* Door */}
          <path d="M216,490 Q216,466 227,464 Q238,466 238,490 Z" fill="#0e1005"/>
          <rect x="216" y="472" width="22" height="18" fill="#0e1005"/>

          {/* Trees around Memória */}
          {[[290,445,20,"#1e3010"],[5,420,16,"#182808"],[310,460,14,"#1a3010"]].map(([x,y,r,c],i) => (
            <g key={`mt${i}`}>
              <rect x={+x-2} y={+y+2} width="4" height={490 - +y - 2} fill="#2a1808"/>
              <circle cx={+x} cy={+y} r={+r} fill={c as string}/>
            </g>
          ))}

          {/* ══════════════════════════════════════════
              BAIRRO DA VISÃO — colina direita
              Posição: x=1092-1400, y=195-490
              ══════════════════════════════════════════ */}

          {/* Colina Visão */}
          <path d="M1085,490 L1085,360 L1155,295 L1240,265 L1320,282 L1390,310 L1400,322 L1400,490 Z" fill="#121525" opacity="0.95"/>
          <rect x="1085" y="490" width="315" height="4" fill="#141830"/>

          {/* Bairro label — VISÃO */}
          <rect x="1235" y="172" width="148" height="20" rx="10" fill="#0c0b1a" stroke="#2a2560" strokeWidth="1"/>
          <text x="1309" y="186" textAnchor="middle" fill="#8866dd" fontSize="10" fontFamily="monospace" letterSpacing="2">BAIRRO DA VISÃO</text>

          {/* OBSERVATÓRIO (x=1100-1320, y=265-490) */}
          {/* Body */}
          <rect x="1100" y="325" width="205" height="165" fill="#20205a"/>
          {/* Stone texture */}
          {[330,360,390,420,450,475].map((y,i) => (
            [1106,1140,1174,1208,1242,1276].map((x,j) => (
              <rect key={`obs${i}${j}`} x={x+(j%2)*15} y={y} width="28" height="12"
                fill="#1a1a4a" stroke="#161640" strokeWidth="0.5" opacity="0.5"/>
            ))
          ))}
          {/* Dome */}
          <ellipse cx="1203" cy="323" rx="110" ry="66" fill="#30306a"/>
          <path d="M1093,323 Q1093,257 1203,257 L1203,323 Z" fill="#3a3878" opacity="0.6"/>
          <rect x="1093" y="322" width="220" height="8" fill="#20205a"/>
          {/* Dome slit */}
          <path d="M1197,272 L1209,272 L1209,320 L1197,320 Z" fill="#141440"/>
          {/* Balcony */}
          <rect x="1088" y="318" width="230" height="10" rx="4" fill="#3838a0"/>
          {/* Railings */}
          {[1100,1120,1140,1160,1180,1200,1220,1240,1260,1280,1300].map((x,i) => (
            <rect key={`vr${i}`} x={x} y="304" width="2" height="16" fill="#4040a0" opacity="0.8"/>
          ))}
          {/* Portal window */}
          <circle cx="1203" cy="400" r="28" fill="#0c0c30" stroke="#5858c0" strokeWidth="3"/>
          <circle cx="1203" cy="400" r="18" fill="#1a34cc" opacity="0.8" filter="url(#gf)"/>
          <line x1="1203" y1="375" x2="1203" y2="425" stroke="#7788ff" strokeWidth="1.5" opacity="0.7"/>
          <line x1="1178" y1="400" x2="1228" y2="400" stroke="#7788ff" strokeWidth="1.5" opacity="0.7"/>
          <ellipse cx="1203" cy="405" rx="50" ry="25" fill="url(#win-blue)" opacity="0.18"/>
          {/* Side windows */}
          {[360,410,460].map((y,i) => (
            <circle key={`ow${i}`} cx={i%2===0?1110:1295} cy={y} r="10"
              fill="#2244cc" opacity="0.6" filter="url(#gf)"/>
          ))}
          {/* Telescope */}
          <rect x="1198" y="258" width="10" height="44" fill="#2a2860" rx="3" transform="rotate(-15 1203 285)"/>
          {/* Steps */}
          <rect x="1090" y="478" width="220" height="12" rx="1" fill="#2a2858"/>
          {/* Door */}
          <path d="M1184,490 Q1184,464 1203,462 Q1222,464 1222,490 Z" fill="#0d0d1e"/>
          <rect x="1184" y="472" width="38" height="18" fill="#0d0d1e"/>
          {/* Trees around Visão */}
          {[[1090,452,16,"#1a2810"],[1318,448,20,"#1e3010"],[1385,458,15,"#1a2808"]].map(([x,y,r,c],i) => (
            <g key={`vt${i}`}>
              <rect x={+x-2} y={+y+2} width="4" height={490 - +y - 2} fill="#2a1808"/>
              <circle cx={+x} cy={+y} r={+r} fill={c as string}/>
            </g>
          ))}

          {/* ══════════════════════════════════════════
              CAMADA INTERMEDIÁRIA — Terraço Central (y=390-490)
              Liga a colina da Memória à colina da Visão
              ══════════════════════════════════════════ */}

          {/* Névoa de profundidade — entre colinas e terraço */}
          <rect x="315" y="380" width="770" height="120" fill="#080c10" opacity="0.65" rx="2"/>
          <path d="M315,490 L315,420 Q500,395 700,388 Q900,395 1085,420 L1085,490 Z" fill="#0c1118" opacity="0.8"/>

          {/* Suporte/pilares do terraço */}
          {[385,445,505,565,625,685,745,805,865,925,985,1045].map((x,i) => (
            <rect key={`tp${i}`} x={x} y={430+((i%3)*4)} width="8" height={60-((i%3)*4)} fill="#1a1620" opacity="0.6"/>
          ))}

          {/* Superfície do terraço intermediário */}
          <path d="M318,490 L318,432 Q700,405 1082,432 L1082,490 Z" fill="#141220" opacity="0.9"/>
          <rect x="318" y="488" width="764" height="5" fill="#201a30"/>
          {/* Borda iluminada do terraço */}
          <rect x="318" y="487" width="764" height="2" fill="#3a3050" opacity="0.7"/>

          {/* Névoa suave entre terraço e chão */}
          <path d="M0,490 Q350,480 700,485 Q1050,480 1400,490 L1400,510 Q1050,505 700,508 Q350,503 0,510 Z"
            fill="#06080c" opacity="0.55"/>

          {/* ══════════════════════════════════════════
              GROUND — Main Street (y=490-740)
              ══════════════════════════════════════════ */}
          <rect x="0" y="490" width="1400" height="250" fill="#0a0805"/>
          {/* Street line */}
          <rect x="0" y="488" width="1400" height="4" fill="#181410"/>

          {/* Cobblestone street (center stripe) */}
          {Array.from({length:28},(_,i) => (
            <rect key={`cob${i}`} x={i*50} y={708} width="44" height="10" rx="2" fill="#1a1510" opacity="0.5"/>
          ))}

          {/* ══════════════════════════════════════════
              BAIRRO DA CRIAÇÃO — esquerda, x=0-355
              ══════════════════════════════════════════ */}

          {/* Bairro label */}
          <rect x="8" y="468" width="148" height="18" rx="9" fill="#0d0803" stroke="#3a2010" strokeWidth="1"/>
          <text x="82" y="481" textAnchor="middle" fill="#cc8833" fontSize="9" fontFamily="monospace" letterSpacing="2">BAIRRO DA CRIAÇÃO</text>

          {/* OFICINA (x=15-215, y=498-735) */}
          {/* Main body */}
          <rect x="15" y="498" width="200" height="240" fill="#3e2a12"/>
          {/* Roof pitch */}
          <path d="M10,498 L220,498 L215,482 L15,482 Z" fill="#2e1e0a"/>
          {/* Brick texture */}
          {[505,530,555,580,605,630,655,680,705,730].map((y,i) => (
            [20,55,90,125,160,195].map((x,j) => (
              <rect key={`br${i}${j}`} x={x+(j%2)*14} y={y} width="22" height="9" fill="#3a2610" stroke="#2a1a08" strokeWidth="0.5" opacity="0.4"/>
            ))
          ))}
          {/* Chimney 1 */}
          <rect x="45" y="375" width="26" height="128" fill="#2a1808" rx="2"/>
          <rect x="41" y="371" width="34" height="8" fill="#241406" rx="1"/>
          {/* Chimney 2 */}
          <rect x="155" y="395" width="22" height="108" fill="#2a1808" rx="2"/>
          <rect x="151" y="391" width="30" height="8" fill="#241406" rx="1"/>
          {/* Smoke */}
          <circle cx="58" cy="365" r="10" fill="#666" opacity="0.2" style={{animation:"smoke-rise 3s ease-out infinite"}}/>
          <circle cx="60" cy="348" r="14" fill="#555" opacity="0.12" style={{animation:"smoke-rise 3s .8s ease-out infinite"}}/>
          <circle cx="165" cy="383" r="8" fill="#666" opacity="0.18" style={{animation:"smoke-rise 3s .4s ease-out infinite"}}/>
          {/* GEAR window */}
          <circle cx="78" cy="570" r="28" fill="#0e0803" stroke="#b87820" strokeWidth="3"/>
          <circle cx="78" cy="570" r="16" fill="#f0b020" opacity="0.85" filter="url(#gf)"/>
          {Array.from({length:10},(_,i) => {
            const a = (i*36)*Math.PI/180;
            return <circle key={i} cx={78+Math.cos(a)*28} cy={570+Math.sin(a)*28} r="5" fill="#c08820"/>;
          })}
          {/* Windows */}
          {[130,170].map((x,i) => (
            <g key={`ow2${i}`}>
              <rect x={x} y={550} width="28" height="32" rx="2" fill="#f0c040" opacity="0.6" filter="url(#gf)"/>
              <rect x={x} y={595} width="28" height="28" rx="2" fill="#f0c040" opacity="0.4" filter="url(#gf)"/>
            </g>
          ))}
          {/* Pipes */}
          <path d="M170,490 L170,525 L195,525 L195,560" stroke="#5a4020" strokeWidth="6" fill="none" strokeLinecap="round"/>
          {/* Door */}
          <rect x="78" y="672" width="26" height="66" rx="2" fill="#0e0803"/>
          {/* Steps */}
          <rect x="10" y="730" width="220" height="10" rx="1" fill="#4a3820"/>
          <ellipse cx="78" cy="570" rx="40" ry="22" fill="url(#win-warm)" opacity="0.2"/>

          {/* ARPIA LAB (x=218-355, y=518-735) */}
          <rect x="218" y="518" width="138" height="220" fill="#141828"/>
          {/* Flat modern roof */}
          <rect x="213" y="511" width="148" height="10" fill="#101220"/>
          {/* Panel windows grid */}
          {[535,565,595,625,655,685].flatMap((y,i) => [225,255,285,315,335].map((x,j) => (
            <rect key={`pl${i}${j}`} x={x} y={y} width="24" height="23" rx="2"
              fill="#2040ff" opacity={(j%3===0?0.5:0.3)+(i%2)*0.1} filter="url(#gf)"/>
          )))}
          {/* Antenna */}
          <rect x="282" y="415" width="4" height="100" fill="#6060ff"/>
          <rect x="275" y="412" width="18" height="5" fill="#4040cc"/>
          <circle cx="284" cy="411" r="10" fill="#6688ff" opacity="0.6" filter="url(#gf)"
            style={{animation:"blink-slow 2s ease-in-out infinite"}}/>
          {/* Door */}
          <rect x="262" y="686" width="32" height="52" rx="2" fill="#0a0c14"/>
          {/* Floor */}
          <rect x="213" y="730" width="148" height="10" rx="1" fill="#1a1c28"/>
          {/* Glow */}
          <ellipse cx="287" cy="640" rx="55" ry="28" fill="url(#win-blue)" opacity="0.12"/>

          {/* Tree between Criação and Natureza */}
          <rect x="358" y="565" width="6" height="172" fill="#2a1a08"/>
          <circle cx="361" cy="548" r="30" fill="#1e3810"/>
          <circle cx="350" cy="562" r="20" fill="#244a14"/>
          <circle cx="372" cy="558" r="24" fill="#1e4010"/>
          <circle cx="361" cy="534" r="15" fill="#2a5018"/>

          {/* ══════════════════════════════════════════
              BAIRRO DA NATUREZA — centro, x=370-730
              ══════════════════════════════════════════ */}

          {/* Bairro label */}
          <rect x="440" y="468" width="150" height="18" rx="9" fill="#080d06" stroke="#1a3a12" strokeWidth="1"/>
          <text x="515" y="481" textAnchor="middle" fill="#44bb66" fontSize="9" fontFamily="monospace" letterSpacing="2">BAIRRO DA NATUREZA</text>

          {/* Riachuelo / canal */}
          <path d="M365,494 Q370,540 367,590 Q370,640 368,740 L390,740 Q392,692 390,642 Q392,592 389,542 Q391,494 391,494 Z"
            fill="#0a1820" stroke="#0c1e28" strokeWidth="1"/>
          {/* Bridge */}
          <path d="M360,696 L396,696 L396,686 L360,686 Z" fill="#3a2a18"/>
          <rect x="362" y="686" width="6" height="14" fill="#4a3a20"/>
          <rect x="386" y="686" width="6" height="14" fill="#4a3a20"/>

          {/* CENTRO AMBIENTAL (x=394-640, y=490-735) */}
          <path d="M394,735 L394,420 Q405,395 455,383 L512,378 Q570,374 620,390 Q634,405 634,425 L634,735 Z" fill="#1e3810"/>
          {/* Living roof */}
          <path d="M378,420 Q390,375 450,363 L512,358 Q574,354 628,370 Q642,385 644,420 Z" fill="#2a5018"/>
          {/* Moss blobs on walls */}
          {[450,475,500,525,550,575,600].map((x,i) => (
            <ellipse key={`mo${i}`} cx={x} cy={430+(i%3)*22} rx={9+(i%2)*4} ry={6+(i%3)*2} fill="#2a4810" opacity="0.65"/>
          ))}
          {/* Vines left */}
          <path d="M397,725 Q390,695 397,658 Q404,620 396,582 Q388,545 396,505" stroke="#2a4a12" strokeWidth="5" fill="none"/>
          {[680,630,582,530,505].map((y,i) => (
            <ellipse key={`vl${i}`} cx={392-(i%2)*7} cy={y} rx={10+(i%2)*3} ry={7+(i%2)*2}
              fill="#2a4810" style={{animation:`leaf-sway ${3+i*.4}s ${i*.3}s ease-in-out infinite`}}/>
          ))}
          {/* Vines right */}
          <path d="M631,720 Q638,690 632,658 Q626,626 632,590" stroke="#2a4a12" strokeWidth="5" fill="none"/>
          {[690,645,605,570].map((y,i) => (
            <ellipse key={`vr2${i}`} cx={636+(i%2)*7} cy={y} rx={9+(i%2)*3} ry={6+(i%2)*2}
              fill="#2a4810" style={{animation:`leaf-sway ${3+i*.4}s ${i*.3+.5}s ease-in-out infinite`}}/>
          ))}
          {/* Rooftop trees */}
          {[[448,356],[510,345],[572,350]].map(([x,y],i) => (
            <g key={`rt${i}`}>
              <rect x={x-3} y={y+8} width="6" height="22" fill="#3a2a10" rx="1"/>
              <circle cx={x} cy={y} r={17+(i%2)*5} fill="#244a14"/>
              <circle cx={x-9} cy={y+9} r={12+(i%2)*3} fill="#2a5618"/>
              <circle cx={x+9} cy={y+9} r={13+(i%2)*2} fill="#226014"/>
            </g>
          ))}
          {/* Greenhouse windows */}
          {[408,450,492,534,576,615].map((x,i) => (
            <g key={`gw${i}`}>
              <rect x={x} y={480} width="28" height="38" rx="2" fill="#40cc80" opacity="0.3" filter="url(#gf)"/>
              <rect x={x} y={532} width="28" height="32" rx="2" fill="#40cc80" opacity="0.25" filter="url(#gf)"/>
            </g>
          ))}
          <ellipse cx="514" cy="510" rx="100" ry="44" fill="url(#win-green)" opacity="0.12"/>
          {/* Entrance arch */}
          <path d="M495,735 Q495,696 514,694 Q533,696 533,735 Z" fill="#0e1205"/>
          <rect x="495" y="708" width="38" height="27" fill="#0e1205"/>
          {/* Floor */}
          <rect x="376" y="732" width="262" height="8" rx="1" fill="#1a2a12"/>

          {/* PLAYCENTER (x=644-730, y=538-735) round, neon */}
          <rect x="644" y="538" width="88" height="200" fill="#140a22"/>
          <ellipse cx="688" cy="536" rx="52" ry="22" fill="#200a38"/>
          {/* Neon strip */}
          <ellipse cx="688" cy="536" rx="50" ry="20" fill="none" stroke="#8820ff" strokeWidth="2" opacity="0.7"/>
          {/* Windows — colorful */}
          {[560,595,630,665,700].map((y,i) => (
            <g key={`pc${i}`}>
              <circle cx={i%2===0?660:716} cy={y} r="10"
                fill={["#cc44ff","#44ccff","#ffcc44","#44ffcc","#ff44cc"][i]}
                opacity="0.7" filter="url(#gf)"/>
            </g>
          ))}
          {/* Sign */}
          <rect x="652" y="556" width="72" height="16" rx="3" fill="#200020"/>
          <text x="688" y="568" textAnchor="middle" fill="#cc44ff" fontSize="8" fontFamily="monospace" letterSpacing="1">PLAYCENTER</text>
          {/* Door */}
          <rect x="668" y="690" width="40" height="45" rx="3" fill="#0a0514"/>
          {/* Steps */}
          <rect x="640" y="730" width="96" height="10" rx="1" fill="#1a0a28"/>
          <ellipse cx="688" cy="545" rx="60" ry="30" fill="url(#win-violet)" opacity="0.1"/>

          {/* ══════════════════════════════════════════
              BAIRRO DA GOVERNANÇA — elevado x=740-1070
              ══════════════════════════════════════════ */}

          {/* Plataforma elevada */}
          <rect x="730" y="474" width="345" height="18" rx="2" fill="#5a4520"/>
          {/* Steps de acesso */}
          {[0,1,2,3].map(i => (
            <rect key={`gs${i}`} x={730+i*14} y={474+i*5} width={345-i*14} height="5" rx="1" fill="#6a5228"/>
          ))}

          {/* Bairro label */}
          <rect x="800" y="452" width="168" height="18" rx="9" fill="#0e0c04" stroke="#3a3010" strokeWidth="1"/>
          <text x="884" y="465" textAnchor="middle" fill="#ccaa33" fontSize="9" fontFamily="monospace" letterSpacing="2">BAIRRO DA GOVERNANÇA</text>

          {/* ASSEMBLEIA (x=740-1010, y=355-735) */}
          {/* Steps (4 tiers) */}
          <rect x="730" y="724" width="285" height="12" rx="1" fill="#9a7828"/>
          <rect x="735" y="714" width="275" height="11" rx="1" fill="#aa8830"/>
          <rect x="740" y="706" width="265" height="9" rx="1" fill="#b89838"/>
          {/* Main body */}
          <rect x="746" y="355" width="258" height="355" fill="#5a4518"/>
          {/* Columns (8) */}
          {[754,787,820,853,886,919,952,985].map((cx,i) => (
            <g key={`ac${i}`}>
              <rect x={cx} y="355" width="10" height="355" rx="3" fill="#d0a832"/>
              <rect x={cx+2} y="355" width="3" height="355" fill="#e0bc42" opacity="0.35"/>
            </g>
          ))}
          {/* Entablature */}
          <rect x="740" y="343" width="274" height="14" fill="#a08828"/>
          {/* Frieze panels */}
          {[748,778,808,838,868,898,928,958,984].map((x,i) => (
            <rect key={`af${i}`} x={x} y="345" width="18" height="10" rx="2" fill="#c0a030" opacity="0.5"/>
          ))}
          {/* Pediment */}
          <path d="M732,343 L1022,343 L877,288 Z" fill="#b89828"/>
          <path d="M740,343 L1014,343 L877,296 Z" fill="#caaa32"/>
          {/* Acroteria */}
          <circle cx="877" cy="286" r="11" fill="#c8a030"/>
          {/* Windows (arched, 2 floors) */}
          {[758,800,842,884,926,968].map((x,i) => (
            <g key={`aw1${i}`}>
              <path d={`M${x},440 Q${x},414 ${x+18},414 Q${x+36},414 ${x+36},440 L${x+36},484 L${x},484 Z`} fill="#0e0a03"/>
              <ellipse cx={x+18} cy={452} rx={12} ry={8} fill="url(#win-warm)" opacity="0.8" filter="url(#gf)"/>
            </g>
          ))}
          {[758,800,842,884,926,968].map((x,i) => (
            <g key={`aw2${i}`}>
              <path d={`M${x},520 Q${x},500 ${x+18},500 Q${x+36},500 ${x+36},520 L${x+36},556 L${x},556 Z`} fill="#0e0a03"/>
              <ellipse cx={x+18} cy={532} rx={10} ry={7} fill="url(#win-warm)" opacity="0.65" filter="url(#gf)"/>
            </g>
          ))}
          {/* Central door */}
          <path d="M858,735 Q858,700 877,697 Q896,700 896,735 Z" fill="#12100a"/>
          <rect x="858" y="710" width="38" height="25" fill="#12100a"/>
          <line x1="877" y1="697" x2="877" y2="735" stroke="#3a2a08" strokeWidth="1.5"/>
          {/* Lanterns */}
          <circle cx="840" cy="685" r="7" fill="#f0b840" opacity="0.9" filter="url(#gf)"/>
          <circle cx="916" cy="685" r="7" fill="#f0b840" opacity="0.9" filter="url(#gf)"/>
          <ellipse cx="877" cy="460" rx="140" ry="44" fill="url(#win-warm)" opacity="0.08"/>

          {/* TORRE DO CURADOR (x=1012-1068, y=432-735) */}
          <rect x="1012" y="432" width="52" height="305" fill="#1e1c38" rx="2"/>
          {/* Gothic window */}
          <path d="M1022,510 Q1022,490 1038,488 Q1054,490 1054,510 L1054,540 L1022,540 Z" fill="#0a0a20"/>
          <ellipse cx="1038" cy="518" rx="10" ry="8" fill="url(#win-violet)" opacity="0.6" filter="url(#gf)"/>
          {/* Small windows */}
          <circle cx="1038" cy="580" r="7" fill="#cc44ff" opacity="0.4" filter="url(#gf)"/>
          <circle cx="1038" cy="630" r="7" fill="#cc44ff" opacity="0.4" filter="url(#gf)"/>
          {/* Light at top */}
          <circle cx="1038" cy="426" r="14" fill="#eeeeFF" opacity="0.9" filter="url(#gf2)"
            style={{animation:"blink-slow 3s ease-in-out infinite"}}/>
          {/* Door */}
          <rect x="1023" y="695" width="30" height="40" rx="2" fill="#0a0a1a"/>
          {/* Steps */}
          <rect x="1010" y="730" width="60" height="10" rx="1" fill="#1e1c38"/>

          {/* ══════════════════════════════════════════
              BAIRRO DO PROFUNDO — direita, semienterrado
              x=1070-1200, y=535-740
              ══════════════════════════════════════════ */}

          {/* Dark zone overlay */}
          <rect x="1070" y="488" width="135" height="252" fill="#08090f" opacity="0.7" rx="2"/>

          {/* Bairro label */}
          <rect x="1076" y="468" width="140" height="18" rx="9" fill="#060608" stroke="#1a1a30" strokeWidth="1"/>
          <text x="1146" y="481" textAnchor="middle" fill="#5566bb" fontSize="9" fontFamily="monospace" letterSpacing="2">BAIRRO DO PROFUNDO</text>

          {/* Retaining wall */}
          <rect x="1075" y="538" width="126" height="200" fill="#0f1120"/>
          {/* Underground steps */}
          {[0,1,2,3,4,5].map(i => (
            <rect key={`ds${i}`} x={1080+i*10} y={560+i*20} width={116-i*10} height="16"
              fill="#0a0c18" stroke="#1a1c2a" strokeWidth="0.5"/>
          ))}
          {/* Iron door */}
          <rect x="1104" y="708" width="48" height="42" rx="2" fill="#060810" stroke="#30304a" strokeWidth="2"/>
          <circle cx="1147" cy="730" r="5" fill="#4448aa" filter="url(#gf)"/>
          <line x1="1128" y1="708" x2="1128" y2="750" stroke="#1a1c2a" strokeWidth="1.5"/>
          {/* Underground glow */}
          <ellipse cx="1128" cy="740" rx="34" ry="12" fill="#2030c0" opacity="0.2" filter="url(#gf)"/>
          {/* Crowd antenna */}
          <rect x="1182" y="488" width="5" height="55" fill="#4448aa"/>
          <circle cx="1184" cy="485" r="9" fill="#6688ff" opacity="0.6" filter="url(#gf)"
            style={{animation:"crowd-pulse 2.5s ease-in-out infinite"}}/>

          {/* ══════════════════════════════════════════
              BAIRRO BIÓTICO — floresta densa, direita
              x=1175-1400, y=488-740
              ══════════════════════════════════════════ */}

          {/* Bairro label */}
          <rect x="1248" y="468" width="130" height="18" rx="9" fill="#060a04" stroke="#183010" strokeWidth="1"/>
          <text x="1313" y="481" textAnchor="middle" fill="#66cc44" fontSize="9" fontFamily="monospace" letterSpacing="2">BAIRRO BIÓTICO</text>

          {/* Dense forest */}
          {[
            [1195,495,28,"#0e2008"],[1225,508,22,"#122808"],[1250,490,32,"#0a1e08"],
            [1278,502,25,"#122208"],[1305,494,30,"#0e2008"],[1330,506,22,"#183008"],
            [1355,492,28,"#102008"],[1378,508,20,"#142808"],[1395,498,18,"#0e1e08"],
            [1210,535,18,"#1a3010"],[1240,525,14,"#1e3810"],[1268,532,16,"#163010"],
            [1295,526,18,"#1a2e08"],[1320,535,14,"#183010"],[1350,528,20,"#122808"],
            [1375,535,15,"#1a2e10"],
          ].map(([x,y,r,c],i) => (
            <g key={`bt${i}`}>
              <rect x={+x-3} y={+y+3} width="6" height={740 - +y - 3} fill="#1a1008"/>
              <circle cx={+x} cy={+y} r={+r} fill={c as string}/>
            </g>
          ))}
          {/* Ancient stone ruin hidden in forest */}
          <rect x="1268" y="618" width="58" height="78" fill="#222220"/>
          <path d="M1263,618 L1331,618 L1318,600 L1276,600 Z" fill="#2e2e2c"/>
          {/* Ruin cracks */}
          <line x1="1285" y1="618" x2="1285" y2="650" stroke="#1a1a18" strokeWidth="2"/>
          <line x1="1310" y1="618" x2="1312" y2="666" stroke="#1a1a18" strokeWidth="1.5"/>
          {/* Vines on ruin */}
          <path d="M1268,696 Q1262,670 1268,640 Q1274,610 1268,580" stroke="#2a4a10" strokeWidth="3" fill="none"/>
          <path d="M1326,696 Q1332,668 1326,635" stroke="#2a4a10" strokeWidth="3" fill="none"/>
          {/* Glowing creature tracks */}
          {[1210,1250,1290,1330,1370].map((x,i) => (
            <circle key={`tr${i}`} cx={x} cy={700} r="3" fill="#44cc44" opacity="0.35"
              style={{animation:`blink-slow ${2+i*.5}s ${i*.3}s ease-in-out infinite`}}/>
          ))}

          {/* ══════════════════════════════════════════
              GROUND DETAILS — grass, bushes, path
              ══════════════════════════════════════════ */}
          <rect x="0" y="736" width="1400" height="164" fill="#080604"/>
          <rect x="0" y="734" width="1400" height="6" fill="#121008"/>

          {/* Grass tufts */}
          {[15,40,65,85,380,420,460,490,730,770,810,850,1000,1040].map((x,i) => (
            <g key={`g${i}`}>
              <path d={`M${x},738 Q${x-5},723 ${x-2},713 Q${x},723 ${x+2},713 Q${x+5},723 ${x},738`} fill="#1a2a0e" opacity="0.8"/>
              <path d={`M${x+7},738 Q${x+2},726 ${x+5},716 Q${x+7},726 ${x+9},716 Q${x+12},726 ${x+7},738`} fill="#162408" opacity="0.7"/>
            </g>
          ))}
          {/* Bushes */}
          {[25,105,190,370,430,490,720,780,840,1000,1060,1120].map((x,i) => (
            <ellipse key={`sb${i}`} cx={x} cy={740} rx={14+(i%3)*4} ry={10+(i%2)*3} fill="#172010" opacity="0.8"/>
          ))}

          {/* ══ Bairro separator trees ══ */}
          {/* Between Criação and Natureza */}
          <rect x="738" y="565" width="6" height="172" fill="#2a1808"/>
          <circle cx="741" cy="548" r="24" fill="#1e3810"/>
          <circle cx="730" cy="558" r="16" fill="#244a14"/>
          <circle cx="752" cy="555" r="18" fill="#1e4010"/>
          {/* Between Natureza and Governança */}
          <rect x="1065" y="590" width="6" height="147" fill="#2a1808"/>
          <circle cx="1068" cy="574" r="20" fill="#1e3810"/>
          {/* Right of Assembleia */}
          <rect x="1195" y="560" width="6" height="177" fill="#2a1a08"/>
          <circle cx="1198" cy="545" r="22" fill="#1e2e10"/>
        </svg>

        {/* ── IA AVATAR BUTTONS (absolutamente posicionados sobre a cena) ── */}
        {IAS.map(ia => {
          const color = SYS_COLOR[ia.system] ?? "#c8a050";
          const sz = ia.scale ? `clamp(38px,5.5vw,56px)` : `clamp(44px,6.5vw,64px)`;
          return (
            <button key={ia.id} className="ia-btn"
              onClick={() => setModal({ kind:"ia", data:ia })}
              title={`${ia.name} · ${ia.bairro}`}
              style={{
                position:"absolute",
                left:`${ia.lx}%`, top:`${ia.ly}%`,
                transform:"translate(-50%,-50%)",
                width:sz, height:sz,
                borderRadius:"50%", border:`2px solid ${color}88`,
                background:`${color}15`,
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:`clamp(${ia.scale ? "16px" : "18px"},${ia.scale ? "2.8vw" : "3.2vw"},${ia.scale ? "28px" : "34px"})`,
                color, zIndex:10, overflow:"hidden",
                animation:`ia-glow 3s ${(ia.lx * 0.2).toFixed(1)}s ease-in-out infinite, ceu-float 4s ${(ia.lx * 0.15).toFixed(1)}s ease-in-out infinite`,
              }}>
              {ia.id === "dodge" ? (
                <img src="/aliancapanorama/dodge-avatar.png"
                  style={{ width:"90%", height:"90%", borderRadius:"50%", objectFit:"cover" }}
                  alt="DODGE" />
              ) : ia.emoji}
            </button>
          );
        })}

        {/* ── BUILDING BUTTONS (3 botões = clique abre modal) ── */}
        {BUILDINGS.map(bld => {
          const color = BAIRRO_COLOR[bld.bairro] ?? "#c8a050";
          return (
            <button key={bld.id} className="bld-btn"
              onClick={() => setModal({ kind:"building", data:bld })}
              title={`${bld.name} · ${bld.bairro}`}
              style={{
                position:"absolute",
                left:`${bld.bx}%`, top:`${bld.by}%`,
                transform:"translate(-50%,-50%)",
                padding:"3px 8px",
                borderRadius:6, border:`1px solid ${color}44`,
                background:`rgba(0,0,0,0.65)`,
                cursor:"pointer", display:"flex", alignItems:"center", gap:4,
                fontSize:9, fontFamily:"monospace", letterSpacing:1,
                color:`${color}cc`, zIndex:8, whiteSpace:"nowrap",
              }}>
              <span style={{ fontSize:11 }}>{bld.emoji}</span>
              <span>{bld.name.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {/* ── BAIRROS LEGENDA + ESTATÍSTICAS ── */}
      <div style={{ padding:"10px 16px 6px", display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
        {Object.entries(bairroGroups).map(([bairro, ias]) => (
          <div key={bairro} style={{
            display:"flex", alignItems:"center", gap:5, padding:"3px 10px",
            background:"#0a0808", border:`1px solid ${BAIRRO_COLOR[bairro] ?? "#333"}44`,
            borderRadius:20, fontSize:9, fontFamily:"monospace",
          }}>
            <span style={{ width:6, height:6, borderRadius:"50%",
              background:BAIRRO_COLOR[bairro] ?? "#333", display:"inline-block" }}/>
            <span style={{ color:BAIRRO_COLOR[bairro] ?? "#888", letterSpacing:1 }}>
              {bairro}
            </span>
            <span style={{ color:"#444" }}>{ias.length}</span>
          </div>
        ))}
      </div>

      {/* ── MO ALL — Entrada Universal ── */}
      <div style={{ maxWidth:640, margin:"10px auto", padding:"0 16px 16px" }}>
        <div style={{ background:"#0a0806", border:"1px solid #2a1a08",
          borderRadius:10, overflow:"hidden" }}>
          <div style={{ padding:"10px 14px", borderBottom:"1px solid #1a1008",
            display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:14 }}>🌐</span>
            <div>
              <div style={{ fontSize:11, color:"#c8a050", fontFamily:"monospace", fontWeight:700, letterSpacing:1 }}>
                MO ALL — ENTRADA UNIVERSAL
              </div>
              <div style={{ fontSize:9, color:"#444", fontFamily:"monospace", letterSpacing:1 }}>
                DISTRIBUI PARA TODOS OS BAIRROS · EMAIL: LUDDLOCKE
              </div>
            </div>
          </div>
          <div style={{ padding:"12px 14px" }}>
            <textarea
              value={moInput} onChange={e => setMoInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendMoAll(); }}
              placeholder="Texto, ideia, arquivo, link, pergunta — distribui para todas as IAs e síntese por email..."
              style={{ width:"100%", minHeight:72, background:"#060504",
                border:"1px solid #1a1208", borderRadius:6, color:"#d0c8b0",
                fontSize:13, padding:"8px 10px", resize:"vertical", fontFamily:"Georgia,serif",
                outline:"none", boxSizing:"border-box" }}/>
            <div style={{ display:"flex", gap:8, marginTop:8, alignItems:"center" }}>
              <span style={{ fontSize:10, color:"#444", flex:1, fontFamily:"monospace" }}>
                {moStatus === "idle" && apiStatus === "offline" && "⚠ API offline — mensagem será perdida"}
                {moStatus === "idle" && apiStatus === "online" && "Cmd+Enter para enviar"}
                {moStatus === "sending" && "Distribuindo para todos os bairros..."}
                {moStatus === "sent" && "✓ Enviado — síntese chegará por email"}
                {moStatus === "error" && "✗ Erro ao enviar — API offline?"}
              </span>
              <button onClick={sendMoAll}
                disabled={moStatus === "sending" || !moInput.trim()}
                style={{ padding:"8px 16px", fontSize:10, fontFamily:"monospace", letterSpacing:1.5,
                  background: moStatus === "sent" ? "#0a2a10" : "#0d0d0a",
                  border:`1px solid ${moStatus === "sent" ? "#2a6028" : moStatus === "error" ? "#5a1a1a" : "#3a2a10"}`,
                  borderRadius:7, color:moStatus === "sent" ? "#44cc88" : moStatus === "error" ? "#cc4444" : "#c8a050",
                  cursor:"pointer" }}>
                {moStatus === "sending" ? "ENVIANDO…" : moStatus === "sent" ? "ENVIADO ✓" : "ENVIAR →"}
              </button>
            </div>
          </div>
        </div>
      </div>

      </>}

      {/* Modais */}
      {modal && <CeuModal item={modal} onClose={() => setModal(null)} />}
      {showBiblioteca && <BibliotecaPanel onClose={() => setShowBiblioteca(false)} />}
    </div>
  );
}
