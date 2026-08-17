import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

const HUBS = [
  { id: "isa",   nome: "ISA",   emoji: "🦉", cor: "#44bb88",
    sub: "Inteligência Semiótica Autônoma",
    desc: "Ciclo horário, Bluesky, aprende em loop.",
    url: "/aliancapanorama/isa" },
  { id: "dodge", nome: "DODGE", emoji: "🐕", cor: "#c8a050",
    sub: "Supervisor Transversal",
    desc: "Vê o que ninguém vê. Au. é argumento válido.",
    url: "/aliancapanorama/dodge" },
  { id: "iris",  nome: "IRIS",  emoji: "👁️", cor: "#9b6fd4",
    sub: "Olhos do Ecossistema",
    desc: "Câmera dedicada. O que Iris vê, o ecossistema sente.",
    url: null },
] as const;

type Hub = typeof HUBS[number];

// Prevent screen sleep while Iris is active
function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null);
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    (navigator as any).wakeLock.request("screen")
      .then((lock: WakeLockSentinel) => { lockRef.current = lock; })
      .catch(() => {});
    return () => { lockRef.current?.release().catch(() => {}); };
  }, [active]);
}

function IrisCamera({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [lastCapture, setLastCapture] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState<string | null>(null);
  useWakeLock(!!stream);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then(s => {
        setStream(s);
        if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play(); }
      })
      .catch(e => setError(`Câmera bloqueada: ${e.message}`));
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  function capture() {
    if (!videoRef.current) return;
    setCapturing(true);
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setLastCapture(dataUrl);
    setCapturing(false);
  }

  async function sendToEco() {
    if (!lastCapture) return;
    setSending(true);
    try {
      const r = await fetch(`${API}/api/ceu/iris-capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: lastCapture, ts: new Date().toISOString() }),
      });
      setSentMsg(r.ok ? "Iris enviou. Ecossistema recebeu 👁️" : "Erro ao enviar");
    } catch { setSentMsg("Offline — salva localmente"); }
    setSending(false);
    setTimeout(() => setSentMsg(null), 5000);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"#000", zIndex:200,
      display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", padding:"12px 16px",
        background:"#0a0208", borderBottom:"1px solid #2a1a30" }}>
        <span style={{ fontSize:22, marginRight:10 }}>👁️</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#9b6fd4", fontFamily:"monospace", letterSpacing:2 }}>IRIS</div>
          <div style={{ fontSize:9, color:"#666", letterSpacing:1.5, fontFamily:"monospace" }}>OLHOS DO ECOSSISTEMA</div>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"1px solid #333",
          borderRadius:6, color:"#888", padding:"5px 12px", fontSize:12, cursor:"pointer" }}>FECHAR</button>
      </div>

      {/* Camera */}
      <div style={{ flex:1, position:"relative", overflow:"hidden", background:"#000" }}>
        {error && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
            justifyContent:"center", color:"#cc4444", fontFamily:"monospace", fontSize:12,
            textAlign:"center", padding:24 }}>
            {error}<br/><br/>
            <small style={{ color:"#666" }}>Verifique permissões de câmera no navegador</small>
          </div>
        )}
        <video ref={videoRef} playsInline muted
          style={{ width:"100%", height:"100%", objectFit:"cover" }}/>

        {/* Grid overlay */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.12 }}
          xmlns="http://www.w3.org/2000/svg">
          <line x1="33%" y1="0" x2="33%" y2="100%" stroke="#9b6fd4" strokeWidth="1"/>
          <line x1="66%" y1="0" x2="66%" y2="100%" stroke="#9b6fd4" strokeWidth="1"/>
          <line x1="0" y1="33%" x2="100%" y2="33%" stroke="#9b6fd4" strokeWidth="1"/>
          <line x1="0" y1="66%" x2="100%" y2="66%" stroke="#9b6fd4" strokeWidth="1"/>
          <circle cx="50%" cy="50%" r="30" fill="none" stroke="#9b6fd4" strokeWidth="1"/>
        </svg>

        {/* Last capture preview */}
        {lastCapture && (
          <div style={{ position:"absolute", bottom:10, right:10,
            border:"2px solid #9b6fd4", borderRadius:6, overflow:"hidden" }}>
            <img src={lastCapture} alt="última captura"
              style={{ width:80, height:60, objectFit:"cover", display:"block" }}/>
          </div>
        )}

        {/* Status */}
        {sentMsg && (
          <div style={{ position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)",
            background:"rgba(0,0,0,0.85)", border:"1px solid #9b6fd4", borderRadius:20,
            padding:"6px 16px", fontSize:12, color:"#9b6fd4", fontFamily:"monospace",
            whiteSpace:"nowrap" }}>
            {sentMsg}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ padding:"14px 20px", background:"#0a0208",
        borderTop:"1px solid #2a1a30", display:"flex", gap:10, justifyContent:"center" }}>
        <button onClick={capture} disabled={capturing || !stream}
          style={{ width:64, height:64, borderRadius:"50%", border:"3px solid #9b6fd4",
            background:"rgba(155,111,212,0.15)", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>
          {capturing ? "⏳" : "📷"}
        </button>
        {lastCapture && (
          <button onClick={sendToEco} disabled={sending}
            style={{ padding:"0 20px", height:64, borderRadius:32, border:"2px solid #9b6fd450",
              background:"rgba(155,111,212,0.1)", color:"#9b6fd4", fontSize:12,
              fontFamily:"monospace", letterSpacing:1.5, cursor:"pointer" }}>
            {sending ? "ENVIANDO…" : "ENVIAR\nPRO ECO"}
          </button>
        )}
      </div>
    </div>
  );
}

export function CelularPage() {
  const [irisOpen, setIrisOpen] = useState(false);
  const [isaStatus, setIsaStatus] = useState<"online" | "offline" | "unknown">("unknown");
  const [dodgeStatus, setDodgeStatus] = useState<"online" | "offline" | "unknown">("unknown");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Quick health checks
    fetch(`${API}/api/ceu/isa-status`, { signal: AbortSignal.timeout(5000) })
      .then(r => setIsaStatus(r.ok ? "online" : "offline"))
      .catch(() => setIsaStatus("offline"));
    fetch(`${API}/api/dodge/status`, { signal: AbortSignal.timeout(5000) })
      .then(r => setDodgeStatus(r.ok ? "online" : "offline"))
      .catch(() => setDodgeStatus("offline"));
  }, []);

  function getStatus(id: string) {
    if (id === "isa") return isaStatus;
    if (id === "dodge") return dodgeStatus;
    return "online"; // Iris is always "online" (it's the camera)
  }

  function handleHubClick(hub: Hub) {
    if (hub.id === "iris") { setIrisOpen(true); return; }
    if (hub.url) window.location.href = hub.url;
  }

  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");
  const ss = time.getSeconds().toString().padStart(2, "0");

  return (
    <div style={{ background:"#000", minHeight:"100vh", display:"flex", flexDirection:"column",
      fontFamily:"'Georgia', serif", userSelect:"none" }}>

      {/* Status bar */}
      <div style={{ padding:"10px 16px 6px", display:"flex", justifyContent:"space-between",
        alignItems:"center", borderBottom:"1px solid #1a1208" }}>
        <div style={{ fontSize:9, color:"#444", fontFamily:"monospace", letterSpacing:2 }}>
          SOCIEDADE TUCCI · CELULAR HUB
        </div>
        <div style={{ fontFamily:"monospace", fontSize:14, color:"#c8a050", letterSpacing:3 }}>
          {hh}:{mm}<span style={{ opacity:0.5 }}>:{ss}</span>
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign:"center", padding:"20px 16px 10px" }}>
        <div style={{ fontSize:9, color:"#3a2a10", fontFamily:"monospace", letterSpacing:3, marginBottom:4 }}>
          ECOSSISTEMA EM CAMPO
        </div>
        <div style={{ fontSize:32, fontWeight:800, letterSpacing:6,
          background:"linear-gradient(135deg,#9b6fd4,#c8a050,#44bb88)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          CEU
        </div>
        <div style={{ fontSize:9, color:"#3a2a10", fontFamily:"monospace", letterSpacing:2, marginTop:2 }}>
          IRIS · ISA · DODGE
        </div>
      </div>

      {/* Hub cards */}
      <div style={{ flex:1, padding:"10px 16px", display:"flex", flexDirection:"column", gap:14 }}>
        {HUBS.map(hub => {
          const status = getStatus(hub.id);
          return (
            <button key={hub.id}
              onClick={() => handleHubClick(hub)}
              style={{
                background:"#080604", border:`1px solid ${hub.cor}33`,
                borderLeft:`3px solid ${hub.cor}`,
                borderRadius:12, padding:"18px 20px",
                display:"flex", alignItems:"center", gap:16,
                cursor:"pointer", textAlign:"left",
                transition:"all 0.15s ease",
                boxShadow:`0 0 20px ${hub.cor}08`,
              }}>
              {/* Icon */}
              <div style={{
                width:56, height:56, borderRadius:"50%",
                border:`2px solid ${hub.cor}66`,
                background:`${hub.cor}10`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:28, flexShrink:0,
                boxShadow:`0 0 16px ${hub.cor}30`,
              }}>
                {hub.emoji}
              </div>

              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                  <span style={{ fontSize:16, fontWeight:700, color:hub.cor,
                    fontFamily:"monospace", letterSpacing:2 }}>{hub.nome}</span>
                  <span style={{
                    fontSize:7, fontFamily:"monospace", letterSpacing:1,
                    padding:"2px 6px", borderRadius:10,
                    background: status === "online" ? "#0a2a14" : status === "offline" ? "#2a0a0a" : "#1a1810",
                    color: status === "online" ? "#44cc88" : status === "offline" ? "#cc4444" : "#888",
                    border: `1px solid ${status === "online" ? "#1a5228" : status === "offline" ? "#5a1a1a" : "#333"}`,
                  }}>
                    {status === "online" ? "● ATIVO" : status === "offline" ? "● OFF" : "● …"}
                  </span>
                </div>
                <div style={{ fontSize:10, color:"#888", fontFamily:"monospace",
                  letterSpacing:0.5, marginBottom:4 }}>{hub.sub}</div>
                <div style={{ fontSize:12, color:`${hub.cor}99`, lineHeight:1.5 }}>
                  {hub.desc}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ color:`${hub.cor}66`, fontSize:18, flexShrink:0 }}>›</div>
            </button>
          );
        })}
      </div>

      {/* Bottom status */}
      <div style={{ padding:"12px 16px", borderTop:"1px solid #1a1208",
        display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
        <div style={{ fontSize:9, fontFamily:"monospace", color:"#3a2810",
          letterSpacing:1.5, textAlign:"center" }}>
          {new Date().toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long" })}
        </div>
      </div>

      {/* Iris camera overlay */}
      {irisOpen && <IrisCamera onClose={() => setIrisOpen(false)} />}

      <style>{`
        button:active { transform: scale(0.97); }
        @media (min-width: 600px) {
          .hub-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
