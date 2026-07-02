import { useState } from "react";
import { Search, ExternalLink, TreePine, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * EcosiaSearch — widget metassemiótico de busca contextual.
 *
 * Ecosia bloqueia iframe (X-Frame-Options). Em vez disso, este componente
 * oferece uma caixa de busca com keywords sugeridas por contexto (metassemiótica:
 * cada seção do sistema fala a língua do seu espaço via Ecosia).
 * Abre ecosia.org em nova aba. Exige login no Ecosia para plantar árvores.
 *
 * Props:
 *   keywords  — chips de palavras-chave contextuais pré-carregados
 *   label     — texto acima da busca (ex: "Aprofunde aqui")
 *   dark      — tema escuro (cockpit/espaço) vs. claro (/adm)
 *   compact   — modo compacto sem título visível
 */
export interface EcosiaSearchProps {
  keywords?: string[];
  label?: string;
  dark?: boolean;
  compact?: boolean;
}

const ECOSIA_URL = "https://www.ecosia.org/search?q=";

export function EcosiaSearch({
  keywords = [],
  label = "Buscar no Ecosia",
  dark = false,
  compact = false,
}: EcosiaSearchProps) {
  const [query, setQuery] = useState("");
  const [loginHint, setLoginHint] = useState(false);

  const doSearch = (q: string) => {
    const term = q.trim();
    if (!term) return;
    window.open(`${ECOSIA_URL}${encodeURIComponent(term)}`, "_blank", "noopener,noreferrer");
    setLoginHint(true);
    setTimeout(() => setLoginHint(false), 7000);
  };

  const bg = dark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.95)";
  const border = dark ? "rgba(255,255,255,0.12)" : "#E5E7EB";
  const textMain = dark ? "text-white/80" : "text-gray-800";
  const textSub = dark ? "text-white/40" : "text-gray-400";
  const inputBg = dark ? "rgba(255,255,255,0.07)" : "white";
  const inputBorder = dark ? "rgba(255,255,255,0.15)" : "#D1D5DB";
  const chipBg = dark ? "rgba(255,255,255,0.08)" : "#F3F4F6";
  const chipText = dark ? "text-white/70" : "text-gray-600";
  const chipHover = dark ? "hover:bg-white/15" : "hover:bg-gray-200";

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      {!compact && (
        <div className="flex items-center gap-2">
          <TreePine className={`w-4 h-4 ${dark ? "text-emerald-400" : "text-emerald-600"} shrink-0`} />
          <span className={`text-[11px] font-bold uppercase tracking-widest ${textMain}`}>{label}</span>
        </div>
      )}

      {/* Keywords chips */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((kw) => (
            <button
              key={kw}
              onClick={() => { setQuery(kw); doSearch(kw); }}
              className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${chipText} ${chipHover} transition-colors`}
              style={{ background: chipBg, border: `1px solid ${border}` }}
            >
              {kw}
            </button>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
          <Search className={`w-3.5 h-3.5 ${textSub} shrink-0`} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") doSearch(query); }}
            placeholder="Pesquisar no Ecosia..."
            className={`flex-1 bg-transparent outline-none text-xs ${textMain} placeholder:${textSub}`}
          />
        </div>
        <motion.button
          onClick={() => doSearch(query)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, #5fad56, #3d8b37)" }}
        >
          <ExternalLink className="w-3 h-3" />
          <span className="hidden sm:inline">Buscar</span>
        </motion.button>
      </div>

      {/* Login hint — aparece após a primeira busca */}
      <AnimatePresence>
        {loginHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`flex items-center gap-2 text-[10px] ${textSub} pt-1`}>
              <LogIn className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>
                Faça login no Ecosia para salvar buscas e plantar mais árvores.{" "}
                <a
                  href="https://www.ecosia.org/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-500 hover:underline font-medium"
                >
                  Entrar no Ecosia →
                </a>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Floating Ecosia button (cockpit — canto inferior direito) ─────────────── */
export function EcosiaFloatingButton({
  keywords,
  dark = true,
}: { keywords?: string[]; dark?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 z-30 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            className="w-72"
          >
            <EcosiaSearch keywords={keywords} dark={dark} />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Buscar no Ecosia"
        className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: "linear-gradient(135deg, #5fad56, #3d8b37)", boxShadow: "0 4px 20px rgba(95,173,86,0.45)" }}
      >
        <TreePine className="w-5 h-5 text-white" />
      </motion.button>
    </div>
  );
}
