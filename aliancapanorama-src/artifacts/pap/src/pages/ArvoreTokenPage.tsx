/**
 * ArvoreTokenPage — /aliancapanorama/arvore-token
 * Dashboard da crypto Arvore (ARVR): plantios, mortes, supply, carteiras.
 */
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

interface Stats {
  trees_alive: number;
  trees_dead: number;
  trees_total: number;
  supply_circulating: number;
  supply_ever_minted: number;
}

interface Tree {
  id: number;
  tree_id: string;
  planter: string;
  gps_lat: number | null;
  gps_lng: number | null;
  species: string;
  status: string;
  tokens_minted: number;
  planted_at: string;
  died_at: string | null;
  notes: string | null;
}

interface LedgerEntry {
  id: number;
  tx_type: string;
  from_wallet: string | null;
  to_wallet: string | null;
  amount: number;
  tree_id: string | null;
  memo: string | null;
  created_at: string;
}

function statusColor(s: string) {
  if (s === "alive") return "text-green-400";
  if (s === "dead")  return "text-red-400";
  return "text-yellow-400";
}

function txColor(t: string) {
  if (t === "mint")     return "text-green-400";
  if (t === "burn")     return "text-red-400";
  if (t === "transfer") return "text-blue-400";
  return "text-gray-400";
}

export function ArvoreTokenPage() {
  const [stats, setStats]         = useState<Stats | null>(null);
  const [trees, setTrees]         = useState<Tree[]>([]);
  const [ledger, setLedger]       = useState<LedgerEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<"visao"|"arvores"|"ledger"|"custodio">("visao");

  // Custódio form
  const [bridge, setBridge]       = useState("");
  const [plantForm, setPlantForm] = useState({ tree_id: "", planter: "", gps_lat: "", gps_lng: "", species: "nativa", cert_hash: "", notes: "" });
  const [deathForm, setDeathForm] = useState({ tree_id: "", notes: "" });
  const [msg, setMsg]             = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/arvore-token/stats`).then(r => r.json()),
      fetch(`${API}/api/arvore-token/trees?limit=100`).then(r => r.json()),
      fetch(`${API}/api/arvore-token/ledger?limit=50`).then(r => r.json()),
    ]).then(([s, t, l]) => {
      setStats(s);
      setTrees(Array.isArray(t) ? t : []);
      setLedger(Array.isArray(l) ? l : []);
    }).finally(() => setLoading(false));
  }, []);

  async function plant() {
    setMsg("Plantando...");
    try {
      const r = await fetch(`${API}/api/arvore-token/plant`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${bridge}` },
        body: JSON.stringify({ ...plantForm, gps_lat: plantForm.gps_lat || undefined, gps_lng: plantForm.gps_lng || undefined }),
      });
      const d = await r.json();
      setMsg(r.ok ? `✅ Árvore ${d.tree_id} plantada — ${d.tokens_minted} ARVR mintados` : `❌ ${d.error}`);
      if (r.ok) window.location.reload();
    } catch (e: any) { setMsg(`❌ ${e.message}`); }
  }

  async function reportDeath() {
    setMsg("Registrando morte...");
    try {
      const r = await fetch(`${API}/api/arvore-token/report-death`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${bridge}` },
        body: JSON.stringify(deathForm),
      });
      const d = await r.json();
      setMsg(r.ok ? `🔥 Árvore ${d.tree_id} — ${d.tokens_burned} ARVR queimados` : `❌ ${d.error}`);
      if (r.ok) window.location.reload();
    } catch (e: any) { setMsg(`❌ ${e.message}`); }
  }

  return (
    <div className="min-h-screen bg-[#050810] text-white font-mono">
      {/* Header */}
      <div className="border-b border-green-900/40 px-4 py-3 bg-[#060f08]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-green-300 font-bold">🌱 ARVORE TOKEN</span>
            <span className="text-gray-500 text-xs ml-3">ARVR · lastro em plantio auditável</span>
          </div>
          {stats && (
            <span className="text-green-400 text-xs font-bold">
              {stats.supply_circulating.toLocaleString()} ARVR circulando
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 px-4">
        <div className="max-w-3xl mx-auto flex gap-1">
          {(["visao","arvores","ledger","custodio"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-2 text-xs font-bold transition-colors ${tab === t ? "text-green-300 border-b-2 border-green-400" : "text-gray-500 hover:text-gray-300"}`}>
              {t === "visao" && "📊 Visão Geral"}
              {t === "arvores" && "🌳 Árvores"}
              {t === "ledger" && "📒 Ledger"}
              {t === "custodio" && "🔑 Custódio"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {loading && <div className="text-center text-gray-600 py-12 text-2xl animate-pulse">🌱</div>}

        {/* VISÃO GERAL */}
        {!loading && tab === "visao" && stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Árvores vivas", val: stats.trees_alive, color: "text-green-400" },
                { label: "Árvores mortas", val: stats.trees_dead, color: "text-red-400" },
                { label: "Supply ARVR", val: stats.supply_circulating.toLocaleString(), color: "text-blue-400" },
                { label: "Já mintado", val: stats.supply_ever_minted.toLocaleString(), color: "text-gray-300" },
              ].map(c => (
                <div key={c.label} className="rounded-xl border border-gray-800/50 bg-gray-900/30 p-4 text-center">
                  <div className={`text-2xl font-bold ${c.color}`}>{c.val}</div>
                  <div className="text-xs text-gray-500 mt-1">{c.label}</div>
                </div>
              ))}
            </div>

            {/* Manifesto */}
            <div className="rounded-xl border border-green-900/30 bg-green-950/10 p-5 space-y-2">
              <div className="text-green-300 text-xs font-bold mb-2">PROTOCOLO ÉTICO</div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <strong>1 árvore = 1000 ARVR.</strong> Quando a árvore morre, o token queima.
                Um token imortal ligado a lastro mortal seria greenwashing de segunda ordem.
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                <strong>Custódio obrigatório</strong> — pessoa física com CPF responsável pela verificação GPS + certHash.
                Blockchain é só a folha; o solo é a confiança humana.
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                <strong>Papel do Théo:</strong> tradutor vigilante — monitora integridade, não lucra.
                Co-branding máximo = campanha de conscientização.
              </p>
              <div className="flex gap-2 mt-3 flex-wrap text-[10px]">
                <span className="bg-green-900/30 text-green-300 px-2 py-0.5 rounded">Assembleia #666</span>
                <span className="bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded">Assembleia #669</span>
                <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded">Sessão #123 · 2026-09-11</span>
              </div>
            </div>

            {/* Contrato Solidity */}
            <div className="rounded-xl border border-gray-800/40 bg-gray-900/20 p-4">
              <div className="text-gray-500 text-xs font-bold mb-2">SMART CONTRACT (referência — deploy futuro)</div>
              <code className="text-green-400/80 text-[10px] block">artifacts/contracts/ArvoreToken.sol</code>
              <code className="text-gray-500 text-[10px] block">ERC-20 • plantTree() • reportDeath() • onlyCustodio</code>
              <code className="text-gray-500 text-[10px] block">Deploy alvo: Polygon Amoy testnet (gratuito)</code>
            </div>
          </div>
        )}

        {/* ÁRVORES */}
        {!loading && tab === "arvores" && (
          <div className="space-y-2">
            {trees.length === 0 && <div className="text-center text-gray-600 py-8 text-sm">Nenhuma árvore plantada ainda.</div>}
            {trees.map(t => (
              <div key={t.id} className="rounded-xl border border-gray-800/40 bg-gray-900/20 p-3 flex items-start gap-3">
                <span className="text-xl">{t.status === "alive" ? "🌳" : "🪵"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-200 text-xs font-bold">{t.tree_id}</span>
                    <span className={`text-[10px] font-bold ${statusColor(t.status)}`}>{t.status}</span>
                    <span className="text-gray-600 text-[10px]">{t.species}</span>
                  </div>
                  <div className="text-gray-500 text-[10px] mt-0.5">
                    Plantador: {t.planter} · {t.tokens_minted.toLocaleString()} ARVR
                  </div>
                  {(t.gps_lat || t.gps_lng) && (
                    <div className="text-gray-600 text-[10px]">
                      GPS: {t.gps_lat}, {t.gps_lng}
                    </div>
                  )}
                  <div className="text-gray-700 text-[10px]">
                    Plantada: {new Date(t.planted_at).toLocaleDateString("pt-BR")}
                    {t.died_at && ` · Morreu: ${new Date(t.died_at).toLocaleDateString("pt-BR")}`}
                  </div>
                  {t.notes && <div className="text-gray-600 text-[10px] mt-0.5 italic">{t.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LEDGER */}
        {!loading && tab === "ledger" && (
          <div className="space-y-2">
            {ledger.length === 0 && <div className="text-center text-gray-600 py-8 text-sm">Ledger vazio.</div>}
            {ledger.map(e => (
              <div key={e.id} className="rounded-xl border border-gray-800/40 bg-gray-900/20 p-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${txColor(e.tx_type)}`}>{e.tx_type.toUpperCase()}</span>
                  <span className="text-white font-bold">{e.amount.toLocaleString()} ARVR</span>
                  {e.tree_id && <span className="text-gray-500">árvore {e.tree_id}</span>}
                </div>
                <div className="text-gray-600 text-[10px] mt-0.5">
                  {e.from_wallet && `de ${e.from_wallet} `}
                  {e.to_wallet && `→ ${e.to_wallet}`}
                </div>
                {e.memo && <div className="text-gray-500 text-[10px] italic">{e.memo}</div>}
                <div className="text-gray-700 text-[10px]">{new Date(e.created_at).toLocaleString("pt-BR")}</div>
              </div>
            ))}
          </div>
        )}

        {/* CUSTÓDIO */}
        {!loading && tab === "custodio" && (
          <div className="space-y-4">
            {msg && (
              <div className="rounded-xl border border-gray-700 bg-gray-900/40 p-3 text-sm text-gray-200">{msg}</div>
            )}

            <div className="rounded-xl border border-yellow-900/30 bg-yellow-950/10 p-4">
              <div className="text-yellow-300 text-xs font-bold mb-3">🔑 BRIDGE SECRET</div>
              <input
                type="password"
                placeholder="Bridge secret para autorização"
                value={bridge}
                onChange={e => setBridge(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="rounded-xl border border-green-900/30 bg-green-950/10 p-4 space-y-3">
              <div className="text-green-300 text-xs font-bold">🌱 REGISTRAR PLANTIO</div>
              {[
                ["tree_id","ID único da árvore (ex: arvore-001)"],
                ["planter","Carteira do plantador"],
                ["gps_lat","Latitude GPS"],
                ["gps_lng","Longitude GPS"],
                ["species","Espécie (ex: ipê-amarelo)"],
                ["cert_hash","Hash SHA-256 do certificado"],
                ["notes","Observações (opcional)"],
              ].map(([k, ph]) => (
                <input
                  key={k}
                  type="text"
                  placeholder={ph}
                  value={(plantForm as any)[k]}
                  onChange={e => setPlantForm(prev => ({ ...prev, [k]: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs text-white"
                />
              ))}
              <button onClick={plant}
                className="w-full bg-green-700 hover:bg-green-600 text-white text-xs font-bold py-2 rounded transition-colors">
                🌳 Plantar Árvore (+1000 ARVR)
              </button>
            </div>

            <div className="rounded-xl border border-red-900/30 bg-red-950/10 p-4 space-y-3">
              <div className="text-red-300 text-xs font-bold">🔥 REGISTRAR MORTE</div>
              <input
                type="text"
                placeholder="ID da árvore"
                value={deathForm.tree_id}
                onChange={e => setDeathForm(prev => ({ ...prev, tree_id: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Motivo / observação"
                value={deathForm.notes}
                onChange={e => setDeathForm(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs text-white"
              />
              <button onClick={reportDeath}
                className="w-full bg-red-800 hover:bg-red-700 text-white text-xs font-bold py-2 rounded transition-colors">
                🔥 Registrar Morte (queima automática)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
