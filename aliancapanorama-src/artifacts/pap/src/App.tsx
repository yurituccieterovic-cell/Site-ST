import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainApp } from "@/components/MainApp";
import { IntroFacade, shouldShowIntro } from "@/components/IntroFacade";
import { AdmPage } from "@/pages/adm/AdmPage";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient();

const isAdm = window.location.pathname.includes("/adm");

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

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
