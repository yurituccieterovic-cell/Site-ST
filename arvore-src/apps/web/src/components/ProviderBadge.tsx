interface Props {
  provider?: string;
  voice?: string;
  model?: string;
}

const VOICE_LABELS: Record<string, { emoji: string; label: string; color: string }> = {
  veloz:     { emoji: "⚡", label: "Veloz",     color: "#f0c040" },
  expansiva: { emoji: "🌿", label: "Expansiva", color: "#3fb950" },
  minima:    { emoji: "🪨", label: "Mínima",    color: "#8b949e" },
  livre:     { emoji: "🌊", label: "Livre",     color: "#58a6ff" },
};

export function ProviderBadge({ provider, voice, model }: Props) {
  if (!provider && !voice) return null;
  const info = voice ? VOICE_LABELS[voice] : { emoji: "🤖", label: provider ?? "", color: "#8b949e" };
  return (
    <span
      title={model ?? provider}
      style={{
        fontSize: "11px",
        color: info.color,
        padding: "2px 6px",
        border: `1px solid ${info.color}40`,
        borderRadius: "12px",
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      {info.emoji} {info.label}
    </span>
  );
}
