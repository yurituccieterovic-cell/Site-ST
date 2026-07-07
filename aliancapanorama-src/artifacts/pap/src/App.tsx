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
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center gap-4 font-mono">
      <div className="text-red-400 text-sm">Acesso negado — tier 5+ obrigatório</div>
      <a href="/portal" className="text-cyan-500 text-xs hover:underline">← Entrar via Portal</a>
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
