import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoUrl from "@/assets/sociedade_tucci_logo.png";

const SKIP_KEY = "pap_intro_seen_v1";

interface IntroFacadeProps {
  onComplete: () => void;
}

export function IntroFacade({ onComplete }: IntroFacadeProps) {
  const [phase, setPhase] = useState<"presenta" | "logo" | "app" | "done">("presenta");
  const skipBtnRef = useRef<HTMLButtonElement>(null);

  const finish = () => {
    try {
      sessionStorage.setItem(SKIP_KEY, "1");
    } catch {
      /* ignore */
    }
    onComplete();
  };

  useEffect(() => {
    skipBtnRef.current?.focus();
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const t = window.setTimeout(finish, 600);
      return () => window.clearTimeout(t);
    }
    const t1 = window.setTimeout(() => setPhase("logo"), 1800);
    const t2 = window.setTimeout(() => setPhase("app"), 4400);
    const t3 = window.setTimeout(() => setPhase("done"), 6600);
    const t4 = window.setTimeout(finish, 7200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSkip = () => finish();

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "done" ? 0 : 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="absolute inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden select-none"
      style={{ pointerEvents: phase === "done" ? "none" : "auto" }}
    >
      {/* subtle starfield */}
      <div className="absolute inset-0 opacity-40">
        {Array.from({ length: 60 }).map((_, i) => {
          const top = (i * 37) % 100;
          const left = (i * 71) % 100;
          const size = (i % 3) + 1;
          const delay = (i % 9) * 0.15;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: size,
                height: size,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0.2, 0.6] }}
              transition={{ duration: 4, delay, repeat: Infinity, repeatType: "reverse" }}
            />
          );
        })}
      </div>

      {/* radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      <button
        ref={skipBtnRef}
        onClick={handleSkip}
        className="absolute top-4 right-4 z-10 text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-white/80 focus:text-white/80 focus:outline-none focus:ring-1 focus:ring-white/40 transition-colors px-3 py-1.5 border border-white/15 rounded-sm"
        aria-label="Pular introdução"
      >
        Pular
      </button>

      <AnimatePresence mode="wait">
        {phase === "presenta" && (
          <motion.div
            key="presenta"
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, letterSpacing: "0.6em" }}
            exit={{ opacity: 0, letterSpacing: "0.8em" }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative z-[2] text-center"
          >
            <p className="text-[11px] md:text-[13px] uppercase text-white/55 font-light tracking-[0.5em]">
              uma produção
            </p>
          </motion.div>
        )}

        {phase === "logo" && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative z-[2] flex flex-col items-center gap-6"
          >
            <motion.img
              src={logoUrl}
              alt="Sociedade Tucci"
              className="w-44 h-44 md:w-56 md:h-56 object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.25)]"
              initial={{ filter: "blur(8px)" }}
              animate={{ filter: "blur(0px)" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center"
            >
              <p className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-light mb-1">
                Por
              </p>
              <p className="text-base md:text-lg uppercase tracking-[0.35em] text-white/90 font-light">
                Sociedade Tucci
              </p>
            </motion.div>
          </motion.div>
        )}

        {phase === "app" && (
          <motion.div
            key="app"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative z-[2] text-center"
          >
            <motion.h1
              className="text-3xl md:text-5xl font-bold text-white tracking-tight"
              style={{
                background:
                  "linear-gradient(180deg, #ffffff 0%, hsl(var(--primary)) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              initial={{ letterSpacing: "0.05em" }}
              animate={{ letterSpacing: "0em" }}
              transition={{ duration: 1.4 }}
            >
              PAP
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-[11px] md:text-[13px] uppercase tracking-[0.35em] text-white/60 mt-3"
            >
              Projeto Aliança Panorama
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 1, delay: 1 }}
              className="text-[9px] uppercase tracking-[0.4em] text-white/40 mt-6"
            >
              FUVEST 2026
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function shouldShowIntro(): boolean {
  try {
    return sessionStorage.getItem(SKIP_KEY) !== "1";
  } catch {
    return true;
  }
}
