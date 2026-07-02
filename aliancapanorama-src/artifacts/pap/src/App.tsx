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
import { HelmetProvider } from "react-helmet-async";
import { useState } from "react";

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
