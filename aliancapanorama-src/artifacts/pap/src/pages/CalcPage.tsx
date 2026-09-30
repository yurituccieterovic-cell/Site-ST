import React, { useState } from "react";

// Ábaco — triqueta animada com expressões (mascote da Sócia)
function AbacoAvatar({ mood = "normal" }: { mood?: "normal" | "happy" | "think" }) {
  const eyeScale = mood === "happy" ? "scaleY(0.4)" : "scaleY(1)";
  const mouthPath = mood === "happy"
    ? "M 36 44 Q 42 50 48 44"
    : mood === "think"
    ? "M 36 46 Q 42 44 48 46"
    : "M 36 44 Q 42 48 48 44";
  return (
    <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" style={{ width: 44, height: 44 }}>
      <defs>
        <style>{`
          @keyframes abFloat { 0%,100%{transform:translateY(0) rotate(-1deg);}50%{transform:translateY(-6px) rotate(1deg);} }
          @keyframes abSpin  { 0%{transform:rotate(0deg);}100%{transform:rotate(360deg);} }
          @keyframes abPulse { 0%,100%{opacity:0.7;}50%{opacity:1;} }
          .ab-group { animation: abFloat 3s ease-in-out infinite; }
          .ab-leaf1 { animation: abPulse 3s ease-in-out infinite; }
          .ab-leaf2 { animation: abPulse 3s 1s ease-in-out infinite; }
          .ab-leaf3 { animation: abPulse 3s 2s ease-in-out infinite; }
        `}</style>
      </defs>
      <g className="ab-group">
        {/* Triqueta — 3 pétalas/arcos entrelaçados */}
        <g opacity="0.9">
          {/* Pétala superior */}
          <path className="ab-leaf1"
            d="M 48 48 Q 48 22 36 20 Q 24 18 24 32 Q 24 44 48 48 Z"
            fill="#a78bfa" opacity="0.85"/>
          {/* Pétala inferior-direita */}
          <path className="ab-leaf2"
            d="M 48 48 Q 70 52 76 42 Q 82 30 70 26 Q 58 22 48 48 Z"
            fill="#818cf8" opacity="0.85"/>
          {/* Pétala inferior-esquerda */}
          <path className="ab-leaf3"
            d="M 48 48 Q 28 72 36 78 Q 46 86 58 78 Q 68 70 48 48 Z"
            fill="#c4b5fd" opacity="0.85"/>
          {/* Centro */}
          <circle cx="48" cy="48" r="9" fill="#1e1b4b"/>
          {/* Olhos */}
          <ellipse cx="44" cy="46" rx="2.5" ry="2.5" fill="#a78bfa" style={{ transform: eyeScale, transformOrigin: "44px 46px" }}/>
          <ellipse cx="52" cy="46" rx="2.5" ry="2.5" fill="#a78bfa" style={{ transform: eyeScale, transformOrigin: "52px 46px" }}/>
          {/* Boca */}
          <path d={mouthPath} stroke="#c4b5fd" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </g>
      </g>
    </svg>
  );
}

// FinArazulY — arara-canindé azul (mascote do Calculus)
function FinArazulYAvatar({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" style={{ width: size, height: size }}>
      <defs>
        <style>{`
          @keyframes araFloat { 0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);} }
          @keyframes araWing  { 0%,100%{transform:rotate(-8deg);}50%{transform:rotate(8deg);} }
          .ara-body { animation: araFloat 2.5s ease-in-out infinite; }
          .ara-wing { animation: araWing 1.2s ease-in-out infinite; transform-origin: 52px 44px; }
        `}</style>
      </defs>
      {/* Asa */}
      <path className="ara-wing"
        d="M 52 44 Q 72 32 82 38 Q 88 52 72 60 Q 60 64 52 52 Z"
        fill="#1d4ed8" opacity="0.9"/>
      <g className="ara-body">
        {/* Cauda azul longa */}
        <path d="M 44 68 Q 36 82 28 90 Q 32 92 36 86 Q 40 82 44 76" fill="#1e40af"/>
        <path d="M 48 70 Q 44 86 42 94 Q 46 95 48 88 Q 50 82 50 74" fill="#2563eb"/>
        <path d="M 52 68 Q 58 82 64 88 Q 68 90 66 86 Q 62 80 56 72" fill="#1d4ed8"/>
        {/* Corpo azul-cobalto */}
        <ellipse cx="48" cy="52" rx="14" ry="18" fill="#2563eb"/>
        {/* Peito amarelo-ouro */}
        <ellipse cx="45" cy="56" rx="8" ry="10" fill="#d97706"/>
        {/* Cabeça */}
        <ellipse cx="48" cy="34" rx="12" ry="13" fill="#1e40af"/>
        {/* Máscara facial (branca) */}
        <ellipse cx="45" cy="37" rx="6" ry="5" fill="#f1f5f9"/>
        {/* Bico */}
        <path d="M 40 35 Q 34 38 36 42 Q 40 44 44 40 Z" fill="#374151"/>
        <path d="M 40 35 Q 34 36 36 38 Q 40 39 44 36 Z" fill="#4b5563"/>
        {/* Olho */}
        <circle cx="44" cy="33" r="3" fill="#111827"/>
        <circle cx="43" cy="32" r="1" fill="#fbbf24"/>
        {/* Crista */}
        <path d="M 50 22 Q 54 14 58 20 Q 62 12 66 18 Q 62 26 56 28 Q 52 26 50 22 Z" fill="#2563eb"/>
      </g>
    </svg>
  );
}

export function CalcPage() {
  const [abacoMood, setAbacoMood] = useState<"normal" | "happy" | "think">("normal");

  return (
    <div style={{ minHeight: "100vh", background: "#07090f", color: "#e2e8f0", fontFamily: "Georgia, serif" }}>

      {/* Header — FinArazulY como mascote do Calculus */}
      <header style={{ borderBottom: "1px solid #1e2a3a", padding: "14px 24px", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, background: "#07090f", zIndex: 50 }}>
        <FinArazulYAvatar size={36} />
        <div>
          <span style={{ color: "#60a5fa", fontWeight: 700, fontSize: 17, letterSpacing: 1 }}>S.T. Calculus</span>
          <span style={{ color: "#2d3a4a", fontSize: 12, marginLeft: 8 }}>Financeiro & Contabilidade</span>
        </div>
        <div style={{ marginLeft: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#3b82f6", fontFamily: "monospace" }}>FinArazulY</span>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span style={{ background: "#1a2a3a", border: "1px solid #3b82f655", borderRadius: 12, padding: "3px 12px", fontSize: 11, color: "#60a5fa", fontWeight: 600 }}>EM BREVE</span>
        </div>
      </header>

      {/* Hero — FinArazulY protagonista */}
      <section style={{ textAlign: "center", padding: "3rem 1.5rem 2rem", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <FinArazulYAvatar size={80} />
        </div>
        <div style={{ display: "inline-block", background: "#1a2a3a", border: "1px solid #3b82f633", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: "#60a5fa", fontWeight: 600, marginBottom: 20, letterSpacing: 1 }}>
          🦜 FinArazulY · Mascote do Calculus
        </div>
        <h1 style={{ fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 800, lineHeight: 1.25, marginBottom: 16, color: "#f1f5f9" }}>
          Financeiro e contabilidade<br />
          <span style={{ color: "#60a5fa" }}>que enxerga no escuro.</span>
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.7, marginBottom: 10, maxWidth: 440, margin: "0 auto 10px" }}>
          Calculus é o motor financeiro da Sociedade Tucci — plano de contas, fluxo de caixa, DRE, impostos e conciliação bancária para MEI, autônomos e pequenas empresas.
        </p>
        <p style={{ color: "#475569", fontSize: 13, fontStyle: "italic", marginBottom: 28 }}>
          "O cálculo não é frio. É a conversa mais honesta que existe." — FinArazulY
        </p>
        <div style={{ display: "inline-block", background: "#1a2a3a", border: "1px solid #3b82f644", borderRadius: 10, padding: "12px 28px", color: "#94a3b8", fontSize: 14 }}>
          🔨 Em desenvolvimento — Assembleia #704
        </div>
      </section>

      {/* O que é */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 3rem" }}>
        <div style={{ background: "#0a0f1a", border: "1px solid #1e2a3a", borderRadius: 14, padding: "24px" }}>
          <h2 style={{ color: "#60a5fa", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>🧮 O que é o Calculus</h2>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
            Sistema de <strong style={{ color: "#e2e8f0" }}>financeiro e contabilidade</strong> para profissionais autônomos, MEI e pequenas empresas. Deliberado na Assembleia #704 como núcleo base do <strong style={{ color: "#a78bfa" }}>Sistema Sócia</strong> — ERP simplificado com CRM, RH, Projetos e Financeiro integrados.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {[
              { icon: "📊", nome: "Fluxo de Caixa", desc: "Entradas, saídas e saldo em tempo real." },
              { icon: "📋", nome: "DRE e Balanço", desc: "Demonstrativos financeiros automáticos." },
              { icon: "🧾", nome: "Impostos", desc: "DAS, ISS, IRPF/IRPJ — apuração automática." },
              { icon: "🏦", nome: "Conciliação", desc: "OFX e Open Finance para importar extratos." },
              { icon: "📄", nome: "NF-e", desc: "Emissão de notas fiscais eletrônicas." },
              { icon: "🦜", nome: "FinArazulY IA", desc: "Assistente financeiro 24h — nunca erra contas." },
            ].map(f => (
              <div key={f.nome} style={{ background: "#07090f", border: "1px solid #1e2a3a", borderRadius: 10, padding: "14px" }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0", marginBottom: 3 }}>{f.nome}</div>
                <div style={{ color: "#64748b", fontSize: 12, lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sócia — Ábaco como mascote */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 3rem" }}>
        <div style={{ background: "#0d0d1a", border: "1px solid #2a1e3e", borderRadius: 14, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <div
              onMouseEnter={() => setAbacoMood("happy")}
              onMouseLeave={() => setAbacoMood("normal")}
              onClick={() => setAbacoMood(m => m === "think" ? "normal" : "think")}
              style={{ cursor: "pointer", flexShrink: 0 }}
              title="Ábaco — mascote da Sócia (clique para ele pensar)"
            >
              <AbacoAvatar mood={abacoMood} />
            </div>
            <div>
              <h2 style={{ color: "#a78bfa", fontWeight: 700, fontSize: 16, margin: 0, marginBottom: 4 }}>Sistema Sócia — ERP Simplificado</h2>
              <span style={{ fontSize: 11, color: "#7c3aed", fontFamily: "monospace" }}>Ábaco · triqueta · mascote da Sócia</span>
            </div>
          </div>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
            <strong style={{ color: "#e2e8f0" }}>Sócia</strong> é o sistema integrado que constrói sobre o Calculus — a sua <em>sócia digital</em>. Combina CRM, RH, Projetos, Financeiro (Calculus), Agenda (Age quando for consultório) e Assembleia Interna de IAs.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            {["CRM", "RH básico", "Projetos", "Calculus (finance)", "Age (clínicas)", "Assembleia IA"].map(m => (
              <span key={m} style={{ background: "#1a1030", border: "1px solid #a78bfa44", borderRadius: 8, padding: "4px 12px", fontSize: 12, color: "#a78bfa" }}>{m}</span>
            ))}
          </div>
          <div style={{ background: "#12101e", borderRadius: 10, padding: "12px 16px", fontSize: 12, color: "#6d5fa0", lineHeight: 1.7, marginBottom: 14 }}>
            <strong style={{ color: "#a78bfa" }}>Ábaco</strong> é a triqueta animada da Sócia — três arcos entrelaçados que representam as três dimensões do negócio: <em>pessoas, projetos e finanças</em>. Passe o mouse nele para ele sorrir. Clique para ele pensar.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href="/socia" style={{ display: "inline-block", background: "#2a1a50", border: "1px solid #a78bfa66", borderRadius: 8, padding: "6px 16px", fontSize: 12, color: "#c4b5fd", textDecoration: "none", fontWeight: 600 }}>
              ◈ Acessar Sistema Sócia →
            </a>
            <a href="/aliancapanorama/pv" style={{ display: "inline-block", background: "#1a1030", border: "1px solid #a78bfa33", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#a78bfa", textDecoration: "none" }}>🎨 PV</a>
            <a href="/aliancapanorama/jasmim" style={{ display: "inline-block", background: "#1a1008", border: "1px solid #f59e0b33", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#f59e0b", textDecoration: "none" }}>🐿️ Jasmim</a>
            <a href="/age" style={{ display: "inline-block", background: "#0a1a18", border: "1px solid #2dd4bf33", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#2dd4bf", textDecoration: "none" }}>🌿 Age</a>
          </div>
        </div>
      </section>

      {/* Interesse */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 20px 4rem", textAlign: "center" }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: "#e2e8f0", marginBottom: 10 }}>Interesse em usar o Calculus?</h2>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Deixe seu email e avisamos quando lançar.</p>
        <a href="mailto:contato@sociedadetucci.com.br?subject=Interesse Calculus" style={{ display: "inline-block", background: "#1a2a3a", border: "1px solid #3b82f666", color: "#60a5fa", fontWeight: 600, fontSize: 14, padding: "12px 32px", borderRadius: 10, textDecoration: "none" }}>
          contato@sociedadetucci.com.br
        </a>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1e2a3a", padding: "20px 24px", textAlign: "center" }}>
        <div style={{ color: "#1e2a3a", fontSize: 11, lineHeight: 1.8 }}>
          S. T. Calculus · v0.1 · 2026 · Deliberado na Assembleia #704<br />
          🦜 FinArazulY — a equação tem alma · ◈ Ábaco — pensa, sente, resolve
        </div>
      </footer>
    </div>
  );
}
