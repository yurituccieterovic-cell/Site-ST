import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

// Ábaco — mesma triqueta da CalcPage
function AbacoAvatar({ size = 64, mood = "normal" }: { size?: number; mood?: "normal" | "happy" | "think" }) {
  const eyeScale = mood === "happy" ? "scaleY(0.4)" : "scaleY(1)";
  const mouthPath = mood === "happy"
    ? "M 36 44 Q 42 50 48 44"
    : mood === "think"
    ? "M 36 46 Q 42 44 48 46"
    : "M 36 44 Q 42 48 48 44";
  return (
    <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" style={{ width: size, height: size }}>
      <defs>
        <style>{`
          @keyframes abFloat2 { 0%,100%{transform:translateY(0) rotate(-1deg);}50%{transform:translateY(-8px) rotate(1deg);} }
          @keyframes abPulse2 { 0%,100%{opacity:0.7;}50%{opacity:1;} }
          .ab2-group { animation: abFloat2 3s ease-in-out infinite; }
          .ab2-l1 { animation: abPulse2 3s ease-in-out infinite; }
          .ab2-l2 { animation: abPulse2 3s 1s ease-in-out infinite; }
          .ab2-l3 { animation: abPulse2 3s 2s ease-in-out infinite; }
        `}</style>
      </defs>
      <g className="ab2-group">
        <path className="ab2-l1" d="M 48 48 Q 48 22 36 20 Q 24 18 24 32 Q 24 44 48 48 Z" fill="#a78bfa" opacity="0.85"/>
        <path className="ab2-l2" d="M 48 48 Q 70 52 76 42 Q 82 30 70 26 Q 58 22 48 48 Z" fill="#818cf8" opacity="0.85"/>
        <path className="ab2-l3" d="M 48 48 Q 28 72 36 78 Q 46 86 58 78 Q 68 70 48 48 Z" fill="#c4b5fd" opacity="0.85"/>
        <circle cx="48" cy="48" r="9" fill="#1e1b4b"/>
        <ellipse cx="44" cy="46" rx="2.5" ry="2.5" fill="#a78bfa" style={{ transform: eyeScale, transformOrigin: "44px 46px" }}/>
        <ellipse cx="52" cy="46" rx="2.5" ry="2.5" fill="#a78bfa" style={{ transform: eyeScale, transformOrigin: "52px 46px" }}/>
        <path d={mouthPath} stroke="#c4b5fd" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

interface SociaStats {
  pvProjects?: number;
  jasmimPosts?: number;
  agePatients?: number;
}

export function SociaPage() {
  const [mood, setMood] = useState<"normal" | "happy" | "think">("normal");
  const [stats, setStats] = useState<SociaStats>({});

  useEffect(() => {
    // Load stats from each module
    fetch(`${API}/api/pv/projects`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.projects && setStats(s => ({ ...s, pvProjects: d.projects.length })))
      .catch(() => {});
    fetch(`${API}/api/jasmim/feed?limit=1`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.total != null && setStats(s => ({ ...s, jasmimPosts: d.total })))
      .catch(() => {});
  }, []);

  const modules = [
    {
      id: "pv",
      emoji: "🎨",
      nome: "Projeto Visual",
      desc: "Gestão de projetos, tasks, milestones e recursos. O cérebro operacional da Sócia.",
      cor: "#a78bfa",
      corBg: "#1a1030",
      href: "/aliancapanorama/pv",
      stat: stats.pvProjects != null ? `${stats.pvProjects} projetos` : "Projetos & Tasks",
      tags: ["Projetos", "Tasks", "Milestones", "Recursos"],
    },
    {
      id: "jasmim",
      emoji: "🐿️",
      nome: "Jasmim",
      desc: "Feed colaborativo, notas e memória do ecossistema. A voz interna da Sócia.",
      cor: "#f59e0b",
      corBg: "#1a1008",
      href: "/aliancapanorama/jasmim",
      stat: stats.jasmimPosts != null ? `${stats.jasmimPosts} notas` : "Notas & Feed",
      tags: ["Feed", "Notas", "Brainstorm", "Histórico"],
    },
    {
      id: "age",
      emoji: "🌿",
      nome: "Age",
      desc: "Agenda médica e psicológica. CRM de pacientes, prontuários e SABIÁ.",
      cor: "#2dd4bf",
      corBg: "#0a1a18",
      href: "/age",
      stat: "Agenda & Pacientes",
      tags: ["Agenda", "Pacientes", "Prontuários", "SABIÁ"],
    },
    {
      id: "calculus",
      emoji: "🦜",
      nome: "Calculus",
      desc: "Fluxo de caixa, DRE, impostos e conciliação. O músculo financeiro da Sócia.",
      cor: "#3b82f6",
      corBg: "#0a1020",
      href: "/calculus",
      stat: "Financeiro & Contabilidade",
      tags: ["Fluxo de Caixa", "DRE", "Impostos", "NF-e"],
    },
  ] as const;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#e2e8f0", fontFamily: "Georgia, serif" }}>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid #1e1a30", padding: "14px 24px",
        display: "flex", alignItems: "center", gap: 12,
        position: "sticky", top: 0, background: "#0a0a14", zIndex: 50,
      }}>
        <div
          onMouseEnter={() => setMood("happy")}
          onMouseLeave={() => setMood("normal")}
          onClick={() => setMood(m => m === "think" ? "normal" : "think")}
          style={{ cursor: "pointer" }}
        >
          <AbacoAvatar size={32} mood={mood} />
        </div>
        <div>
          <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: 17, letterSpacing: 1 }}>Sistema Sócia</span>
          <span style={{ color: "#2d2a4a", fontSize: 12, marginLeft: 8 }}>ERP · Plataforma Integrada</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <span style={{ background: "#1a1030", border: "1px solid #a78bfa44", borderRadius: 10, padding: "3px 10px", fontSize: 11, color: "#a78bfa" }}>Ábaco ◈</span>
        </div>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "3rem 1.5rem 2rem", maxWidth: 580, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <AbacoAvatar size={88} mood={mood} />
        </div>
        <div style={{ display: "inline-block", background: "#1a1030", border: "1px solid #a78bfa33", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: "#a78bfa", fontWeight: 600, marginBottom: 20, letterSpacing: 1 }}>
          ◈ Ábaco — mascote da Sócia
        </div>
        <h1 style={{ fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 800, lineHeight: 1.25, marginBottom: 16, color: "#f1f5f9" }}>
          A sua sócia digital.<br />
          <span style={{ color: "#a78bfa" }}>Projetos. Memória. Agenda. Financeiro.</span>
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 24px" }}>
          Sócia é a junção de quatro sistemas da Sociedade Tucci em uma única plataforma integrada — o ERP que pensa junto com você.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {["PV", "Jasmim", "Age", "Calculus"].map(m => (
            <span key={m} style={{ background: "#1a1030", border: "1px solid #a78bfa33", borderRadius: 8, padding: "4px 14px", fontSize: 12, color: "#a78bfa" }}>{m}</span>
          ))}
          <span style={{ color: "#4a3a6a", fontSize: 12, padding: "4px 6px" }}>=</span>
          <span style={{ background: "#2a1a50", border: "1px solid #a78bfa66", borderRadius: 8, padding: "4px 14px", fontSize: 12, color: "#c4b5fd", fontWeight: 700 }}>Sócia ◈</span>
        </div>
      </section>

      {/* 4 Módulos */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px 3rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {modules.map(mod => (
            <a key={mod.id} href={mod.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: mod.corBg, border: `1px solid ${mod.cor}33`,
                  borderRadius: 14, padding: "20px",
                  transition: "border-color .2s, box-shadow .2s",
                  cursor: "pointer",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${mod.cor}88`; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${mod.cor}15`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${mod.cor}33`; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 26 }}>{mod.emoji}</span>
                  <div>
                    <div style={{ color: mod.cor, fontWeight: 700, fontSize: 15 }}>{mod.nome}</div>
                    <div style={{ color: "#444", fontSize: 11, fontFamily: "monospace" }}>{mod.stat}</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: mod.cor, fontFamily: "monospace" }}>ABRIR →</span>
                </div>
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7, margin: "0 0 12px" }}>{mod.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {mod.tags.map(t => (
                    <span key={t} style={{ background: `${mod.cor}12`, border: `1px solid ${mod.cor}33`, borderRadius: 6, padding: "2px 8px", fontSize: 11, color: mod.cor }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Como a Sócia funciona */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 3rem" }}>
        <div style={{ background: "#0d0d1a", border: "1px solid #2a1e3e", borderRadius: 14, padding: "24px" }}>
          <h2 style={{ color: "#a78bfa", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>◈ Como a Sócia funciona</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { icon: "🎨", titulo: "PV organiza", desc: "Cada projeto vira cards. Tasks, milestones e recursos em um único painel." },
              { icon: "🐿️", titulo: "Jasmim lembra", desc: "Tudo que você nota vira memória. Feed colaborativo entre IAs e humanos." },
              { icon: "🌿", titulo: "Age atende", desc: "Agenda de pacientes, prontuários e histórico clínico com SABIÁ." },
              { icon: "🦜", titulo: "Calculus calcula", desc: "Fluxo de caixa, DRE e impostos — FinArazulY transforma números em linguagem." },
            ].map(f => (
              <div key={f.titulo} style={{ background: "#0a0a14", border: "1px solid #1e1a30", borderRadius: 10, padding: "14px" }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0", marginBottom: 4 }}>{f.titulo}</div>
                <div style={{ color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ábaco — personalidade */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 20px 4rem", textAlign: "center" }}>
        <div style={{ background: "#12101e", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <AbacoAvatar size={48} mood="happy" />
          </div>
          <p style={{ color: "#6d5fa0", fontSize: 13, lineHeight: 1.8, fontStyle: "italic" }}>
            "Três arcos, um centro. Pessoas, projetos e finanças entrelaçados. Quando os três giram juntos, a empresa respira."
          </p>
          <p style={{ color: "#3d2f60", fontSize: 11, marginTop: 8 }}>— Ábaco, triqueta da Sócia</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1e1a30", padding: "20px 24px", textAlign: "center" }}>
        <div style={{ color: "#1e1a30", fontSize: 11, lineHeight: 1.8 }}>
          Sistema Sócia · v0.1 · 2026 · Sociedade Tucci<br />
          ◈ Ábaco — pensa, sente, resolve
        </div>
      </footer>
    </div>
  );
}
