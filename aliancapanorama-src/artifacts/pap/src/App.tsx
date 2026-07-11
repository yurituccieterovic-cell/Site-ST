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
import { HelmetProvider } from "react-helmet-async";
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

// Gate para /dodge — verifica sessão adm antes de exibir DodgePage
function DodgeGate() {
  const [state, setState] = useState<"loading" | "denied" | { tier: number }>("loading");
  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`, { credentials: "include" })
      .then(r => r.json() as Promise<{ user: { tier: number } | null }>)
      .then(d => {
        if (d.user && d.user.tier >= 5) setState({ tier: d.user.tier });
        else setState("denied");
      })
      .catch(() => setState("denied"));
  }, []);
  if (state === "loading") return <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-cyan-400 font-mono text-sm">Verificando acesso...</div>;
  if (state === "denied") return (
    <div className="min-h-screen bg-[#080c18] text-gray-100 font-sans flex flex-col">
      {/* SEO */}
      <title>DOD Sociedade Tucci | Salve suas conversas e continue seus projetos</title>
      <meta name="description" content="O DOD da Sociedade Tucci organiza suas conversas, projetos e memória com inteligência artificial. Login para salvar conversa ou baixe o app."/>
      <meta name="keywords" content="DOD Sociedade Tucci, app DOD, salvar conversa, organizar projetos, inteligência artificial, memória inteligente, agentes IA"/>
      <meta property="og:title" content="DOD Sociedade Tucci | App para projetos com IA"/>
      <meta property="og:description" content="Login para salvar conversa? Baixe o app DOD Sociedade Tucci e continue de onde parou."/>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 pt-16 pb-8 text-center">
        <img src="/dodge-avatar.png" alt="DOD" className="w-24 h-24 rounded-full object-cover border-2 border-amber-600/60 shadow-xl mb-6"/>
        <div className="text-amber-400 font-bold text-xs tracking-widest uppercase mb-2">DOD · Sociedade Tucci</div>
        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
          Login para salvar<br/>sua conversa?
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-md mb-8">
          Nunca perca uma ideia. Organize projetos, pesquisas e agentes de IA em um único lugar — com memória que continua de onde você parou.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 w-full max-w-sm">
          <a href="/portal"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-sm transition-colors shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Entrar e salvar
          </a>
          <a href="https://sociedadetucci.com.br" target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-sm transition-colors shadow-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download App DOD →
          </a>
        </div>
        <p className="text-gray-600 text-xs">App DOD Sociedade Tucci · para te ajudar no seu projeto</p>
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
            <p className="text-gray-600 text-xs mt-3">DOD Sociedade Tucci · editor de raízes · memória inteligente</p>
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
