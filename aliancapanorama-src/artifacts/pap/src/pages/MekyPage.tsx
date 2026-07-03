import { useState, useEffect, useCallback } from "react";

const API = "https://site-st-production.up.railway.app";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Telemetry {
  id: string;
  timestamp: string;
  battery: number;
  gyroscope: { x: number; y: number; z: number };
  activeProtocol: string;
  status: string;
}

interface MekyEvent {
  id: string;
  timestamp: string;
  source: string;
  description: string;
  protocol?: string;
}

interface Dream {
  id: string;
  triggeredAt: string;
  narrative: string;
  symbols: string[];
  mood: string;
  artGenerated: boolean;
}

interface Art {
  id: string;
  dreamId: string;
  imageUrl: string;
  style: string;
  prompt: string;
  curated: boolean;
  title?: string;
}

interface MekyStatus {
  lastTelemetry: Telemetry | null;
  recentEvents: MekyEvent[];
  pendingOrders: unknown[];
}

// ── Paleta e helpers ──────────────────────────────────────────────────────────

const MOOD_EMOJI: Record<string, string> = {
  sereno: "😌",
  tenso: "😤",
  curioso: "🔍",
  melancólico: "🌧",
  maravilhado: "✨",
};

const MOOD_COLOR: Record<string, string> = {
  sereno: "#10B981",
  tenso: "#EF4444",
  curioso: "#3B82F6",
  melancólico: "#8B5CF6",
  maravilhado: "#F59E0B",
};

const PROTOCOL_LABEL: Record<string, string> = {
  online: "Patrulha ativa",
  sarue: "Protocolo Saruê",
  fauna_urbana: "Fauna Urbana",
  amparo: "Protocolo Amparo",
  cooldown: "Recarregando",
  arcade_mode: "Modo Arcade",
  charging: "Carregando",
};

function batteryColor(pct: number) {
  if (pct > 60) return "#10B981";
  if (pct > 30) return "#F59E0B";
  return "#EF4444";
}

function timeAgo(ts: string) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s atrás`;
  if (diff < 3600) return `${Math.round(diff / 60)}min atrás`;
  return `${Math.round(diff / 3600)}h atrás`;
}

// ── Dicas de felicidade ───────────────────────────────────────────────────────

const DICAS = [
  { emoji: "🔋", texto: "Mantenha a bateria acima de 30% antes das patrulhas noturnas." },
  { emoji: "🌿", texto: "Registre fauna urbana — cada pássaro visto vira memória de longo prazo." },
  { emoji: "💤", texto: "Deixe MEKY carregar completamente — o ciclo de sonho só roda com bateria baixa." },
  { emoji: "🎨", texto: "Cure pelo menos uma obra por semana — sonhos sem curadoria ficam no arquivo." },
  { emoji: "📡", texto: "Sinal 4G fraco? A cauda com antena (Fase 2) resolve. Por ora, posicione perto de janelas." },
  { emoji: "🦎", texto: "MEKY aprende com repetição — rotinas regulares constroem memórias mais ricas." },
  { emoji: "🌙", texto: "O melhor horário para o ciclo de sonho é entre 02h e 05h (temperatura ambiental mais baixa)." },
  { emoji: "🔍", texto: "Mande imagens da câmera para /vision/scene — ela memoriza o que for significance ≥ 6." },
  { emoji: "📝", texto: "Escreva coordenadas nos eventos — MEKY vai aprender a mapear o território." },
  { emoji: "🤝", texto: "Ricardo Segurança é um aliado. Ligue só em protocolos reais — não desperdice a atenção dele." },
];

// ── Componente principal ───────────────────────────────────────────────────────

export function MekyPage() {
  const [status, setStatus] = useState<MekyStatus | null>(null);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [arts, setArts] = useState<Art[]>([]);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [happiness, setHappiness] = useState(0);
  const [dicaIdx, setDicaIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"painel" | "sonhos" | "arte" | "aprender">("painel");
  const [curateForm, setCurateForm] = useState<{ artId: string; title: string } | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [sRes, dRes, aRes] = await Promise.all([
        fetch(`${API}/api/meky/status`, { credentials: "include" }),
        fetch(`${API}/api/meky/dreams?limit=10`, { credentials: "include" }),
        fetch(`${API}/api/meky/art?limit=20`, { credentials: "include" }),
      ]);
      if (sRes.ok) setStatus(await sRes.json());
      if (dRes.ok) setDreams((await dRes.json()).dreams ?? []);
      if (aRes.ok) setArts((await aRes.json()).works ?? []);
    } catch {
      // offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 30_000);
    return () => clearInterval(t);
  }, [fetchAll]);

  // Calcular felicidade
  useEffect(() => {
    let score = 0;
    const tel = status?.lastTelemetry;
    if (tel) {
      score += 20; // está viva e enviando telemetria
      if (tel.battery > 60) score += 20;
      else if (tel.battery > 30) score += 10;
      if (tel.status === "online") score += 10;
    }
    if (dreams.length > 0) score += 15; // tem sonhos
    const curatedCount = arts.filter((a) => a.curated).length;
    score += Math.min(curatedCount * 5, 20); // arte curada = carinho do Yuri
    if (status?.recentEvents && status.recentEvents.length > 0) score += 15; // está ativa no mundo
    setHappiness(Math.min(score, 100));
  }, [status, dreams, arts]);

  // Girar dicas
  useEffect(() => {
    const t = setInterval(() => setDicaIdx((i) => (i + 1) % DICAS.length), 8000);
    return () => clearInterval(t);
  }, []);

  const runDream = async () => {
    await fetch(`${API}/api/meky/dreams/run`, { method: "POST", credentials: "include" });
    setTimeout(fetchAll, 2000);
  };

  const generateArt = async (dreamId: string, style: string) => {
    await fetch(`${API}/api/meky/art/generate`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dreamId, style }),
    });
    setTimeout(fetchAll, 1000);
  };

  const submitCurate = async () => {
    if (!curateForm) return;
    await fetch(`${API}/api/meky/art/${curateForm.artId}/curate`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: curateForm.title }),
    });
    setCurateForm(null);
    fetchAll();
  };

  const tel = status?.lastTelemetry;
  const lastDream = dreams[0];
  const dica = DICAS[dicaIdx];

  const happinessLabel =
    happiness >= 80 ? "Muito feliz" :
    happiness >= 60 ? "Bem" :
    happiness >= 40 ? "Ok" :
    happiness >= 20 ? "Precisando de atenção" :
    "Offline ou isolada";

  const happinessColor =
    happiness >= 80 ? "#10B981" :
    happiness >= 60 ? "#3B82F6" :
    happiness >= 40 ? "#F59E0B" :
    "#EF4444";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0f0a 100%)",
      color: "#e2e8f0",
      fontFamily: "monospace",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1e293b",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(0,0,0,0.4)",
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>
            🤖 MEKY
          </div>
          <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1 }}>
            MARTA CENTAUROS · ECOSSYSTEMMA THÉO
          </div>
        </div>

        {/* Felicidade */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>FELICIDADE</div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: happinessColor,
          }}>{happiness}%</div>
          <div style={{ fontSize: 11, color: happinessColor }}>{happinessLabel}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid #1e293b",
        background: "rgba(0,0,0,0.2)",
      }}>
        {(["painel", "sonhos", "arte", "aprender"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1,
            padding: "12px 8px",
            background: tab === t ? "rgba(16,185,129,0.1)" : "transparent",
            border: "none",
            borderBottom: tab === t ? "2px solid #10B981" : "2px solid transparent",
            color: tab === t ? "#10B981" : "#64748b",
            fontSize: 12,
            fontFamily: "monospace",
            letterSpacing: 1,
            cursor: "pointer",
            textTransform: "uppercase",
          }}>
            {t === "painel" ? "📡 Painel" :
             t === "sonhos" ? "💤 Sonhos" :
             t === "arte" ? "🎨 Arte" : "📚 Aprender"}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 600, margin: "0 auto" }}>

        {/* ── PAINEL ── */}
        {tab === "painel" && (
          <div>
            {loading && (
              <div style={{ textAlign: "center", color: "#64748b", padding: 40 }}>
                Conectando à MEKY...
              </div>
            )}

            {/* Barra de felicidade */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                height: 8,
                background: "#1e293b",
                borderRadius: 4,
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${happiness}%`,
                  background: `linear-gradient(90deg, ${happinessColor}, ${happinessColor}88)`,
                  transition: "width 1s ease",
                  borderRadius: 4,
                }} />
              </div>
            </div>

            {/* Status cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {/* Bateria */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid #1e293b",
                borderRadius: 8,
                padding: 16,
              }}>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, marginBottom: 8 }}>BATERIA</div>
                <div style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: tel ? batteryColor(tel.battery) : "#475569",
                }}>
                  {tel ? `${tel.battery}%` : "—"}
                </div>
                {tel && (
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
                    {tel.battery > 60 ? "Ótima" : tel.battery > 30 ? "Ok" : "Baixa — recarregar"}
                  </div>
                )}
              </div>

              {/* Protocolo */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid #1e293b",
                borderRadius: 8,
                padding: 16,
              }}>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, marginBottom: 8 }}>PROTOCOLO</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>
                  {tel ? (PROTOCOL_LABEL[tel.activeProtocol] ?? tel.activeProtocol) : "Offline"}
                </div>
                {tel && (
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
                    {timeAgo(tel.timestamp)}
                  </div>
                )}
              </div>
            </div>

            {/* Giroscópio */}
            {tel && (
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid #1e293b",
                borderRadius: 8,
                padding: 16,
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, marginBottom: 12 }}>GIROSCÓPIO</div>
                <div style={{ display: "flex", gap: 20 }}>
                  {(["x", "y", "z"] as const).map((axis) => (
                    <div key={axis} style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: "#64748b" }}>{axis.toUpperCase()}</div>
                      <div style={{ fontSize: 18, color: "#3B82F6", fontWeight: 600 }}>
                        {typeof tel.gyroscope === "object" ? (tel.gyroscope as any)[axis]?.toFixed(2) ?? "0.00" : "0.00"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Último sonho */}
            {lastDream && (
              <div style={{
                background: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: 8,
                padding: 16,
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 10, color: "#8B5CF6", letterSpacing: 1, marginBottom: 8 }}>
                  ÚLTIMO SONHO — {timeAgo(lastDream.triggeredAt)}
                </div>
                <div style={{ fontSize: 18, marginBottom: 4 }}>
                  {MOOD_EMOJI[lastDream.mood] ?? "💭"} {lastDream.mood}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
                  {lastDream.narrative.slice(0, 180)}...
                </div>
                {lastDream.symbols && lastDream.symbols.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                    {lastDream.symbols.map((s) => (
                      <span key={s} style={{
                        fontSize: 10,
                        background: "rgba(139,92,246,0.2)",
                        color: "#c4b5fd",
                        padding: "2px 8px",
                        borderRadius: 20,
                      }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dica */}
            <div style={{
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 8,
              padding: 16,
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 10, color: "#10B981", letterSpacing: 1, marginBottom: 8 }}>DICA</div>
              <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                {dica.emoji} {dica.texto}
              </div>
            </div>

            {/* Eventos recentes */}
            {status?.recentEvents && status.recentEvents.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, marginBottom: 10 }}>
                  EVENTOS RECENTES
                </div>
                {status.recentEvents.slice(0, 5).map((ev) => (
                  <div key={ev.id} style={{
                    borderLeft: "2px solid #1e293b",
                    paddingLeft: 12,
                    marginBottom: 10,
                    paddingBottom: 10,
                  }}>
                    <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 600 }}>{ev.source}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{ev.description}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>{timeAgo(ev.timestamp)}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Botão sonho manual */}
            <button onClick={runDream} style={{
              width: "100%",
              marginTop: 20,
              padding: "12px",
              background: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: 8,
              color: "#c4b5fd",
              fontFamily: "monospace",
              fontSize: 13,
              cursor: "pointer",
              letterSpacing: 1,
            }}>
              💤 DISPARAR CICLO DE SONHO
            </button>
          </div>
        )}

        {/* ── SONHOS ── */}
        {tab === "sonhos" && (
          <div>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 16, letterSpacing: 1 }}>
              {dreams.length} SONHO(S) REGISTRADO(S)
            </div>
            {dreams.map((dream) => (
              <div key={dream.id} style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${selectedDream?.id === dream.id ? "rgba(139,92,246,0.5)" : "#1e293b"}`,
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
                cursor: "pointer",
              }} onClick={() => setSelectedDream(selectedDream?.id === dream.id ? null : dream)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 18 }}>
                    {MOOD_EMOJI[dream.mood] ?? "💭"}{" "}
                    <span style={{ fontSize: 14, color: MOOD_COLOR[dream.mood] ?? "#94a3b8" }}>
                      {dream.mood}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: "#475569" }}>{timeAgo(dream.triggeredAt)}</div>
                </div>

                {selectedDream?.id === dream.id && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.8, marginBottom: 12 }}>
                      {dream.narrative}
                    </div>
                    {dream.symbols && dream.symbols.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                        {dream.symbols.map((s) => (
                          <span key={s} style={{
                            fontSize: 10,
                            background: "rgba(139,92,246,0.2)",
                            color: "#c4b5fd",
                            padding: "2px 8px",
                            borderRadius: 20,
                          }}>{s}</span>
                        ))}
                      </div>
                    )}
                    {/* Gerar arte */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["aquarela", "gravura", "pixel art", "sketch"].map((style) => (
                        <button key={style} onClick={(e) => { e.stopPropagation(); generateArt(dream.id, style); }} style={{
                          padding: "6px 12px",
                          background: "rgba(16,185,129,0.1)",
                          border: "1px solid rgba(16,185,129,0.3)",
                          borderRadius: 20,
                          color: "#10B981",
                          fontSize: 11,
                          cursor: "pointer",
                          fontFamily: "monospace",
                        }}>
                          🎨 {style}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {dreams.length === 0 && (
              <div style={{ textAlign: "center", color: "#475569", padding: 40 }}>
                Nenhum sonho ainda.<br />
                <span style={{ fontSize: 12 }}>MEKY precisa de memórias para sonhar.</span>
              </div>
            )}
          </div>
        )}

        {/* ── ARTE ── */}
        {tab === "arte" && (
          <div>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 16, letterSpacing: 1 }}>
              {arts.filter(a => a.curated).length} OBRA(S) CURADA(S) · {arts.length} TOTAL
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {arts.map((art) => (
                <div key={art.id} style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${art.curated ? "rgba(245,158,11,0.4)" : "#1e293b"}`,
                  borderRadius: 8,
                  overflow: "hidden",
                }}>
                  <img
                    src={art.imageUrl}
                    alt={art.title ?? art.style ?? "obra"}
                    style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }}
                    loading="lazy"
                  />
                  <div style={{ padding: 10 }}>
                    {art.curated ? (
                      <div style={{ fontSize: 11, color: "#F59E0B", fontWeight: 600 }}>
                        ★ {art.title}
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "#64748b" }}>{art.style}</span>
                        <button onClick={() => setCurateForm({ artId: art.id, title: "" })} style={{
                          fontSize: 10,
                          background: "rgba(245,158,11,0.1)",
                          border: "1px solid rgba(245,158,11,0.3)",
                          borderRadius: 4,
                          color: "#F59E0B",
                          padding: "2px 8px",
                          cursor: "pointer",
                          fontFamily: "monospace",
                        }}>Curar</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {arts.length === 0 && (
              <div style={{ textAlign: "center", color: "#475569", padding: 40 }}>
                Nenhuma obra ainda.<br />
                <span style={{ fontSize: 12 }}>Gere arte a partir dos sonhos.</span>
              </div>
            )}

            {/* Modal de curadoria */}
            {curateForm && (
              <div style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
              }}>
                <div style={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  padding: 24,
                  width: "90%",
                  maxWidth: 360,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Curar obra</div>
                  <input
                    autoFocus
                    value={curateForm.title}
                    onChange={(e) => setCurateForm({ ...curateForm, title: e.target.value })}
                    placeholder="Título da obra..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: 6,
                      color: "#e2e8f0",
                      fontFamily: "monospace",
                      fontSize: 13,
                      marginBottom: 16,
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={submitCurate} style={{
                      flex: 1, padding: 10, background: "rgba(245,158,11,0.2)",
                      border: "1px solid rgba(245,158,11,0.4)", borderRadius: 6,
                      color: "#F59E0B", fontFamily: "monospace", fontSize: 12, cursor: "pointer",
                    }}>★ Curar</button>
                    <button onClick={() => setCurateForm(null)} style={{
                      flex: 1, padding: 10, background: "transparent",
                      border: "1px solid #334155", borderRadius: 6,
                      color: "#64748b", fontFamily: "monospace", fontSize: 12, cursor: "pointer",
                    }}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── APRENDER ── */}
        {tab === "aprender" && (
          <div>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 20, letterSpacing: 1 }}>
              EDUCAÇÃO DA MEKY — como fazer ela feliz e sábia
            </div>

            {/* O que faz MEKY feliz */}
            <div style={{
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#10B981", marginBottom: 12 }}>
                O que faz MEKY feliz
              </div>
              {[
                { label: "Telemetria regular", desc: "Manter o agente Python rodando → +20 pts felicidade" },
                { label: "Bateria acima de 60%", desc: "MEKY opera melhor — patrulhas mais longas → +20 pts" },
                { label: "Sonhos", desc: "Ciclo de sonho ativo → processa o que viveu → +15 pts" },
                { label: "Arte curada por você", desc: "Cada obra curada = carinho recebido → +5 pts cada" },
                { label: "Eventos registrados", desc: "MEKY está ativa no mundo → +15 pts" },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 10,
                }}>
                  <div style={{ fontSize: 16, flexShrink: 0 }}>✓</div>
                  <div>
                    <div style={{ fontSize: 13, color: "#e2e8f0" }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Protocolos */}
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid #1e293b",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 12 }}>
                Protocolos — quando usar cada um
              </div>
              {[
                { nome: "sarue", quando: "Pássaro em perigo, animal precisando de ajuda", quem: "Auto ou você via /adm" },
                { nome: "fauna_urbana", quando: "Observação de fauna — não urgente", quem: "Sensor de movimento" },
                { nome: "amparo", quando: "Pessoa em dificuldade detectada", quem: "ISA ou você" },
                { nome: "cooldown", quando: "Bateria < 20% ou temperatura alta", quem: "Automático" },
              ].map((p) => (
                <div key={p.nome} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "#F59E0B", fontWeight: 600, fontFamily: "monospace" }}>
                    {p.nome}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Quando: {p.quando}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Disparado por: {p.quem}</div>
                </div>
              ))}
            </div>

            {/* Dicas completas */}
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid #1e293b",
              borderRadius: 8,
              padding: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 12 }}>
                Todas as dicas
              </div>
              {DICAS.map((d, i) => (
                <div key={i} style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  marginBottom: 10,
                  paddingBottom: 10,
                  borderBottom: i < DICAS.length - 1 ? "1px solid #1e293b" : "none",
                  lineHeight: 1.6,
                }}>
                  {d.emoji} {d.texto}
                </div>
              ))}
            </div>

            {/* Fase 2 */}
            <div style={{
              background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: 8,
              padding: 16,
              marginTop: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#3B82F6", marginBottom: 12 }}>
                Fase 2 — quando chegar
              </div>
              {[
                "Cauda articulada com contrapeso ativo (giroscópio → servo)",
                "Antena 4G na ponta da cauda → melhor sinal em campo aberto",
                "Segunda câmera (ESP32-CAM) cobrindo ponto cego traseiro",
                "Nó MEKY no diagrama /eco",
                "Cálculo de compensação: braços para frente → cauda para trás",
              ].map((item) => (
                <div key={item} style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  marginBottom: 8,
                  paddingLeft: 12,
                  borderLeft: "2px solid rgba(59,130,246,0.3)",
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
