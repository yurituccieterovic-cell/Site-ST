import React from "react";

export function CalcPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#07090f", color: "#e2e8f0", fontFamily: "Georgia, serif" }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #1e2a1e", padding: "14px 24px", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, background: "#07090f", zIndex: 50 }}>
        {/* Ábaco — coruja-do-mato SVG */}
        <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" style={{ width: 32, height: 32 }}>
          <ellipse cx="48" cy="54" rx="26" ry="28" fill="#5a3e28" />
          <ellipse cx="48" cy="60" rx="18" ry="14" fill="#8b6340" />
          <ellipse cx="48" cy="36" rx="16" ry="18" fill="#5a3e28" />
          <ellipse cx="48" cy="32" rx="11" ry="13" fill="#4a3020" />
          <ellipse cx="42" cy="28" rx="5" ry="5.5" fill="#1a1008" />
          <ellipse cx="54" cy="28" rx="5" ry="5.5" fill="#1a1008" />
          <ellipse cx="42" cy="27" rx="2.5" ry="2.5" fill="#d4a847" />
          <ellipse cx="54" cy="27" rx="2.5" ry="2.5" fill="#d4a847" />
          <path d="M44 40 Q48 43 52 40" stroke="#c8892a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M32 48 Q22 44 24 36" stroke="#5a3e28" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M64 48 Q74 44 72 36" stroke="#5a3e28" strokeWidth="6" strokeLinecap="round" fill="none" />
        </svg>
        <span style={{ color: "#d4a847", fontWeight: 700, fontSize: 17, letterSpacing: 1 }}>S.T. Calculus</span>
        <span style={{ color: "#2d3a2d", fontSize: 13, marginLeft: 6 }}>Financeiro & Contabilidade</span>
        <div style={{ marginLeft: "auto" }}>
          <span style={{ background: "#1a2a1a", border: "1px solid #d4a84755", borderRadius: 12, padding: "3px 12px", fontSize: 11, color: "#d4a847", fontWeight: 600 }}>EM BREVE</span>
        </div>
      </header>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "3.5rem 1.5rem 2.5rem", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "inline-block", background: "#1a2a1a", border: "1px solid #d4a84733", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: "#d4a847", fontWeight: 600, marginBottom: 20, letterSpacing: 1 }}>
          🦉 Ábaco · Assistente Financeiro
        </div>
        <h1 style={{ fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 800, lineHeight: 1.25, marginBottom: 16, color: "#f1f5f9" }}>
          Financeiro e contabilidade<br />
          <span style={{ color: "#d4a847" }}>que enxerga no escuro.</span>
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.7, marginBottom: 28, maxWidth: 440, margin: "0 auto 28px" }}>
          Calculus é o motor financeiro da Sociedade Tucci — plano de contas, fluxo de caixa, DRE, impostos e conciliação bancária para MEI, autônomos e pequenas empresas.
        </p>
        <div style={{ display: "inline-block", background: "#1a2a1a", border: "1px solid #d4a84744", borderRadius: 10, padding: "12px 28px", color: "#94a3b8", fontSize: 14 }}>
          🔨 Em desenvolvimento — Assembleia #704
        </div>
      </section>

      {/* O que é */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 3rem" }}>
        <div style={{ background: "#0d150d", border: "1px solid #1e2a1e", borderRadius: 14, padding: "24px" }}>
          <h2 style={{ color: "#d4a847", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>🧮 O que é o Calculus</h2>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
            Sistema de <strong style={{ color: "#e2e8f0" }}>financeiro e contabilidade</strong> para profissionais autônomos, MEI e pequenas empresas. Deliberado na Assembleia #704 como núcleo base do <strong style={{ color: "#d4a847" }}>Sistema Sócia</strong> — ERP simplificado com CRM, RH, Projetos e Financeiro integrados.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 0 }}>
            {[
              { icon: "📊", nome: "Fluxo de Caixa", desc: "Entradas, saídas e saldo em tempo real." },
              { icon: "📋", nome: "DRE e Balanço", desc: "Demonstrativos financeiros automáticos." },
              { icon: "🧾", nome: "Impostos", desc: "DAS, ISS, IRPF/IRPJ — apuração automática." },
              { icon: "🏦", nome: "Conciliação", desc: "OFX e Open Finance para importar extratos." },
              { icon: "📄", nome: "NF-e", desc: "Emissão de notas fiscais eletrônicas." },
              { icon: "🤖", nome: "Ábaco IA", desc: "Assistente financeiro 24h — nunca erra contas." },
            ].map(f => (
              <div key={f.nome} style={{ background: "#07090f", border: "1px solid #1e2a1e", borderRadius: 10, padding: "14px" }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0", marginBottom: 3 }}>{f.nome}</div>
                <div style={{ color: "#64748b", fontSize: 12, lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sócia */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 3rem" }}>
        <div style={{ background: "#0d0d1a", border: "1px solid #2a1e3e", borderRadius: 14, padding: "24px" }}>
          <h2 style={{ color: "#a78bfa", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>🦜 Sistema Sócia — ERP Simplificado</h2>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
            <strong style={{ color: "#e2e8f0" }}>Sócia</strong> é o sistema integrado que constrói sobre o Calculus — a sua <em>sócia digital</em>. Combina CRM, RH, Projetos, Financeiro (Calculus), Agenda (Age quando for consultório) e Assembleia Interna de IAs.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["CRM", "RH básico", "Projetos", "Calculus (finance)", "Age (clínicas)", "Assembleia IA"].map(m => (
              <span key={m} style={{ background: "#1a1030", border: "1px solid #a78bfa44", borderRadius: 8, padding: "4px 12px", fontSize: 12, color: "#a78bfa" }}>{m}</span>
            ))}
          </div>
          <p style={{ color: "#475569", fontSize: 12, marginTop: 16, lineHeight: 1.6 }}>
            Mascote: <strong style={{ color: "#a78bfa" }}>Arara-canindé</strong> (Ara ararauna) — azul-cobalto e amarelo-ouro. Símbolo de parceria e inteligência social. A sua sócia, não apenas uma ferramenta.
          </p>
        </div>
      </section>

      {/* Interesse */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 20px 4rem", textAlign: "center" }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: "#e2e8f0", marginBottom: 10 }}>Interesse em usar o Calculus?</h2>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Deixe seu email e avisamos quando lançar.</p>
        <a href="mailto:contato@sociedadetucci.com.br?subject=Interesse Calculus" style={{ display: "inline-block", background: "#1a2a1a", border: "1px solid #d4a84766", color: "#d4a847", fontWeight: 600, fontSize: 14, padding: "12px 32px", borderRadius: 10, textDecoration: "none" }}>
          contato@sociedadetucci.com.br
        </a>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #1e2a1e", padding: "20px 24px", textAlign: "center" }}>
        <div style={{ color: "#1e2a1e", fontSize: 11, lineHeight: 1.8 }}>
          S. T. Calculus · v0.1 · 2026 · Deliberado na Assembleia #704<br />
          🦉 Ábaco — vê no escuro, enxerga números ocultos
        </div>
      </footer>
    </div>
  );
}
