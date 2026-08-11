import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainApp } from "@/components/MainApp";
import { IntroFacade, shouldShowIntro } from "@/components/IntroFacade";
import { LoginGate } from "@/components/LoginGate";
import { AdmPage } from "@/pages/adm/AdmPage";
import { ArquiteturaPage } from "@/pages/ArquiteturaPage";
import { BuscarPage } from "@/pages/BuscarPage";
import { MapaPage } from "@/pages/MapaPage";
import { EcossystemmaPage } from "@/pages/EcossystemmaPage";
import { ToyotaPage } from "@/pages/ToyotaPage";
import { MekyPage } from "@/pages/MekyPage";
import { PortalPage } from "@/pages/PortalPage";
import { DodgePage } from "@/pages/DodgePage";
import { StudioPage } from "@/pages/StudioPage";
import { ConectorPage } from "@/pages/ConectorPage";
import { IsaLandingPage } from "@/pages/IsaLandingPage";
import { CeuPage } from "@/pages/CeuPage";
import { PlaycenterPage } from "@/pages/PlaycenterPage";
import { ArvorePage } from "@/pages/ArvorePage";
import { RapaduraPage } from "@/pages/RapaduraPage";
import { CssTutorialPage } from "@/pages/CssTutorialPage";
import { HelmetProvider } from "react-helmet-async";
import { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

const FREE_MSG_LIMIT = 10;
const FREE_MSG_KEY = "dodge_free_count";

type ChatMsg = { role: "user" | "assistant"; content: string };

function DodgePublicChat() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([{
    role: "assistant",
    content: "Olá! Sou o Dodge da Sociedade Tucci. Posso te contar sobre a empresa, nossas IAs e como são os nossos projetos. Para trabalhar no SEU projeto, faça login. 😊",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false);
  const [msgCount, setMsgCount] = useState(() => parseInt(localStorage.getItem(FREE_MSG_KEY) ?? "0", 10));
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const limitReached = msgCount >= FREE_MSG_LIMIT;

  async function send() {
    if (!input.trim() || loading || limitReached || loginRequired) return;
    const userMsg: ChatMsg = { role: "user", content: input.trim() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);

    const newCount = msgCount + 1;
    setMsgCount(newCount);
    localStorage.setItem(FREE_MSG_KEY, String(newCount));

    try {
      const r = await fetch(`${API_BASE}/api/dodge/public-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs.slice(-12) }),
      });
      const data = await r.json() as { reply?: string; login_required?: boolean; error?: string };
      const reply = data.reply ?? data.error ?? "Algo deu errado, tente novamente.";
      setMsgs(m => [...m, { role: "assistant", content: reply }]);
      if (data.login_required) setLoginRequired(true);
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: "Sem conexão no momento. Tente novamente." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-gray-800 rounded-xl bg-gray-950/80 flex flex-col" style={{ height: 340 }}>
      <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2">
        <img src={`${import.meta.env.BASE_URL}dodge-avatar.png`} alt="Dodge" className="w-7 h-7 rounded-full object-cover border border-amber-600/50"/>
        <span className="text-amber-400 text-xs font-bold tracking-widest">DODGE</span>
        {!limitReached && !loginRequired && (
          <span className="ml-auto text-gray-600 text-xs">{FREE_MSG_LIMIT - msgCount} msg{FREE_MSG_LIMIT - msgCount !== 1 ? "s" : ""} grátis</span>
        )}
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
              m.role === "user"
                ? "bg-amber-600/20 border border-amber-700/40 text-amber-100"
                : "bg-gray-800/70 border border-gray-700/50 text-gray-200"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/70 border border-gray-700/50 rounded-xl px-3 py-2 text-gray-400 text-xs">
              <span className="animate-pulse">Dodge está pensando…</span>
            </div>
          </div>
        )}
        {(limitReached || loginRequired) && (
          <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl px-4 py-3 text-center">
            <p className="text-amber-300 text-xs font-semibold mb-2">
              {loginRequired ? "Este assunto é só com login 🔐" : `Você usou suas ${FREE_MSG_LIMIT} mensagens gratuitas`}
            </p>
            <a href="/portal" className="inline-flex items-center gap-1 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors">
              Entrar e continuar →
            </a>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      {!limitReached && !loginRequired && (
        <div className="px-3 pb-3">
          <div className="flex gap-2">
            <input
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-amber-600/60"
              placeholder="Pergunte sobre a Sociedade Tucci…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Gate para /dodge — verifica sessão adm antes de exibir DodgePage
function DodgeGate() {
  const [state, setState] = useState<"loading" | "denied" | { tier: number }>("loading");
  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    fetch(`${API_BASE}/api/auth/me`, { credentials: "include", signal: ctrl.signal })
      .then(r => r.json() as Promise<{ user: { tier: number } | null }>)
      .then(d => {
        if (d.user && d.user.tier >= 5) setState({ tier: d.user.tier });
        else setState("denied");
      })
      .catch(() => setState("denied"))
      .finally(() => clearTimeout(timer));
  }, []);
  if (state === "loading") return <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-cyan-400 font-mono text-sm">Verificando acesso…</div>;
  if (state === "denied") return (
    <div className="min-h-screen bg-[#080c18] text-gray-100 font-sans flex flex-col">
      {/* SEO */}
      <title>Dodge Sociedade Tucci | Salve suas conversas e continue seus projetos</title>
      <meta name="description" content="O Dodge da Sociedade Tucci organiza suas conversas, projetos e memória com inteligência artificial. Login para salvar conversa ou baixe o app."/>
      <meta name="keywords" content="Dodge Sociedade Tucci, app Dodge, salvar conversa, organizar projetos, inteligência artificial, memória inteligente, agentes IA"/>
      <meta property="og:title" content="Dodge Sociedade Tucci | App para projetos com IA"/>
      <meta property="og:description" content="Login para salvar conversa? Baixe o app Dodge Sociedade Tucci e continue de onde parou."/>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 pt-12 pb-6 text-center">
        <img src={`${import.meta.env.BASE_URL}dodge-avatar.png`} alt="Dodge" className="w-24 h-24 rounded-full object-cover border-2 border-amber-600/60 shadow-xl mb-6"/>
        <div className="text-amber-400 font-bold text-xs tracking-widest uppercase mb-2">Dodge · Sociedade Tucci</div>
        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
          Login para salvar<br/>sua conversa?
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-md mb-6">
          Nunca perca uma ideia. Organize projetos, pesquisas e agentes de IA em um único lugar — com memória que continua de onde você parou.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-3 w-full max-w-sm">
          <a href="/portal"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-sm transition-colors shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Entrar e salvar
          </a>
          <a href="https://sociedadetucci.com.br" target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-sm transition-colors shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download App Dodge →
          </a>
        </div>
        <p className="text-gray-600 text-xs mb-8">App Dodge Sociedade Tucci · para te ajudar no seu projeto</p>

        {/* Chat público */}
        <div className="w-full max-w-lg">
          <p className="text-gray-500 text-xs mb-2">Converse com o Dodge sem login — {FREE_MSG_LIMIT} mensagens gratuitas</p>
          <DodgePublicChat />
        </div>
      </div>

      {/* Como funciona */}
      <div className="border-t border-gray-800 px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-center text-gray-300 font-semibold text-base mb-6">Como funciona</h2>
          <div className="grid grid-cols-3 gap-4 text-center mb-8">
            {[
              { n:"1", t:"Login", d:"Entre com sua conta ou crie uma em segundos" },
              { n:"2", t:"Converse", d:"Fale com a IA sobre qualquer projeto" },
              { n:"3", t:"Salvo", d:"Histórico, contexto e memória preservados" },
            ].map(s => (
              <div key={s.n} className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-900/60 border border-cyan-700/50 text-cyan-400 flex items-center justify-center text-sm font-bold">{s.n}</div>
                <div className="text-white text-xs font-semibold">{s.t}</div>
                <div className="text-gray-500 text-xs">{s.d}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <h2 className="text-center text-gray-300 font-semibold text-base mb-4">O que você ganha</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
            {[
              "💬 Conversas salvas automaticamente",
              "🔁 Continue de onde parou",
              "📁 Histórico por projeto",
              "🔍 Busca semântica",
              "🏷️ Tags por tema",
              "📤 Exportar resumo (PDF/MD)",
              "⭐ Favoritos",
              "🔔 Lembretes",
              "📡 Compartilhamento",
              "🤖 Integração com agentes IA",
              "🧠 Memória inteligente",
              "📶 Modo offline parcial",
            ].map(f => (
              <div key={f} className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300">{f}</div>
            ))}
          </div>

          {/* FAQ */}
          <h2 className="text-center text-gray-300 font-semibold text-base mb-4">Perguntas frequentes</h2>
          <div className="space-y-3 mb-8">
            {[
              { q:"Posso continuar depois?", a:"Sim. Todo progresso permanece salvo com contexto completo." },
              { q:"É gratuito?", a:"Sim. Acesso básico gratuito. Funcionalidades avançadas com conta Sociedade Tucci." },
              { q:"Posso exportar?", a:"Sim. PDF, Markdown e outros formatos disponíveis." },
              { q:"Funciona em qualquer dispositivo?", a:"Sim. Sincronização entre dispositivos conectados." },
            ].map(faq => (
              <div key={faq.q} className="bg-gray-900/40 border border-gray-800 rounded-lg px-4 py-3">
                <div className="text-white text-xs font-semibold mb-1">{faq.q}</div>
                <div className="text-gray-400 text-xs">{faq.a}</div>
              </div>
            ))}
          </div>

          {/* CTA final */}
          <div className="text-center">
            <a href="/portal"
              className="inline-flex items-center gap-2 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-sm transition-colors shadow-lg">
              Entrar e começar agora
            </a>
            <p className="text-gray-600 text-xs mt-3">Dodge Sociedade Tucci · editor de raízes · memória inteligente</p>
          </div>
        </div>
      </div>
    </div>
  );
  return <DodgePage superAdm={state.tier >= 9}/>;
}

// Singleton fora do componente — evita re-criação a cada render
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

const path = window.location.pathname;
const isAdm = path.includes("/adm");
const isArquitetura = path.includes("/arquitetura");
const isBuscar = path.includes("/buscar");
const isMapa = path.includes("/mapa");
const isEco = path.includes("/eco");
const isToyota = path.includes("/toyota");
const isMeky   = path.includes("/meky");
const isPortal = path.includes("/portal");
const isDodge  = path.includes("/dodge");
const isIsa    = path.startsWith("/aliancapanorama/isa") || path === "/isa";
const isStudio  = path.includes("/studio");
const isConnect = path.includes("/connect");
const isCeu        = path.includes("/ceu");
const isPlaycenter = path.includes("/playcenter");
const isArvore     = path.includes("/arvore");
const isRapadura    = path.includes("/rapadura");
const isCssTutorial = path.includes("/css-tutorial");

function App() {
  const [introDone, setIntroDone] = useState(() => !shouldShowIntro());

  if (isAdm) {
    return (
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AdmPage />
          <Toaster />
        </QueryClientProvider>
      </HelmetProvider>
    );
  }

  if (isIsa) return <IsaLandingPage />;

  if (isArquitetura) {
    return (
      <QueryClientProvider client={queryClient}>
        <ArquiteturaPage />
      </QueryClientProvider>
    );
  }

  if (isBuscar) {
    return (
      <QueryClientProvider client={queryClient}>
        <BuscarPage />
      </QueryClientProvider>
    );
  }

  if (isMapa) {
    return (
      <QueryClientProvider client={queryClient}>
        <MapaPage />
      </QueryClientProvider>
    );
  }

  if (isEco) {
    return <EcossystemmaPage />;
  }

  if (isToyota) {
    return <ToyotaPage />;
  }

  if (isMeky) {
    return <MekyPage />;
  }

  if (isPortal) {
    return <PortalPage />;
  }

  if (isDodge) {
    return <DodgeGate />;
  }

  if (isStudio) {
    return (
      <QueryClientProvider client={queryClient}>
        <StudioPage />
      </QueryClientProvider>
    );
  }

  if (isConnect) {
    return <ConectorPage />;
  }

  if (isCeu) {
    return <CeuPage />;
  }

  if (isPlaycenter) {
    return <PlaycenterPage />;
  }

  if (isArvore) {
    return <ArvorePage />;
  }

  if (isRapadura) {
    return <RapaduraPage />;
  }

  if (isCssTutorial) {
    return <CssTutorialPage />;
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LoginGate>
          {() => (
            <TooltipProvider>
              <div className="dark min-h-screen bg-black text-white flex items-center justify-center overflow-hidden font-mono">
                <div className="w-full max-w-[900px] h-[100dvh] max-h-[900px] bg-background relative flex flex-col border border-border/50 shadow-2xl rounded-none md:rounded-xl overflow-hidden">
                  <div className="contents" inert={!introDone} aria-hidden={!introDone}>
                    <MainApp />
                  </div>
                  {!introDone && <IntroFacade onComplete={() => setIntroDone(true)} />}
                </div>
              </div>
              <Toaster />
            </TooltipProvider>
          )}
        </LoginGate>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
