const MOUTH_PATHS = {
  closed: "M82 112 Q96 112 110 112",
  semi:   "M82 112 Q96 118 110 112",
  open:   "M82 110 Q96 122 110 110",
  smile:  "M80 111 Q96 120 112 111",
};

export default function Avatar({ mouthState = "semi", isSpeaking, isListening }) {
  const cls = isSpeaking ? "speaking" : isListening ? "listening" : "idle";

  return (
    <div className={`avatar-wrap ${cls}`}>
      <svg viewBox="0 0 192 192" className="avatar-svg" aria-hidden="true">
        {/* Glow halo */}
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isSpeaking ? "#06b6d4" : "#7c3aed"} stopOpacity=".18"/>
            <stop offset="100%" stopColor="#0a0a0f" stopOpacity="0"/>
          </radialGradient>
          <filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
        </defs>
        <circle cx="96" cy="96" r="90" fill="url(#glow)"/>

        {/* Outer orbital ring */}
        <circle cx="96" cy="96" r="80" fill="none"
          stroke={isSpeaking ? "#06b6d4" : "#7c3aed"}
          strokeWidth="1.2" strokeDasharray="10 7" opacity=".5"
          className="ring-outer"/>

        {/* Inner orbital */}
        <circle cx="96" cy="96" r="64" fill="none"
          stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="3 9" opacity=".35"
          className="ring-inner"/>

        {/* Head */}
        <ellipse cx="96" cy="100" rx="44" ry="50" fill="#0d0d1e" stroke="#1e1e3a" strokeWidth="1.5"/>

        {/* Hair — abstract feminine crown */}
        <path d="M52 88 Q55 52 96 42 Q137 52 140 88"
          stroke="#7c3aed" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M58 82 Q62 56 96 48 Q130 56 134 82"
          stroke="#06b6d4" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity=".6"/>
        {/* Hair accent strands */}
        <path d="M70 58 Q68 46 72 38" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".5"/>
        <path d="M122 58 Q124 46 120 38" stroke="#7c3aed" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".5"/>
        <path d="M96 42 Q93 34 96 28" stroke="#06b6d4" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".7"/>

        {/* Eyes — almond shape */}
        <path d="M74 92 Q82 84 90 92 Q82 100 74 92Z" fill="#7c3aed"/>
        <path d="M102 92 Q110 84 118 92 Q110 100 102 92Z" fill="#7c3aed"/>
        {/* Iris */}
        <ellipse cx="82" cy="92" rx="3" ry="3.5" fill="#0a0a0f"/>
        <ellipse cx="110" cy="92" rx="3" ry="3.5" fill="#0a0a0f"/>
        {/* Eye highlights */}
        <ellipse cx="84" cy="90" rx="1.5" ry="1.2" fill="white" opacity=".9"/>
        <ellipse cx="112" cy="90" rx="1.5" ry="1.2" fill="white" opacity=".9"/>

        {/* Nose — subtle */}
        <path d="M93 103 Q96 107 99 103" stroke="#1e1e3a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

        {/* Mouth — animated */}
        <path d={MOUTH_PATHS[mouthState] ?? MOUTH_PATHS.semi}
          stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" fill="none"
          className="av-mouth"/>

        {/* Cheek blush */}
        <ellipse cx="70" cy="108" rx="9" ry="5" fill="#7c3aed" opacity=".08"/>
        <ellipse cx="122" cy="108" rx="9" ry="5" fill="#7c3aed" opacity=".08"/>

        {/* Neck */}
        <path d="M88 148 Q96 152 104 148 L102 160 Q96 163 90 160Z" fill="#0d0d1e" stroke="#1e1e3a" strokeWidth="1"/>
      </svg>
    </div>
  );
}
