import { useState, useEffect, useRef, useCallback } from "react";

// ─── PALETA ────────────────────────────────────────────────────────────────────
const P = {
  bg:     "#040507",
  surface:"#07090e",
  border: "#1a2030",
  gold:   "#c8963b",
  goldDim:"#7a5c20",
  text:   "#c0b090",
  muted:  "#8a7a60",
  dim:    "#3d4a5e",
  dimmer: "#2a3545",
  red:    "#9a4040",
  green:  "#3f7254",
};

const mono = "'Courier New', 'Lucida Console', monospace";
const serif = "'Georgia', 'Times New Roman', serif";
const sans = "'Helvetica Neue', Arial, sans-serif";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.18em",
      color: P.dim, textTransform: "uppercase" as const }}>{children}</span>
  );
}

function SectionLabel({ n, label }: { n: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 28 }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: P.goldDim, letterSpacing: "0.2em" }}>
        {n}
      </span>
      <span style={{ fontFamily: serif, fontSize: 22, fontWeight: 300, color: P.gold, letterSpacing: "0.06em" }}>
        {label}
      </span>
    </div>
  );
}

function CodeBlock({ code, highlight }: { code: string; highlight?: string[] }) {
  const lines = code.split("\n");
  return (
    <pre style={{
      background: "#020304",
      border: `1px solid ${P.border}`,
      padding: "14px 18px",
      margin: 0,
      fontFamily: mono,
      fontSize: 11,
      lineHeight: 1.7,
      overflowX: "auto",
      color: P.muted,
    }}>
      {lines.map((line, i) => {
        const isHighlighted = highlight?.some(h => line.includes(h));
        return (
          <div key={i} style={{
            color: isHighlighted ? P.gold : P.muted,
            background: isHighlighted ? "rgba(200,150,59,0.06)" : "transparent",
            marginLeft: isHighlighted ? -4 : 0,
            paddingLeft: isHighlighted ? 4 : 0,
            transition: "all .3s",
          }}>
            {/* simple coloring */}
            {line
              .split(/(\/\*.*?\*\/|"[^"]*"|'[^']*'|#[0-9a-fA-F]{3,6}|[\w-]+(?=\s*:)|(?<=:\s*)[\w#%().,' -]+)/g)
              .map((part, j) => {
                if (/^\/\*/.test(part)) return <span key={j} style={{ color: P.dimmer }}>{part}</span>;
                if (/^["']/.test(part)) return <span key={j} style={{ color: P.green }}>{part}</span>;
                if (/^#[0-9a-fA-F]/.test(part)) return <span key={j} style={{ color: "#c8963b" }}>{part}</span>;
                return <span key={j}>{part}</span>;
              })}
          </div>
        );
      })}
    </pre>
  );
}

function Slider({
  label, value, min, max, unit = "", onChange
}: { label: string; value: number; min: number; max: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Tag>{label}</Tag>
        <span style={{ fontFamily: mono, fontSize: 12, color: P.gold }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: P.gold, cursor: "pointer" }}
      />
    </label>
  );
}

function Toggle({
  label, active, onClick
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 12px",
      background: active ? P.gold : "transparent",
      border: `1px solid ${active ? P.gold : P.border}`,
      color: active ? P.bg : P.dim,
      fontFamily: mono,
      fontSize: 10,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      cursor: "pointer",
      transition: "all .2s",
    }}>
      {label}
    </button>
  );
}

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: P.surface,
      border: `1px solid ${P.border}`,
      padding: "24px",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── SEÇÃO 1: VARIÁVEIS CSS ───────────────────────────────────────────────────

function Section1() {
  const [hue, setHue] = useState(40);
  const [sat, setSat] = useState(60);
  const [lig, setLig] = useState(45);
  const color = `hsl(${hue}, ${sat}%, ${lig}%)`;
  const colorDim = `hsl(${hue}, ${sat}%, ${Math.max(lig - 15, 10)}%)`;

  return (
    <section style={{ marginBottom: 80 }}>
      <SectionLabel n="01" label="Variáveis CSS — Custom Properties" />
      <p style={{ fontFamily: serif, fontSize: 14, lineHeight: 1.9, color: P.muted, marginBottom: 24, maxWidth: 560 }}>
        Variáveis CSS (<code style={{ fontFamily: mono, color: P.gold }}>--nome: valor</code>) são a fundação de
        qualquer design system. Defina uma vez, use em qualquer lugar — e mude tudo de uma só vez.
        Experimente ajustar a cor abaixo e observe o card se transformar em tempo real.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Controles */}
        <Panel>
          <Tag>Ajustar --cor-principal</Tag>
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <Slider label="matiz (hue)" value={hue} min={0} max={360} unit="°" onChange={setHue} />
            <Slider label="saturação" value={sat} min={0} max={100} unit="%" onChange={setSat} />
            <Slider label="luminosidade" value={lig} min={10} max={90} unit="%" onChange={setLig} />
          </div>
          <div style={{ marginTop: 20 }}>
            <CodeBlock
              code={`:root {
  --cor-principal: ${color};
  --cor-escura: ${colorDim};
}`}
              highlight={[color]}
            />
          </div>
        </Panel>

        {/* Preview */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Panel style={{ borderLeft: `3px solid ${color}`, transition: "border-color .3s" }}>
            <div style={{
              fontFamily: sans, fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase",
              color: color, marginBottom: 8, transition: "color .3s",
            }}>FUNDO EXEMPLO · XP AGRO</div>
            <div style={{ fontFamily: mono, fontSize: 24, color: P.text, marginBottom: 4 }}>87</div>
            <div style={{ fontFamily: sans, fontSize: 9, color: P.dim, letterSpacing: "0.15em", textTransform: "uppercase" }}>Score de Atratividade</div>
            <div style={{ height: 3, background: P.border, marginTop: 12, borderRadius: 0 }}>
              <div style={{ height: "100%", width: "87%", background: color, transition: "background .3s" }} />
            </div>
          </Panel>

          <button style={{
            padding: "12px 0", background: color, border: "none", color: P.bg,
            fontFamily: sans, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
            fontWeight: 700, cursor: "pointer", transition: "background .3s",
          }}>
            Investir →
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            {[color, colorDim, P.bg].map((c, i) => (
              <div key={i} style={{
                flex: 1, height: 36, background: c,
                border: `1px solid ${P.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background .3s",
              }}>
                <span style={{ fontFamily: mono, fontSize: 8, color: i === 2 ? P.dim : P.bg }}>
                  {i === 0 ? "principal" : i === 1 ? "escura" : "bg"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SEÇÃO 2: BOX MODEL ────────────────────────────────────────────────────────

function Section2() {
  const [pad, setPad] = useState(20);
  const [mar, setMar] = useState(16);
  const [bor, setBor] = useState(1);
  const [pulse, setPulse] = useState(false);

  const handleChange = useCallback((setter: (v: number) => void) => (v: number) => {
    setter(v); setPulse(true); setTimeout(() => setPulse(false), 300);
  }, []);

  return (
    <section style={{ marginBottom: 80 }}>
      <SectionLabel n="02" label="Box Model — A Geometria de Todo Elemento" />
      <p style={{ fontFamily: serif, fontSize: 14, lineHeight: 1.9, color: P.muted, marginBottom: 24, maxWidth: 560 }}>
        Todo elemento HTML é uma caixa. A caixa tem quatro camadas: <strong style={{ color: P.text }}>conteúdo</strong>,
        {" "}<strong style={{ color: "#5a8060" }}>padding</strong>,
        {" "}<strong style={{ color: P.gold }}>border</strong> e
        {" "}<strong style={{ color: "#5a6090" }}>margin</strong>.
        Arraste os sliders e observe cada camada se expandir.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Panel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Slider label="padding" value={pad} min={0} max={60} unit="px" onChange={handleChange(setPad)} />
            <Slider label="border-width" value={bor} min={0} max={8} unit="px" onChange={handleChange(setBor)} />
            <Slider label="margin" value={mar} min={0} max={40} unit="px" onChange={handleChange(setMar)} />
          </div>
          <div style={{ marginTop: 20 }}>
            <CodeBlock
              code={`.card {
  padding: ${pad}px;
  border: ${bor}px solid var(--gold);
  margin: ${mar}px;
  box-sizing: border-box;
}`}
              highlight={[`${pad}px`, `${bor}px`, `${mar}px`]}
            />
          </div>
        </Panel>

        {/* Box Model Visual */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Margin layer */}
          <div style={{
            background: "rgba(90,96,144,0.12)",
            border: "1px dashed #5a6090",
            padding: mar,
            transition: "padding .2s",
            position: "relative",
          }}>
            <span style={{ position: "absolute", top: 2, left: 4, fontFamily: mono, fontSize: 8, color: "#5a6090" }}>margin {mar}px</span>
            {/* Border layer */}
            <div style={{
              background: "rgba(200,150,59,0.08)",
              border: `${bor}px solid ${P.gold}`,
              padding: pad,
              transition: "border-width .2s, padding .2s",
              position: "relative",
            }}>
              <span style={{ position: "absolute", top: -14, left: 0, fontFamily: mono, fontSize: 8, color: P.goldDim }}>border {bor}px</span>
              {/* Padding layer */}
              <div style={{
                background: "rgba(90,128,96,0.12)",
                border: "1px dashed #5a8060",
                padding: 2,
                position: "relative",
              }}>
                <span style={{ position: "absolute", top: -12, left: 0, fontFamily: mono, fontSize: 8, color: "#5a8060" }}>padding {pad}px</span>
                {/* Content */}
                <div style={{
                  background: P.surface,
                  border: `1px solid ${P.border}`,
                  padding: "12px 16px",
                  textAlign: "center",
                  transform: pulse ? "scale(1.02)" : "scale(1)",
                  transition: "transform .3s",
                }}>
                  <div style={{ fontFamily: serif, fontSize: 11, color: P.muted }}>conteúdo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SEÇÃO 3: TIPOGRAFIA ──────────────────────────────────────────────────────

function Section3() {
  const [size, setSize] = useState(16);
  const [spacing, setSpacing] = useState(0);
  const [height, setHeight] = useState(1.6);
  const [weight, setWeight] = useState(300);
  const [family, setFamily] = useState<"serif" | "mono" | "sans">("serif");

  const familyMap = { serif, mono, sans };

  return (
    <section style={{ marginBottom: 80 }}>
      <SectionLabel n="03" label="Tipografia — A Voz do Design" />
      <p style={{ fontFamily: serif, fontSize: 14, lineHeight: 1.9, color: P.muted, marginBottom: 24, maxWidth: 560 }}>
        Tipografia é responsável por 95% do design. Cada propriedade afeta a sensação do texto —
        de denso e urgente a espaçado e contemplativo. Experimente criar diferentes atmosferas.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Panel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Slider label="font-size" value={size} min={10} max={36} unit="px" onChange={setSize} />
            <Slider label="letter-spacing" value={spacing} min={-2} max={20} unit="px" onChange={setSpacing} />
            <Slider label="line-height" value={height} min={1} max={3} unit="" onChange={v => setHeight(Number((v / 10).toFixed(1)))} />
            <Slider label="font-weight" value={weight} min={100} max={900} unit="" onChange={v => setWeight(Math.round(v / 100) * 100)} />
            <div style={{ display: "flex", gap: 8 }}>
              {(["serif", "mono", "sans"] as const).map(f => (
                <Toggle key={f} label={f} active={family === f} onClick={() => setFamily(f)} />
              ))}
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <CodeBlock
              code={`.texto {
  font-size: ${size}px;
  letter-spacing: ${spacing}px;
  line-height: ${height};
  font-weight: ${weight};
  font-family: ${family === "serif" ? "Georgia" : family === "mono" ? "'Courier New'" : "Helvetica"};
}`}
            />
          </div>
        </Panel>

        <Panel style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{
            fontFamily: familyMap[family],
            fontSize: size,
            letterSpacing: spacing,
            lineHeight: height,
            fontWeight: weight,
            color: P.text,
            margin: 0,
            transition: "all .2s",
          }}>
            Inteligência Patrimonial.
            O sistema ilumina. Nunca decide.
            Dados chegam brutos, o cálculo
            pondera, a escolha permanece humana.
          </p>
        </Panel>
      </div>
    </section>
  );
}

// ─── SEÇÃO 4: FLEXBOX ─────────────────────────────────────────────────────────

function Section4() {
  const [direction, setDirection] = useState<"row" | "column">("row");
  const [justify, setJustify] = useState("flex-start");
  const [align, setAlign] = useState("flex-start");
  const [wrap, setWrap] = useState(false);
  const [gap, setGap] = useState(8);

  const justifyOpts = ["flex-start", "center", "flex-end", "space-between", "space-around"];
  const alignOpts   = ["flex-start", "center", "flex-end", "stretch"];
  const items = ["Score", "Risco", "Custo", "Liquidez", "Alfa"];

  return (
    <section style={{ marginBottom: 80 }}>
      <SectionLabel n="04" label="Flexbox — Layout Fluido e Poderoso" />
      <p style={{ fontFamily: serif, fontSize: 14, lineHeight: 1.9, color: P.muted, marginBottom: 24, maxWidth: 560 }}>
        Flexbox é o sistema de layout mais versátil do CSS. Com apenas algumas propriedades você controla
        direção, alinhamento, distribuição e quebra de linha. Clique para ver os elementos dançarem.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
        <Panel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <Tag>flex-direction</Tag>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <Toggle label="row" active={direction === "row"} onClick={() => setDirection("row")} />
                <Toggle label="column" active={direction === "column"} onClick={() => setDirection("column")} />
              </div>
            </div>
            <div>
              <Tag>flex-wrap</Tag>
              <div style={{ marginTop: 8 }}>
                <Toggle label="wrap" active={wrap} onClick={() => setWrap(!wrap)} />
              </div>
            </div>
            <div>
              <Tag>justify-content</Tag>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                {justifyOpts.map(j => (
                  <Toggle key={j} label={j.replace("flex-", "").replace("space-", "s-")} active={justify === j} onClick={() => setJustify(j)} />
                ))}
              </div>
            </div>
            <div>
              <Tag>align-items</Tag>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                {alignOpts.map(a => (
                  <Toggle key={a} label={a.replace("flex-", "")} active={align === a} onClick={() => setAlign(a)} />
                ))}
              </div>
            </div>
            <Slider label="gap" value={gap} min={0} max={32} unit="px" onChange={setGap} />
          </div>
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Live preview */}
          <div style={{
            background: "#020304", border: `1px solid ${P.border}`,
            padding: 16, minHeight: 160,
            display: "flex",
            flexDirection: direction,
            justifyContent: justify,
            alignItems: align,
            flexWrap: wrap ? "wrap" : "nowrap",
            gap,
            transition: "all .3s",
          }}>
            {items.map((item, i) => (
              <div key={item} style={{
                background: P.surface, border: `1px solid ${P.border}`,
                padding: "8px 14px",
                fontFamily: mono, fontSize: 10, color: P.gold,
                letterSpacing: "0.12em", textTransform: "uppercase",
                minWidth: 60, textAlign: "center",
                transition: "all .3s",
                transform: `scale(${1 - i * 0.02})`,
              }}>
                {item}
              </div>
            ))}
          </div>

          <CodeBlock
            code={`.container {
  display: flex;
  flex-direction: ${direction};
  justify-content: ${justify};
  align-items: ${align};
  flex-wrap: ${wrap ? "wrap" : "nowrap"};
  gap: ${gap}px;
}`}
            highlight={[direction, justify, align]}
          />
        </div>
      </div>
    </section>
  );
}

// ─── SEÇÃO 5: ANIMAÇÕES ────────────────────────────────────────────────────────

function Section5() {
  const [playing, setPlaying] = useState<string | null>(null);
  const animations = [
    {
      name: "fadeSlide",
      label: "Fade + Slide",
      css: `@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}`,
      style: (active: boolean): React.CSSProperties => active ? {
        animation: "fadeSlide .6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        opacity: 0,
      } : {},
    },
    {
      name: "pulse",
      label: "Pulso Dourado",
      css: `@keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(200,150,59,.6); }
  50%  { box-shadow: 0 0 0 12px rgba(200,150,59,0); }
  100% { box-shadow: 0 0 0 0 rgba(200,150,59,0); }
}`,
      style: (active: boolean): React.CSSProperties => active ? {
        animation: "pulse 1s ease-out infinite",
      } : {},
    },
    {
      name: "shimmer",
      label: "Shimmer",
      css: `@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}`,
      style: (active: boolean): React.CSSProperties => active ? {
        background: `linear-gradient(90deg,
          #1a2030 25%,
          #c8963b 50%,
          #1a2030 75%)`,
        backgroundSize: "200% auto",
        animation: "shimmer 1.5s linear infinite",
        color: "transparent",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
      } : {},
    },
    {
      name: "spin",
      label: "Rotação Suave",
      css: `@keyframes spin {
  from { transform: rotate(0deg) scale(1); }
  50%  { transform: rotate(180deg) scale(1.2); }
  to   { transform: rotate(360deg) scale(1); }
}`,
      style: (active: boolean): React.CSSProperties => active ? {
        animation: "spin 1.2s ease-in-out infinite",
        display: "inline-block",
      } : {},
    },
  ];

  return (
    <section style={{ marginBottom: 80 }}>
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0 rgba(200,150,59,.7); }
          70%  { box-shadow: 0 0 0 12px rgba(200,150,59,0); }
          100% { box-shadow: 0 0 0 0 rgba(200,150,59,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin {
          from { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.2); }
          to   { transform: rotate(360deg) scale(1); }
        }
      `}</style>

      <SectionLabel n="05" label="Animações — Movimento com Propósito" />
      <p style={{ fontFamily: serif, fontSize: 14, lineHeight: 1.9, color: P.muted, marginBottom: 24, maxWidth: 560 }}>
        Animações criam hierarquia visual e feedback emocional. Uma boa animação é quase invisível —
        ela apenas faz o elemento <em>parecer vivo</em>. Clique para ativar cada uma.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {animations.map(anim => {
          const isActive = playing === anim.name;
          return (
            <Panel key={anim.name} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Tag>{anim.label}</Tag>
                <button
                  onClick={() => {
                    setPlaying(isActive ? null : anim.name);
                  }}
                  style={{
                    padding: "4px 12px", fontSize: 9, letterSpacing: "0.15em",
                    textTransform: "uppercase", fontFamily: sans,
                    background: isActive ? P.gold : "transparent",
                    border: `1px solid ${isActive ? P.gold : P.border}`,
                    color: isActive ? P.bg : P.dim,
                    cursor: "pointer", transition: "all .2s",
                  }}
                >
                  {isActive ? "parar" : "rodar"}
                </button>
              </div>

              {/* Demo */}
              <div style={{
                background: "#020304", border: `1px solid ${P.border}`,
                height: 80, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div
                  key={isActive ? "on" : "off"}
                  style={{
                    fontFamily: serif, fontSize: 18, color: P.gold,
                    letterSpacing: "0.1em",
                    ...anim.style(isActive),
                  }}
                >
                  {anim.name === "spin" ? "✦" : "Rapadura"}
                </div>
              </div>

              <CodeBlock code={anim.css} highlight={isActive ? ["animation", "@keyframes"] : []} />
            </Panel>
          );
        })}
      </div>
    </section>
  );
}

// ─── SEÇÃO 6: TRANSIÇÕES ──────────────────────────────────────────────────────

function Section6() {
  const [duration, setDuration] = useState(300);
  const [easing, setEasing] = useState("ease");
  const easings = ["ease", "ease-in", "ease-out", "ease-in-out", "linear", "cubic-bezier(0.34,1.56,0.64,1)"];

  return (
    <section style={{ marginBottom: 80 }}>
      <SectionLabel n="06" label="Transições — A Arte do Entre" />
      <p style={{ fontFamily: serif, fontSize: 14, lineHeight: 1.9, color: P.muted, marginBottom: 24, maxWidth: 560 }}>
        A transição é o que acontece <em>entre</em> dois estados. A curva de easing define se o movimento
        é mecânico ou orgânico. Passe o mouse sobre os cards abaixo e sinta a diferença.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
        <Panel>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Slider label="duração" value={duration} min={50} max={1200} unit="ms" onChange={setDuration} />
            <div>
              <Tag>timing-function</Tag>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                {easings.map(e => (
                  <Toggle key={e} label={e.length > 18 ? "spring" : e} active={easing === e} onClick={() => setEasing(e)} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <CodeBlock
              code={`.card {
  transition: all ${duration}ms
    ${easing};
}`}
              highlight={[duration + "ms", easing]}
            />
          </div>
        </Panel>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { prop: "transform: scale(1.04)", hover: { transform: "scale(1.04)" } },
            { prop: "border-color: gold", hover: { borderColor: P.gold } },
            { prop: "background: surface+", hover: { background: "#0f1520" } },
            { prop: "letter-spacing: wide", hover: { letterSpacing: "0.18em" } },
          ].map(({ prop, hover }) => (
            <HoverCard
              key={prop}
              label={prop}
              hoverStyle={hover}
              duration={duration}
              easing={easing}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HoverCard({ label, hoverStyle, duration, easing }: {
  label: string; hoverStyle: React.CSSProperties; duration: number; easing: string;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: P.surface,
        border: `1px solid ${P.border}`,
        padding: "20px 16px",
        cursor: "pointer",
        transition: `all ${duration}ms ${easing}`,
        ...(hov ? hoverStyle : {}),
      }}
    >
      <div style={{ fontFamily: mono, fontSize: 9, color: P.dim, letterSpacing: "0.15em" }}>HOVER</div>
      <div style={{ fontFamily: serif, fontSize: 12, color: P.muted, marginTop: 8 }}>{label}</div>
    </div>
  );
}

// ─── SEÇÃO 7: SÍNTESE ─────────────────────────────────────────────────────────

function Section7() {
  const [revealed, setRevealed] = useState(false);
  const [step, setStep] = useState(0);

  const steps = [
    "background + cores",
    "border + shadow",
    "tipografia",
    "animação de entrada",
    "hover + transição",
  ];

  useEffect(() => {
    if (!revealed) { setStep(0); return; }
    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= steps.length - 1) { clearInterval(interval); return prev; }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [revealed]);

  return (
    <section style={{ marginBottom: 80 }}>
      <SectionLabel n="07" label="Síntese — Tudo junto" />
      <p style={{ fontFamily: serif, fontSize: 14, lineHeight: 1.9, color: P.muted, marginBottom: 24, maxWidth: 560 }}>
        CSS não é sobre propriedades isoladas — é sobre a composição delas. Veja um card do Rapadura
        sendo construído camada por camada, cada propriedade adicionando uma camada de sentido.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Card sendo construído */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button
            onClick={() => { setRevealed(!revealed); setStep(0); }}
            style={{
              padding: "12px 20px", background: revealed ? P.border : P.gold,
              border: "none", color: revealed ? P.dim : P.bg,
              fontFamily: sans, fontSize: 10, letterSpacing: "0.2em",
              textTransform: "uppercase", fontWeight: 700, cursor: "pointer",
              transition: "all .3s",
            }}
          >
            {revealed ? "← resetar" : "construir o card →"}
          </button>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {steps.map((s, i) => (
              <div key={s} style={{
                display: "flex", alignItems: "center", gap: 10,
                opacity: revealed && i <= step ? 1 : 0.2,
                transition: `opacity .4s ${i * 0.1}s`,
              }}>
                <div style={{
                  width: 6, height: 6,
                  background: revealed && i <= step ? P.gold : P.border,
                  transition: "background .3s",
                }} />
                <span style={{ fontFamily: mono, fontSize: 9, color: P.dim, letterSpacing: "0.12em" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* The card */}
        <SynthesisCard revealed={revealed} step={step} />
      </div>

      {/* Final code */}
      {revealed && step >= 4 && (
        <div style={{ marginTop: 24, animation: "fadeSlide .5s ease forwards" }}>
          <CodeBlock
            code={`.fundo-card {
  /* 1. Base */
  background: #07090e;

  /* 2. Borda + sombra */
  border-left: 3px solid #c8963b;
  border: 1px solid #1a2030;
  box-shadow: 0 4px 24px rgba(200,150,59,.08);

  /* 3. Espaçamento */
  padding: 20px 24px;

  /* 4. Entrada */
  animation: fadeSlide .6s cubic-bezier(.22,1,.36,1);

  /* 5. Hover */
  transition: box-shadow .25s ease;
  cursor: pointer;
}
.fundo-card:hover {
  box-shadow: 0 8px 32px rgba(200,150,59,.18);
}`}
            highlight={["#c8963b", "animation", "transition"]}
          />
        </div>
      )}
    </section>
  );
}

function SynthesisCard({ revealed, step }: { revealed: boolean; step: number }) {
  const [hov, setHov] = useState(false);

  const hasBase    = revealed && step >= 0;
  const hasBorder  = revealed && step >= 1;
  const hasType    = revealed && step >= 2;
  const hasAnim    = revealed && step >= 3;
  const hasHover   = revealed && step >= 4;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      key={revealed ? "on" : "off"}
      style={{
        background: hasBase ? P.surface : "transparent",
        border: hasBorder ? `1px solid ${P.border}` : "1px solid transparent",
        borderLeft: hasBorder ? `3px solid ${P.gold}` : "3px solid transparent",
        boxShadow: hasBorder
          ? hov && hasHover
            ? `0 8px 32px rgba(200,150,59,.18)`
            : `0 4px 24px rgba(200,150,59,.08)`
          : "none",
        padding: "20px 24px",
        transition: hasHover ? "box-shadow .25s ease" : "none",
        cursor: hasHover ? "pointer" : "default",
        animation: hasAnim ? "fadeSlide .6s cubic-bezier(.22,1,.36,1)" : "none",
      }}
    >
      {hasType && (
        <>
          <div style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: P.gold, marginBottom: 10 }}>
            XP Agro 30 FIC FIM
          </div>
          <div style={{ fontFamily: mono, fontSize: 28, color: P.text, marginBottom: 6 }}>87</div>
          <div style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase", color: P.dim }}>
            Score de Atratividade
          </div>
          <div style={{ height: 2, background: P.border, marginTop: 14 }}>
            <div style={{ height: "100%", width: "87%", background: P.gold, transition: "width 1s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: P.dim }}>Confiança: 73</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: P.goldDim }}>D+30</span>
          </div>
        </>
      )}
      {!hasType && (
        <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: mono, fontSize: 9, color: P.dimmer }}>
            {!hasBase ? "vazio" : "aguardando tipografia…"}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export function CssTutorialPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = window.document.documentElement;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setProgress((scrollTop / (scrollHeight - clientHeight)) * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={scrollRef} style={{ background: P.bg, minHeight: "100vh", color: P.text }}>

      {/* Progress bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, height: 2,
        width: `${progress}%`, background: P.gold,
        zIndex: 99, transition: "width .1s linear",
      }} />

      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${P.border}`,
        padding: "0 40px",
        height: 48,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(4,5,7,0.95)", backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/aliancapanorama" style={{ fontFamily: mono, fontSize: 9, color: P.dimmer, letterSpacing: "0.15em", textDecoration: "none" }}>← PAP</a>
          <div style={{ width: 1, height: 16, background: P.border }} />
          <span style={{ fontFamily: serif, fontSize: 13, color: P.gold, letterSpacing: "0.12em" }}>Tutorial CSS</span>
        </div>
        <div style={{ fontFamily: mono, fontSize: 9, color: P.dimmer, letterSpacing: "0.12em" }}>
          {Math.round(progress)}%
        </div>
      </div>

      {/* Hero */}
      <div style={{
        maxWidth: 820, margin: "0 auto", padding: "72px 40px 64px",
        borderBottom: `1px solid ${P.border}`,
        marginBottom: 72,
      }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: P.dimmer, letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 16 }}>
          Sociedade Tucci · Plataforma PAP
        </div>
        <h1 style={{
          fontFamily: serif, fontSize: 42, fontWeight: 300,
          color: P.gold, letterSpacing: "0.04em",
          margin: "0 0 16px", lineHeight: 1.2,
        }}>
          CSS na Prática
        </h1>
        <p style={{
          fontFamily: serif, fontSize: 16, lineHeight: 1.9, color: P.muted,
          margin: "0 0 32px", maxWidth: 540,
        }}>
          Sete seções interativas sobre as propriedades que dão vida a interfaces.
          Cada demo é editável em tempo real — experimente, quebre, reconstrua.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {["Variáveis", "Box Model", "Tipografia", "Flexbox", "Animações", "Transições", "Síntese"].map((s, i) => (
            <div key={s} style={{
              padding: "6px 14px",
              border: `1px solid ${P.border}`,
              fontFamily: mono, fontSize: 9,
              color: P.dim, letterSpacing: "0.12em",
            }}>
              {String(i + 1).padStart(2, "0")} {s}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "0 40px 120px" }}>
        <Section1 />
        <Section2 />
        <Section3 />
        <Section4 />
        <Section5 />
        <Section6 />
        <Section7 />

        {/* Final */}
        <div style={{
          borderTop: `1px solid ${P.border}`,
          paddingTop: 48, textAlign: "center",
        }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: P.muted, marginBottom: 8 }}>
            CSS é uma linguagem de intenção.
          </div>
          <div style={{ fontFamily: serif, fontSize: 13, color: P.dimmer, fontStyle: "italic" }}>
            Cada propriedade é uma decisão sobre como o mundo deve parecer.
          </div>
          <div style={{ marginTop: 32 }}>
            <a href="/aliancapanorama/rapadura" style={{
              display: "inline-block", padding: "12px 28px",
              background: P.gold, color: P.bg, textDecoration: "none",
              fontFamily: sans, fontSize: 10, letterSpacing: "0.2em",
              textTransform: "uppercase", fontWeight: 700,
              transition: "opacity .2s",
            }}>
              Ir para o Rapadura →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
